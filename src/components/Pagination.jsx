import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, totalEvents, limit = 16, onPageChange, className = '' }) {
  if (!totalPages || totalPages <= 1) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = totalEvents ? Math.min(page * limit, totalEvents) : page * limit;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 px-4 max-w-[1200px] mx-auto w-full ${className}`.trim()}>
      {/* Showing count */}
      <div className="text-[13px] text-text-3 font-medium tabular-nums">
        {totalEvents > 0 ? (
          <>
            Showing <span className="text-text-1 font-semibold">{startIdx}–{endIdx}</span> of <span className="text-text-1 font-semibold">{totalEvents}</span> events
          </>
        ) : (
          <>
            Page <span className="text-text-1 font-semibold">{page}</span> of <span className="text-text-1 font-semibold">{totalPages}</span>
          </>
        )}
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-2 select-none">
        {/* Previous button */}
        {page > 1 ? (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border bg-white text-[13px] font-semibold text-text-2 hover:border-primary hover:text-primary hover:bg-[#F5F3FF] active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Previous
          </button>
        ) : (
          <span className="hidden sm:inline-block w-0" />
        )}

        {/* Page numbers indicator pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (totalPages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== totalPages) {
              if (p === 2 || p === totalPages - 1) {
                return <span key={p} className="px-1 text-text-4 text-[12px] select-none">…</span>;
              }
              return null;
            }

            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-9 h-9 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-all tabular-nums ${
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'bg-white border border-border text-text-2 hover:border-primary hover:text-primary hover:bg-[#F5F3FF] active:scale-95'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {page < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-border bg-white text-[13px] font-semibold text-text-2 hover:border-primary hover:text-primary hover:bg-[#F5F3FF] active:scale-95 transition-all shadow-sm"
          >
            Next
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

