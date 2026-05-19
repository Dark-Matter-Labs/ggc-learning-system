import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MarkdownContentProps {
  readonly content: string;
  readonly className?: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-semibold text-cof-text-primary mt-4 mb-1 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-cof-text-primary mt-3 mb-1 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs font-semibold text-cof-text-secondary mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-cof-text-secondary leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-sm text-cof-text-secondary space-y-0.5 mb-2 last:mb-0 pl-4 list-disc">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm text-cof-text-secondary space-y-0.5 mb-2 last:mb-0 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-cof-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-cof-text-secondary">{children}</em>
  ),
  code: ({ children }) => (
    <code className="text-xs font-mono bg-cof-bg-elevated text-node-hunch px-1 py-0.5 rounded">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-cof-border pl-3 text-cof-text-tertiary italic my-2">{children}</blockquote>
  ),
  hr: () => <hr className="border-cof-border my-3" />,
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
