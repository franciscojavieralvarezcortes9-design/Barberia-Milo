import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Code } from 'lucide-react';
import { STANDALONE_HTML_CODE } from '../standaloneCode';

interface StandaloneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneModal: React.FC<StandaloneModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = STANDALONE_HTML_CODE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([STANDALONE_HTML_CODE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="standalone-code-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#0D0D0D] border border-white/20 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center text-black font-extrabold text-sm">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base text-[#F2F2F2] tracking-widest uppercase">
                ARCHIVO INDEX.HTML AUTOCONTENIDO
              </h3>
              <p className="text-[11px] text-[#888888]">
                HTML + CSS en &lt;style&gt; + JS en &lt;script&gt; sin dependencias externas, listo para producción.
              </p>
            </div>
          </div>

          <button
            id="btn-close-code-modal"
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white rounded-sm hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-[#111111] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[#888888] font-mono text-[11px]">
            Listo para copiar y pegar en tu archivo <strong className="text-gold">index.html</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              id="btn-copy-standalone-code"
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'gold-gradient text-black hover:opacity-90'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              id="btn-download-standalone-file"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-sm bg-[#1A1A1A] hover:bg-[#252525] text-[#F2F2F2] text-xs font-semibold uppercase tracking-wider border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Descargar .html</span>
            </button>

            <a
              id="btn-preview-standalone-tab"
              href="/barberia-milo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-sm bg-black/60 hover:bg-black text-[#888888] hover:text-[#F2F2F2] text-xs flex items-center gap-1 transition-all border border-white/5"
            >
              <span>Ver directo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#080808] font-mono text-xs text-[#d4d4d8] leading-relaxed select-all">
          <pre className="whitespace-pre-wrap break-words">
            <code>{STANDALONE_HTML_CODE}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
