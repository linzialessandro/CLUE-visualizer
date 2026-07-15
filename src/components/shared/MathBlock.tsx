import { useMemo } from 'react';
import katex from 'katex';

interface MathBlockProps {
  /** LaTeX string to render */
  tex: string;
  /** If true, renders in display mode (centered, larger). Default: false (inline). */
  display?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Renders a KaTeX math expression.
 * Uses dangerouslySetInnerHTML for performance (KaTeX output is safe).
 */
export default function MathBlock({ tex, display = false, className = '' }: MathBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return `<span style="color: var(--color-diverge);">${tex}</span>`;
    }
  }, [tex, display]);

  if (display) {
    return (
      <div
        className={`katex-display ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
