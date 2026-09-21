import React from 'react';

interface Props {
  content: string;
  className?: string;
}

/**
 * Safe, resilient Markdown renderer that formats bold, italic, lists, paragraphs,
 * and links WITHOUT displaying raw asterisks (** or *) and without unsafe HTML injection.
 */
export const SafeMarkdown: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into paragraphs / line blocks
  const paragraphs = content.split(/\n{2,}/);

  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matches:
    // 1. Bold: **text** or __text__
    // 2. Italic: *text* or _text_
    // 3. Link: [label](url)
    // 4. Inline code: `code`
    const regex = /(\*\*[^*]+\*\*|__[^*]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Bold: **text** or __text__
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {inner}
          </strong>
        );
      }

      // Italic: *text* or _text_
      if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        const inner = part.slice(1, -1);
        return (
          <em key={idx} className="italic text-slate-800">
            {inner}
          </em>
        );
      }

      // Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') || url.startsWith('mailto:')
          ? url
          : '#';
        return (
          <a
            key={idx}
            href={safeUrl}
            target={safeUrl.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer noopener"
            className="text-[#00008F] underline hover:text-blue-800 font-medium"
          >
            {label}
          </a>
        );
      }

      // Inline code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        return (
          <code key={idx} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[12px] text-blue-900">
            {inner}
          </code>
        );
      }

      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div className={`space-y-2 text-slate-800 ${className}`}>
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');

        // Check if paragraph is an unorganized list (bullets)
        const isBulletList = lines.every((l) => /^\s*([*•\-]|(\d+\.))\s+/.test(l));

        if (isBulletList) {
          const isNumbered = /^\s*\d+\.\s+/.test(lines[0]);
          if (isNumbered) {
            return (
              <ol key={pIdx} className="list-decimal pl-5 space-y-1 my-1">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^\s*\d+\.\s+/, '');
                  return <li key={lIdx}>{renderInline(cleaned)}</li>;
                })}
              </ol>
            );
          }
          return (
            <ul key={pIdx} className="list-disc pl-5 space-y-1 my-1">
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^\s*[*•\-]\s+/, '');
                return <li key={lIdx}>{renderInline(cleaned)}</li>;
              })}
            </ul>
          );
        }

        // Check if mixed with bullet items
        return (
          <p key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => {
              const isBullet = /^\s*[*•\-]\s+/.test(line);
              const isNumbered = /^\s*\d+\.\s+/.test(line);

              if (isBullet) {
                const cleaned = line.replace(/^\s*[*•\-]\s+/, '');
                return (
                  <span key={lIdx} className="block pl-4 relative my-0.5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#00008F]" />
                    {renderInline(cleaned)}
                  </span>
                );
              }

              if (isNumbered) {
                const match = line.match(/^\s*(\d+\.)\s+(.*)/);
                return (
                  <span key={lIdx} className="block pl-4 relative my-0.5 font-medium">
                    <span className="text-[#00008F] font-bold mr-1">{match?.[1]}</span>
                    {renderInline(match?.[2] || line)}
                  </span>
                );
              }

              return (
                <React.Fragment key={lIdx}>
                  {lIdx > 0 && <br />}
                  {renderInline(line)}
                </React.Fragment>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};
