import React, { useRef, useState } from 'react';
import { Bold, Eye, Edit3 } from 'lucide-react';
import FormattedText from './FormattedText';

/**
 * RichTextArea component with a [B] Bold formatting toolbar and keyboard shortcut support.
 * Allows making individual words, characters, or selected ranges bold (**text**),
 * or removing bold formatting seamlessly.
 */
export default function RichTextArea({
  label,
  value = '',
  onChange,
  name,
  placeholder = '',
  rows = 4,
  required = false,
  className = 'admin-textarea',
  style = {},
  helperText = 'Select any word or character and click [B] to make it bold.'
}) {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const toggleBold = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value || '';

    let newText = text;
    let newStart = start;
    let newEnd = end;

    if (start !== end) {
      // Text is selected
      const selected = text.slice(start, end);

      // 1. Check if the selection itself is wrapped in **...**
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
        const unwrapped = selected.slice(2, -2);
        newText = text.slice(0, start) + unwrapped + text.slice(end);
        newStart = start;
        newEnd = start + unwrapped.length;
      }
      // 2. Check if the selection is immediately surrounded by ** and **
      else if (start >= 2 && end <= text.length - 2 && text.slice(start - 2, start) === '**' && text.slice(end, end + 2) === '**') {
        newText = text.slice(0, start - 2) + selected + text.slice(end + 2);
        newStart = start - 2;
        newEnd = end - 2;
      }
      // 3. Otherwise wrap selection with **
      else {
        newText = text.slice(0, start) + `**${selected}**` + text.slice(end);
        newStart = start;
        newEnd = end + 4;
      }
    } else {
      // No text selected: expand to current word under cursor, or insert placeholder
      const leftPart = text.slice(0, start);
      const rightPart = text.slice(start);
      const lastWordMatch = leftPart.match(/(\w+)$/);
      const nextWordMatch = rightPart.match(/^(\w+)/);

      if (lastWordMatch || nextWordMatch) {
        const wordStart = lastWordMatch ? start - lastWordMatch[1].length : start;
        const wordEnd = nextWordMatch ? start + nextWordMatch[1].length : start;
        const word = text.slice(wordStart, wordEnd);

        // Check if word is already wrapped with **
        if (wordStart >= 2 && wordEnd <= text.length - 2 && text.slice(wordStart - 2, wordStart) === '**' && text.slice(wordEnd, wordEnd + 2) === '**') {
          newText = text.slice(0, wordStart - 2) + word + text.slice(wordEnd + 2);
          newStart = wordStart - 2;
          newEnd = wordEnd - 2;
        } else {
          newText = text.slice(0, wordStart) + `**${word}**` + text.slice(wordEnd);
          newStart = wordStart;
          newEnd = wordEnd + 4;
        }
      } else {
        // Insert empty bold token
        newText = text.slice(0, start) + '**bold text**' + text.slice(start);
        newStart = start + 2;
        newEnd = start + 11;
      }
    }

    if (onChange) {
      onChange({
        target: {
          name: name || '',
          value: newText
        }
      });
    }

    // Restore focus and selection
    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      toggleBold();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="admin-label" style={{ margin: 0 }}>{label}</label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: showPreview ? 'var(--primary-blue)' : '#64748B',
                background: showPreview ? '#E0F2FE' : 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                cursor: 'pointer'
              }}
              title="Toggle Live Preview"
            >
              {showPreview ? <><Edit3 size={11} /> Edit</> : <><Eye size={11} /> Preview</>}
            </button>
          </div>
        </div>
      )}

      <div style={{ border: '1px solid #CBD5E1', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        {/* Formatting Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.6rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={toggleBold}
              title="Bold (Ctrl+B) - Select any text or word"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '26px',
                fontWeight: 900,
                fontSize: '0.85rem',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.borderColor = '#0284C7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <Bold size={13} strokeWidth={3} />
            </button>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Use <strong>[B]</strong> or <strong>Ctrl+B</strong> to bold selected text
            </span>
          </div>

          {!label && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: showPreview ? 'var(--primary-blue)' : '#64748B',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          )}
        </div>

        {/* Editor vs Preview Area */}
        {showPreview ? (
          <div style={{ padding: '0.75rem', minHeight: `${rows * 1.5 + 1}rem`, backgroundColor: '#FAFAFA', color: '#0F172A', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {value ? (
              <FormattedText text={value} paragraphs={true} />
            ) : (
              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No content entered yet.</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={className}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              padding: '0.65rem 0.75rem',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              resize: 'vertical',
              boxSizing: 'border-box',
              ...style
            }}
          />
        )}
      </div>

      {helperText && !showPreview && (
        <span style={{ fontSize: '0.72rem', color: '#64748B', margin: 0 }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
