'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SimpleReviewClient } from '@/components/review/SimpleReviewClient';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Node, HumanReview } from '@/lib/types/nodes';

const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'in', 'to', 'and', 'for', 'is', 'as', 'on', 'by', 'at', 'or', 'not']);

function getKeywords(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function findBestMatch(targetTitle: string, candidates: { id: string; title: string }[]): { id: string; title: string } | null {
  const exact = candidates.find(n => n.title === targetTitle);
  if (exact) return exact;
  const sub = candidates.find(n => n.title.toLowerCase().includes(targetTitle.toLowerCase()))
    ?? candidates.find(n => targetTitle.toLowerCase().includes(n.title.toLowerCase()));
  if (sub) return sub;
  const searchWords = getKeywords(targetTitle);
  if (searchWords.length === 0) return null;
  let bestScore = 0;
  let bestMatch: { id: string; title: string } | null = null;
  for (const candidate of candidates) {
    const candidateWords = getKeywords(candidate.title);
    const overlap = searchWords.filter(w => candidateWords.some(cw => cw.includes(w) || w.includes(cw))).length;
    if (overlap > 0 && overlap > bestScore) {
      bestScore = overlap;
      bestMatch = candidate;
    }
  }
  return bestMatch;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [node, setNode] = useState<Node | null>(null);
  const [childNodes, setChildNodes] = useState<Node[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNode = async () => {
      const supabase = createClient();
      const [{ data: nodeData, error: nodeError }, { data: childNodesData }] = await Promise.all([
        supabase.from('nodes').select('*').eq('id', params.id).single(),
        supabase
          .from('nodes')
          .select('*')
          .eq('parent_node_id', params.id as string)
          .order('created_at', { ascending: true }),
      ]);
      if (nodeError || !nodeData) {
        setFetchError('Failed to load entry.');
        return;
      }
      setNode(nodeData as unknown as Node);
      if (childNodesData) setChildNodes(childNodesData as unknown as Node[]);
    };
    fetchNode();
  }, [params.id]);

  const handlePromote = async (note: string) => {
    setIsSubmitting(true);
    setPromoteError(null);
    try {
      const supabase = createClient();
      const nodeId = params.id as string;

      const humanReview: HumanReview = {
        reviewed_at: new Date().toISOString(),
        reviewer_id: node?.author_id ?? '',
        note: note.trim() || undefined,
        fields: {},
        connections_accepted: [],
        connections_rejected: [],
        connections_added: [],
      };

      const { error: updateError } = await supabase
        .from('nodes')
        .update({ human_review: humanReview, status: 'promoted' })
        .eq('id', nodeId);
      if (updateError) throw new Error(`Status update failed: ${updateError.message}`);

      // Auto-accept all LLM-suggested connections (upsert — edges may already exist from processing)
      const suggested = node?.llm_extraction?.suggested_connections ?? [];
      if (suggested.length > 0) {
        const { data: allNodes } = await supabase
          .from('nodes')
          .select('id, title')
          .in('status', ['promoted', 'human_reviewed'])
          .neq('id', nodeId);
        if (allNodes && allNodes.length > 0) {
          const edges = suggested
            .map(conn => {
              const target = findBestMatch(conn.target_title, allNodes);
              if (!target) return null;
              return { source_id: nodeId, target_id: target.id, edge_type: conn.edge_type, weight: 1 };
            })
            .filter((e): e is NonNullable<typeof e> => e !== null);
          if (edges.length > 0) {
            const { error: edgesError } = await supabase
              .from('edges')
              .upsert(edges, { onConflict: 'source_id,target_id,edge_type', ignoreDuplicates: true });
            if (edgesError) throw new Error(`Edge insert failed: ${edgesError.message}`);
          }
        }
      }

      // Auto-accept goal relevance suggestions — verify each outcome_id exists first
      const goalRelevance = node?.llm_extraction?.goal_relevance ?? [];
      if (goalRelevance.length > 0) {
        const outcomeIds = goalRelevance.map(gr => gr.outcome_id).filter(Boolean);
        if (outcomeIds.length > 0) {
          const { data: validOutcomes } = await supabase
            .from('nodes')
            .select('id')
            .in('id', outcomeIds);
          const validIds = new Set((validOutcomes ?? []).map(n => n.id as string));
          const goalEdges = goalRelevance
            .filter(gr => validIds.has(gr.outcome_id))
            .map(gr => ({ source_id: nodeId, target_id: gr.outcome_id, edge_type: 'targets_outcome', weight: 1 }));
          if (goalEdges.length > 0) {
            const { error: goalEdgesError } = await supabase
              .from('edges')
              .upsert(goalEdges, { onConflict: 'source_id,target_id,edge_type', ignoreDuplicates: true });
            if (goalEdgesError) throw new Error(`Goal edge insert failed: ${goalEdgesError.message}`);
          }
        }
      }

      // Fire-and-forget activity log
      supabase.from('activity_log').insert({
        actor_id: node?.author_id ?? null,
        action: 'promoted',
        target_node_id: nodeId,
        details: { from_status: node?.status },
      }).then(() => {});

      router.refresh();
      router.push('/review');
    } catch (err) {
      setPromoteError(err instanceof Error ? err.message : 'Promote failed — try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: archiveError } = await supabase.from('nodes').update({ status: 'archived' }).eq('id', params.id);
      if (archiveError) throw archiveError;
      const { error: activityError } = await supabase.from('activity_log').insert({
        action: 'archived',
        target_node_id: params.id as string,
      });
      if (activityError) throw activityError;
      router.push('/capture');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">{fetchError}</p>
        <Link href="/capture" className="text-sm text-[#185FA5] mt-2 inline-block">
          Back to capture
        </Link>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-48" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!node.llm_extraction || node.status === 'raw' || node.status === 'processing') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">This entry is still being processed.</p>
        <p className="text-sm text-gray-600 mt-1">Check back in a moment.</p>
        <Link href="/capture" className="text-sm text-[#185FA5] mt-3 inline-block">
          Back to capture
        </Link>
      </div>
    );
  }

  if (node.status === 'promoted' || node.status === 'archived') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">This entry has already been {node.status}.</p>
        <Link href="/capture" className="text-sm text-[#185FA5] mt-2 inline-block">
          Back to capture
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-200">{node.title}</h1>
        {node.description && (
          <p className="mt-1 text-sm text-gray-500">{node.description}</p>
        )}
      </div>
      {childNodes.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {node.node_type === 'meeting_notes' ? 'Meeting Summary' : 'Document Summary'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((node.llm_extraction as unknown as Record<string, unknown> | null)?.meeting_summary as string | undefined)
                ?? ((node.llm_extraction as unknown as Record<string, unknown> | null)?.document_summary as string | undefined)
                ?? 'No summary available'}
            </p>
            <div className="mt-2 text-[10px] text-gray-400">
              {childNodes.length} node{childNodes.length !== 1 ? 's' : ''} extracted
            </div>
          </div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Extracted Nodes — Review Each
          </h3>
          <div className="space-y-2">
            {childNodes.map(child => (
              <Link
                key={child.id}
                href={`/capture/${child.id}/review`}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-800 dark:text-gray-200 truncate">{child.title}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-600 mt-0.5">
                    {child.node_type} · {(child.content as Record<string, unknown> | null)?.category as string ?? 'extracted'}
                  </div>
                </div>
                <StatusBadge status={child.status} />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {promoteError && (
            <p className="mb-4 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded px-3 py-2">
              {promoteError}
            </p>
          )}
          <SimpleReviewClient
            node={node}
            onPromote={handlePromote}
            onArchive={handleArchive}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </div>
  );
}
