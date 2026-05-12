'use client';

import { useState } from 'react';

interface RelinkResult {
  nodes_processed: number;
  edges_created: number;
  dry_run: boolean;
}

export function RelinkTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RelinkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRelink = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/graph/relink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json() as { data?: RelinkResult; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Relink failed');
      if (json.data) setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Relink failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-cof-bg-elevated border border-cof-border rounded-lg p-4 space-y-3">
      <p className="text-xs text-cof-text-secondary">
        Re-run LLM connection analysis across all promoted nodes. Useful after bulk uploads
        where nodes were processed before their siblings existed in the graph. Each node is
        compared against the full corpus — takes ~1s per node.
      </p>
      <button
        type="button"
        onClick={() => { void handleRelink(); }}
        disabled={isRunning}
        className="text-xs px-3 py-1.5 bg-[#185FA5] text-white rounded-md disabled:opacity-50"
      >
        {isRunning ? 'Running — this may take a few minutes…' : 'Re-link graph'}
      </button>
      {result && (
        <div className="text-xs text-cof-text-secondary bg-cof-bg rounded px-3 py-2 space-y-0.5">
          <div>Nodes processed: <span className="text-cof-text-primary">{result.nodes_processed}</span></div>
          <div>New edges created: <span className="text-cof-text-primary font-medium">{result.edges_created}</span></div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
