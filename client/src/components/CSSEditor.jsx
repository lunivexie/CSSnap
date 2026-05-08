import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/tokyo-night-dark.css';

/**
 * Bio-Emerald High-Precision Editor.
 * Completely unified font stacks and geometric properties.
 */
export default function CSSEditor({ value, onChange }) {
  const codeRef = useRef(null);
  const preRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [value]);

  const syncScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Shared geometry to ensure absolute alignment
  const sharedStyles = {
    fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, monospace',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '24px',
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    boxSizing: 'border-box',
    tabSize: '2',
    fontVariantLigatures: 'none'
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-emerald-500/10 bg-[#060907] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/[0.03] border-b border-emerald-500/5">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
           <span className="text-[10px] font-mono font-bold text-emerald-500/60 uppercase tracking-widest italic">Bio_Compiler_v4</span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Layer 1: Highlighting (Underlay) */}
        <pre 
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 pointer-events-none select-none overflow-hidden"
          style={{ ...sharedStyles, color: '#ecfdf5' }}
        >
          <code 
            ref={codeRef} 
            className="language-css block min-h-full"
            style={{ 
              fontFamily: 'inherit', 
              fontSize: 'inherit', 
              lineHeight: 'inherit',
              padding: '0'
            }}
          >
            {value || ' '}
          </code>
        </pre>

        {/* Layer 2: Input (Overlay) */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck="false"
          autoFocus
          className="absolute inset-0 w-full h-full bg-transparent caret-emerald-400 z-10 overflow-auto scrollbar-hide outline-none resize-none border-none"
          style={{ 
            ...sharedStyles,
            WebkitTextFillColor: 'transparent',
            color: 'transparent'
          }}
          placeholder="/* Initialize neural CSS uplink... */"
        />
      </div>
      
      <div className="px-4 py-1.5 bg-emerald-500/[0.02] border-t border-emerald-500/5 flex justify-between items-center">
         <span className="text-[8px] font-mono text-emerald-900 uppercase tracking-[0.2em]">Sync_Status: Locked</span>
         <span className="text-[8px] font-mono text-emerald-500/30 uppercase tracking-[0.2em]">Format: UTF-8_Green</span>
      </div>
    </div>
  );
}
