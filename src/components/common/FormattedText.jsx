import React from 'react';

/**
 * Safely parses inline markdown bold text (**word**) into React <strong> nodes
 * without using dangerouslySetInnerHTML, preventing any XSS vulnerabilities.
 */
export function renderFormattedNodes(text) {
  if (!text || typeof text !== 'string') return text || null;

  // Split by bold markdown **...**
  // Capturing group keeps the delimiters in the split array
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} style={{ fontWeight: 800, color: 'inherit' }}>
          {inner}
        </strong>
      );
    }
    return part;
  });
}

/**
 * FormattedText component for safe rich-text rendering across public pages.
 */
export default function FormattedText({
  text,
  as: Component = 'span',
  className = '',
  style = {},
  paragraphs = false,
}) {
  if (!text) return null;

  if (paragraphs && typeof text === 'string') {
    const paras = text.split(/\n\s*\n/);
    return (
      <div className={className} style={style}>
        {paras.map((p, pIdx) => (
          <p key={pIdx} style={{ marginBottom: pIdx === paras.length - 1 ? 0 : '1rem', lineHeight: 1.7 }}>
            {renderFormattedNodes(p)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <Component className={className} style={style}>
      {renderFormattedNodes(text)}
    </Component>
  );
}
