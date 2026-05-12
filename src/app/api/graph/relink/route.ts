import { createClient } from '@/lib/supabase/server';
import { runRelink } from '@/lib/agents/relink';
import { NextResponse } from 'next/server';

export const maxDuration = 300;

const VALID_EDGE_TYPES = new Set([
  'supports', 'contradicts', 'requires', 'evolved_from', 'tested_by',
  'challenges', 'mentioned_in', 'advances_goal', 'targets_outcome',
  'indicates_progress', 'assigned_to_outcome', 'related_to',
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { dry_run?: boolean; limit?: number };
  const dryRun = body.dry_run === true;
  const nodeLimit = typeof body.limit === 'number' ? body.limit : 200;

  const { data: allNodes, error: fetchError } = await supabase
    .from('nodes')
    .select('id, title, node_type, description, llm_extraction')
    .in('status', ['promoted', 'human_reviewed'])
    .order('created_at', { ascending: true })
    .limit(nodeLimit);

  if (fetchError || !allNodes) {
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }

  const corpusIndex = allNodes.map(n => ({ id: n.id as string, title: n.title as string, node_type: n.node_type as string }));

  let edgesCreated = 0;
  let nodesProcessed = 0;

  for (const node of allNodes) {
    const llmExtraction = node.llm_extraction as Record<string, unknown> | null;
    const description =
      (llmExtraction?.summary as string | undefined) ??
      (llmExtraction?.document_summary as string | undefined) ??
      (node.description as string | undefined) ??
      '';

    const otherNodes = corpusIndex.filter(n => n.id !== node.id);
    const suggestions = await runRelink(
      { title: node.title as string, node_type: node.node_type as string, description },
      otherNodes,
    );

    nodesProcessed++;

    if (dryRun || suggestions.length === 0) continue;

    for (const suggestion of suggestions) {
      if (!VALID_EDGE_TYPES.has(suggestion.edge_type)) continue;

      const target = corpusIndex.find(
        n => n.id !== node.id && n.title.toLowerCase() === suggestion.target_title.toLowerCase(),
      );
      if (!target) continue;

      const { error } = await supabase
        .from('edges')
        .upsert(
          { source_id: node.id, target_id: target.id, edge_type: suggestion.edge_type, weight: 1 },
          { onConflict: 'source_id,target_id,edge_type', ignoreDuplicates: true },
        );

      if (!error) edgesCreated++;
    }
  }

  return NextResponse.json({
    data: { nodes_processed: nodesProcessed, edges_created: edgesCreated, dry_run: dryRun },
  });
}
