import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, UploadCloud, FileText, CheckCircle2,
  AlertTriangle, AlertCircle, ChevronDown, ChevronUp,
  RefreshCw,
} from 'lucide-react';

/**
 * AiPosterUploadCard
 *
 * An optional, collapsible card at the top of Step 1 in HostEvent.
 * Connects to the real POST /api/ai/parse-event-poster endpoint.
 *
 * States:
 * - 'empty': initial dropzone
 * - 'processing': file selected with loading spinner
 * - 'success': full extraction confirmation with actual page count
 * - 'partial': partial extraction notice with missing fields hint
 * - 'failure': error message with "Try another PDF" and "Fill manually instead"
 */
export default function AiPosterUploadCard({
  state = 'empty',
  pageCount = 0,
  fileName = '',
  fileSize = 0,
  errorMessage = '',
  missingSummary = '',
  onUpload,
  onReset,
  onFillManually,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) onReset();
  };

  const handleManualFallback = () => {
    setIsCollapsed(true);
    if (onFillManually) onFillManually();
  };

  const displayFileName = selectedFile?.name || fileName;
  const displayFileSize = selectedFile?.size || fileSize;

  return (
    <div className="bg-white border border-[#E4E4E0] rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all">
      {/* ── Card Header (Always visible, acts as toggle) ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#F5F3FF] via-white to-white border-b border-[#F1F0ED]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0 text-primary">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-[14px] text-text-1 tracking-tight truncate">
                Fill event details with AI
              </h3>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-[#C7D2FE]">
                Autofill
              </span>
            </div>
            <p className="text-[12px] text-text-3 truncate mt-0.5">
              Upload your event poster or brochure and FestNest will extract the details for you.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-[12px] font-semibold text-text-3 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-3 flex-shrink-0 ml-3"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand AI Autofill' : 'Collapse AI Autofill'}
        >
          <span className="hidden md:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </div>

      {/* ── Collapsible Content Area ── */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* ────────────────── STATE A: EMPTY ────────────────── */}
              {state === 'empty' && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md py-7 px-4 text-center cursor-pointer transition-all duration-150 group
                    ${dragOver
                      ? 'border-primary bg-primary-xlight'
                      : 'border-[#CBCBC6] hover:border-primary hover:bg-primary-xlight/50 bg-[#FAFAF9]'
                    }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#E4E4E0] shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud size={24} strokeWidth={1.8} />
                  </div>
                  <div className="text-[14px] font-semibold text-text-1 group-hover:text-primary transition-colors">
                    Upload your event poster (PDF)
                  </div>
                  <p className="text-[12px] text-text-3 mt-1">
                    Drag and drop your file here, or <span className="text-primary font-medium underline">browse</span>
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-text-3 bg-white px-2.5 py-1 rounded border border-[#E4E4E0]">
                    <span>Up to 25 pages</span>
                    <span>·</span>
                    <span className="font-semibold text-text-2">PDF only</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}

              {/* ────────────── STATE B: PROCESSING ────────────── */}
              {state === 'processing' && (
                <div className="border border-[#E4E4E0] rounded-md p-5 bg-[#FAFAF9] text-center space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[15px] text-text-1">
                      Reading your poster...
                    </h4>
                    <p className="text-[12px] text-text-3 mt-1">
                      This usually takes 10–20 seconds.
                    </p>
                  </div>
                  {displayFileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E4E4E0] rounded-md text-[12px] text-text-2 max-w-full truncate shadow-xs">
                      <FileText size={14} className="text-primary flex-shrink-0" />
                      <span className="font-medium truncate">{displayFileName}</span>
                      {displayFileSize > 0 && (
                        <span className="text-text-4 text-[11px] flex-shrink-0">
                          ({(displayFileSize / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────── STATE C: SUCCESS ─────────────── */}
              {state === 'success' && (
                <div className="border border-green-border bg-green-bg/60 rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#BBF7D0] flex items-center justify-center flex-shrink-0 text-[#16A34A] mt-0.5">
                      <CheckCircle2 size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-bold text-[14px] text-text-1">
                          Form filled from your poster — review before continuing
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-green-border">
                          {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'} extracted
                        </span>
                      </div>
                      <p className="text-[12px] text-text-2 mt-1">
                        All key details were found. You can edit any field below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-green-border/50 text-[12px]">
                    <span className="text-text-3 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                      File: {displayFileName || 'poster.pdf'}
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-primary hover:text-primary-dark font-semibold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Upload another poster
                    </button>
                  </div>
                </div>
              )}

              {/* ────────── STATE D: PARTIAL EXTRACTION ────────── */}
              {state === 'partial' && (
                <div className="border border-amber-border bg-amber-bg/70 rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDE68A] flex items-center justify-center flex-shrink-0 text-amber-800 mt-0.5">
                      <AlertCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-bold text-[14px] text-text-1">
                          Some details couldn't be found — please review the highlighted fields.
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-amber-800 border border-amber-border">
                          Partial extract · {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-2 mt-1">
                        {missingSummary || "Some event details couldn't be found on the poster. Please review and fill the remaining fields manually below."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-border/50 text-[12px]">
                    <span className="text-text-3 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                      File: {displayFileName || 'poster.pdf'}
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-primary hover:text-primary-dark font-semibold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Upload different PDF
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────── STATE E: FAILURE ─────────────── */}
              {state === 'failure' && (
                <div className="border border-red-border bg-red-bg/70 rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FECACA] flex items-center justify-center flex-shrink-0 text-red mt-0.5">
                      <AlertTriangle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-[14px] text-red">
                        {errorMessage || "Couldn't read PDF"}
                      </h4>
                      <p className="text-[12px] text-text-2 mt-1">
                        {errorMessage?.includes('25 page')
                          ? 'Your document exceeds the 25-page limit. Please upload a shorter brochure or poster.'
                          : "We couldn't extract event details from this document. It may be password-protected, corrupted, or contain unreadable text."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-border/50">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3.5 py-2 rounded-md bg-primary text-white text-[12px] font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={13} /> Try another PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleManualFallback}
                      className="px-3.5 py-2 rounded-md border border-[#CBCBC6] bg-white text-text-2 text-[12px] font-semibold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                    >
                      Fill manually instead
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

