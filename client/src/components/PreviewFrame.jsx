import React, { useMemo } from 'react';
import { getMetricsScript } from '../utils/cssScorer';

/**
 * Blueprint-style preview frame.
 * Refined with Bio-Emerald aesthetic and technical precision.
 */
export default function PreviewFrame({ css, label, isTarget = false, targetStyles = null, isLocal = false }) {
  const srcDoc = useMemo(() => {
    const styleTag = isTarget && targetStyles 
      ? `.target { ${Object.entries(targetStyles).map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${v}`).join('; ')} }`
      : `.target { ${css} }`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 0 !important; 
              display: flex !important; 
              align-items: center !important; 
              justify-content: center !important; 
              height: 100vh !important; 
              width: 100vw !important;
              background: #060907 !important;
              background-image: radial-gradient(rgba(16,185,129,0.05) 1px, transparent 1px) !important;
              background-size: 16px 16px !important;
              overflow: hidden !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
              color: white !important;
            }
            .target { 
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-sizing: border-box;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              text-align: center !important;
              font-weight: 900 !important;
              font-size: 24px !important;
              letter-spacing: -0.02em !important;
              text-transform: uppercase;
              position: relative;
              font-family: 'Inter', sans-serif !important;
            }
            ${styleTag}
          </style>
        </head>
        <body>
          <div class="target">CSS</div>
          <script>${isLocal ? getMetricsScript : ''}</script>
        </body>
      </html>
    `;
  }, [css, isTarget, targetStyles, isLocal]);

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 ${isTarget ? 'bg-emerald-700' : 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'} rounded-full`} />
           <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-900 uppercase">
             {label}
           </span>
        </div>
      </div>
      
      <div className="relative aspect-square lg:aspect-auto lg:h-[300px] border border-emerald-500/10 rounded-lg overflow-hidden bg-[#060907] shadow-inner scanline">
        <iframe
          key={label}
          title={label}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="w-full h-full border-none pointer-events-none opacity-90"
        />
        
        {/* Technical Overlay */}
        <div className="absolute inset-0 border border-emerald-500/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/20" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/20" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/20" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/20" />
      </div>
    </div>
  );
}
