export type CaptureTypeId =
  // Context model
  | 'hunch'
  | 'assumption'
  | 'signal'
  | 'friction'
  | 'learning'
  // Commitment model
  | 'experiment'
  | 'outcome'
  | 'commitment'
  | 'intervention'
  | 'decision'
  // Entity model
  | 'person'
  // Utility
  | 'meeting_notes';

export type CaptureField =
  | 'hunch_type'
  | 'confidence'
  | 'external_link'
  | 'expected_signals'
  | 'meeting_date'
  | 'participants'
  | 'insight_date';

export interface CaptureTypeConfig {
  readonly id: CaptureTypeId;
  readonly label: string;
  readonly nodeType: string;
  readonly description: string;
  readonly fields: readonly CaptureField[];
  readonly supportsExtraction: boolean;
  readonly multiNodeExtraction: boolean;
  readonly graph: {
    readonly color: string;
    readonly visible: boolean;
  };
  readonly llm: {
    readonly description: string;
  };
  readonly isKnowledgeNode: boolean;
  readonly isDistillable: boolean;
}

// ─── Deployment-level config ─────────────────────────────────────────────────
// Change these in a fork to match the tenant's vocabulary and domain.

export const ORG_CONTEXT = 'xCO (Expanding Civilisational Optionality), a formation studio working at the intersection of civilisational risk, institutional design, and transition finance';

export const DOMAIN_TAGS: readonly string[] = [
  'dartmoor', 'madrid', 'copenhagen', 'antarctica',
  'capital_strategy', 'formation', 'demand_architecture',
  'philanthropy', 'natural_assets', 'carbon', 'water',
];

/** The node type that gets the dedicated GoalSpacePanel in the graph. */
export const GOAL_CONTAINER_TYPE = 'experiment';

/** The node type representing measurable outcomes. */
export const OUTCOME_TYPE = 'outcome';

// ─── Node type definitions ────────────────────────────────────────────────────

export const CAPTURE_TYPES: readonly CaptureTypeConfig[] = [
  // ── Context model ──────────────────────────────────────────────────────────
  {
    id: 'hunch',
    label: 'Hunch',
    nodeType: 'hunch',
    description: 'A directional belief about how governance change happens',
    fields: ['hunch_type', 'confidence', 'external_link', 'expected_signals', 'insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#7F77DD', visible: true },
    llm: { description: 'A directional belief or starting hypothesis behind an experiment' },
    isKnowledgeNode: false,
    isDistillable: true,
  },
  {
    id: 'assumption',
    label: 'Assumption',
    nodeType: 'assumption',
    description: 'A testable proposition an experiment depends on',
    fields: ['confidence', 'insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#1D9E75', visible: true },
    llm: { description: 'A testable if/then proposition that an experiment depends on' },
    isKnowledgeNode: false,
    isDistillable: true,
  },
  {
    id: 'signal',
    label: 'Signal',
    nodeType: 'signal',
    description: 'A raw observation from reality — something said, seen, or encountered',
    fields: ['confidence', 'expected_signals', 'insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#A32D2D', visible: true },
    llm: { description: 'A raw observation from reality — something said, seen, or encountered in the work' },
    isKnowledgeNode: true,
    isDistillable: false,
  },
  {
    id: 'friction',
    label: 'Friction',
    nodeType: 'friction',
    description: 'A specific blocker, tension, or resistance',
    fields: ['confidence', 'insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#D85A30', visible: true },
    llm: { description: 'A specific blocker, tension, or resistance encountered in the work' },
    isKnowledgeNode: true,
    isDistillable: true,
  },
  {
    id: 'learning',
    label: 'Learning',
    nodeType: 'learning',
    description: 'A synthesised insight derived from signals and frictions',
    fields: ['confidence', 'insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#378ADD', visible: true },
    llm: { description: 'A synthesised insight derived from signals and frictions — what we now think we know' },
    isKnowledgeNode: true,
    isDistillable: true,
  },
  // ── Commitment model ───────────────────────────────────────────────────────
  {
    id: 'experiment',
    label: 'Experiment',
    nodeType: 'experiment',
    description: 'A structured unit of inquiry',
    fields: ['insight_date'],
    supportsExtraction: false,
    multiNodeExtraction: false,
    graph: { color: '#0F6E56', visible: true },
    llm: { description: 'A structured unit of inquiry — the GGC equivalent of a goal space' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
  {
    id: 'outcome',
    label: 'Outcome',
    nodeType: 'outcome',
    description: 'A specific intended outcome of an experiment',
    fields: ['insight_date'],
    supportsExtraction: false,
    multiNodeExtraction: false,
    graph: { color: '#085041', visible: true },
    llm: { description: 'A specific intended outcome of an experiment, mapping to a baseline survey dimension where applicable' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
  {
    id: 'commitment',
    label: 'Commitment',
    nodeType: 'commitment',
    description: 'Individual or organisational commitment from the social contract',
    fields: ['insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#185FA5', visible: true },
    llm: { description: 'An individual or organisational commitment from the social contract' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
  {
    id: 'intervention',
    label: 'Intervention',
    nodeType: 'intervention',
    description: 'A concrete change implemented — new ritual, role, or process',
    fields: ['insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#BA7517', visible: true },
    llm: { description: 'A concrete change implemented (new ritual, role, process) that serves a commitment and/or tests an assumption' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
  {
    id: 'decision',
    label: 'Decision',
    nodeType: 'decision',
    description: 'A choice or direction taken, distinct from its implementation',
    fields: ['insight_date'],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#D4537E', visible: true },
    llm: { description: 'A choice or direction taken, distinct from its implementation — the register of what got resolved' },
    isKnowledgeNode: false,
    isDistillable: true,
  },
  // ── Entity model ───────────────────────────────────────────────────────────
  {
    id: 'person',
    label: 'Person',
    nodeType: 'person',
    description: 'Anyone in the organisation',
    fields: [],
    supportsExtraction: true,
    multiNodeExtraction: false,
    graph: { color: '#888780', visible: true },
    llm: { description: 'Anyone in the organisation' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
  // ── Utility ────────────────────────────────────────────────────────────────
  {
    id: 'meeting_notes',
    label: 'Meeting Notes / Transcript',
    nodeType: 'meeting_notes',
    description: 'A call or meeting transcript — extracts multiple nodes',
    fields: ['meeting_date', 'participants'],
    supportsExtraction: true,
    multiNodeExtraction: true,
    graph: { color: '#888780', visible: false },
    llm: { description: 'A meeting or call transcript' },
    isKnowledgeNode: false,
    isDistillable: false,
  },
] as const;

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getCaptureType(id: CaptureTypeId): CaptureTypeConfig | undefined {
  return CAPTURE_TYPES.find(t => t.id === id);
}

export function getInlineTypes(): readonly CaptureTypeConfig[] {
  return CAPTURE_TYPES.filter(t => !t.multiNodeExtraction);
}

export function getPageTypes(): readonly CaptureTypeConfig[] {
  return CAPTURE_TYPES;
}

export function getStructuralTypes(): readonly CaptureTypeConfig[] {
  const structuralIds: readonly CaptureTypeId[] = ['hunch', 'experiment', 'outcome', 'commitment', 'person'];
  return CAPTURE_TYPES.filter(t => structuralIds.includes(t.id));
}

// ─── Derived config helpers ───────────────────────────────────────────────────
// These are the primary seam for a fork — consuming code imports these rather
// than hardcoding strings, so a fork only needs to change this file.

/** Node type options for the graph type filter. */
export function getGraphTypes(): ReadonlyArray<{ readonly id: string; readonly label: string; readonly color: string }> {
  return CAPTURE_TYPES
    .filter(t => t.graph.visible)
    .map(t => ({ id: t.id, label: t.label, color: t.graph.color }));
}

/** Node types that surface in the Health page "awaiting review" section. */
export function getKnowledgeReviewTypes(): readonly string[] {
  return CAPTURE_TYPES
    .filter(t => t.isKnowledgeNode)
    .map(t => t.id);
}

/** Pipe-separated node type string for LLM prompt JSON schemas. */
export function getLlmNodeTypeEnum(): string {
  return CAPTURE_TYPES
    .filter(t => t.supportsExtraction && !t.multiNodeExtraction)
    .map(t => t.id)
    .join('|');
}

/** Bulleted node type descriptions for LLM prompts. */
export function getLlmNodeTypeDescriptions(): string {
  return CAPTURE_TYPES
    .filter(t => t.supportsExtraction && !t.multiNodeExtraction)
    .map(t => `   - ${t.id}: ${t.llm.description}`)
    .join('\n');
}

/** Node types the distillation agent can merge nodes into. */
export function getDistillableTypes(): readonly string[] {
  return CAPTURE_TYPES
    .filter(t => t.isDistillable)
    .map(t => t.id);
}
