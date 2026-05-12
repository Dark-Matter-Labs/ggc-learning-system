import { callLLM } from '@/lib/llm';
import { ORG_CONTEXT } from '@/lib/config/captureTypes';

export interface RelinkSuggestion {
  readonly target_title: string;
  readonly edge_type: string;
  readonly rationale: string;
}

const RELINK_SYSTEM_PROMPT = `You are a knowledge graph connection specialist for ${ORG_CONTEXT}.

Given a single node and a list of other nodes in the knowledge graph, identify which nodes should be connected to it.

Return ONLY valid JSON:
{
  "connections": [
    { "target_title": "exact title from the node list", "edge_type": "one of the valid types", "rationale": "brief reason" }
  ]
}

Valid edge types:
- supports: this node provides evidence for or strengthens the target
- contradicts: this node conflicts with or challenges the target
- requires: this node depends on or needs the target to be true
- evolved_from: this node developed from or builds on the target
- challenges: this node questions or problematizes the target
- tested_by: this node is an experiment/test of the target
- indicates_progress: this node shows progress toward the target outcome
- targets_outcome: this node is working toward the target outcome
- related_to: general semantic relationship when no specific type fits

Rules:
1. Only suggest connections where there is a clear, meaningful relationship
2. Use the EXACT title from the provided node list — no paraphrasing
3. Prefer specific edge types over "related_to"
4. Return an empty connections array if no strong connections exist
5. Suggest at most 5 connections per node`;

export function buildRelinkPrompt(
  node: { title: string; node_type: string; description: string },
  otherNodes: ReadonlyArray<{ id: string; title: string; node_type: string }>,
): string {
  const lines: string[] = [
    'Node to connect:',
    `Type: ${node.node_type}`,
    `Title: ${node.title}`,
    `Content: ${node.description.slice(0, 500)}`,
    '',
    'Other nodes in the graph:',
  ];

  for (const n of otherNodes) {
    lines.push(`- [${n.node_type}] ${n.title}`);
  }

  lines.push('', 'Identify which of these nodes should be connected to the node above. Return only strong, meaningful connections.');
  return lines.join('\n');
}

export function parseRelinkResponse(content: string): RelinkSuggestion[] {
  const cleaned = content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as { connections?: unknown[] };
    if (!Array.isArray(parsed.connections)) return [];
    return parsed.connections.filter(
      (c): c is RelinkSuggestion =>
        typeof (c as RelinkSuggestion).target_title === 'string' &&
        typeof (c as RelinkSuggestion).edge_type === 'string',
    );
  } catch {
    return [];
  }
}

export async function runRelink(
  node: { title: string; node_type: string; description: string },
  otherNodes: ReadonlyArray<{ id: string; title: string; node_type: string }>,
): Promise<RelinkSuggestion[]> {
  if (otherNodes.length === 0) return [];

  const response = await callLLM('relink', {
    systemPrompt: RELINK_SYSTEM_PROMPT,
    userMessage: buildRelinkPrompt(node, otherNodes),
    maxTokens: 1024,
    temperature: 0.2,
  });

  return parseRelinkResponse(response.content);
}
