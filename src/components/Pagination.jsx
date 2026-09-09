import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generates an array of page numbers and ellipsis strings for pagination.
 * Always shows the first, last, current, and adjacent pages.
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('…');
    }
    result.push(sorted[i]);
  }

  return result;
}

export default function Pagination({
  page,
  totalPages,
  totalEvents,
  limit = 16,
  onPageChange,
  className = '',
}) {
  if (!totalPages || totalPages <= 1) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = totalEvents ? Math.min(page * limit, totalEvents) : page * limit;
  const pageItems = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Events pagination"
      className={`w-full flex flex-col items-center justify-center pt-8 pb-3 px-4 select-none ${className}`.trim()}
    >
      {/* ── Centered Controls Container ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`flex items-center gap-1 px-3 sm:px-3.5 h-10 rounded-xl text-[13px] font-semibold transition-all duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
                     ${
                       page <= 1
                         ? 'border border-[#E4E4E0] bg-[#FAFAF9] text-text-4 cursor-not-allowed opacity-50'
                         : 'border border-[#E4E4E0] bg-white text-text-2 hover:border-primary/50 hover:text-primary hover:bg-[#F5F3FF] active:scale-95 shadow-xs'
                     }`}
        >
          <ChevronLeft size={16} strokeWidth={2.2} className="flex-shrink-0" />
          <span>Previous</span>
        </button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pageItems.map((item, idx) => {
            if (item === '…') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-10 flex items-center justify-center text-text-4 text-[13px] font-bold select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const p = item;
            const isActive = p === page;

            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[40px] h-10 px-2 rounded-xl text-[13px] font-semibold flex items-center justify-center transition-all duration-150 tabular-nums
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
                           ${
                             isActive
                               ? 'bg-primary text-white font-bold shadow-xs shadow-primary/30 scale-100'
                               : 'bg-white border border-[#E4E4E0] text-text-2 hover:border-primary/50 hover:text-primary hover:bg-[#F5F3FF] active:scale-95 shadow-xs'
                           }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`flex items-center gap-1 px-3 sm:px-3.5 h-10 rounded-xl text-[13px] font-semibold transition-all duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
                     ${
                       page >= totalPages
                         ? 'border border-[#E4E4E0] bg-[#FAFAF9] text-text-4 cursor-not-allowed opacity-50'
                         : 'border border-[#E4E4E0] bg-white text-text-2 hover:border-primary/50 hover:text-primary hover:bg-[#F5F3FF] active:scale-95 shadow-xs'
                     }`}
        >
          <span>Next</span>
          <ChevronRight size={16} strokeWidth={2.2} className="flex-shrink-0" />
        </button>
      </div>

      {/* ── Centered Event Count ── */}
      <div className="mt-3 text-[13px] text-text-3 font-medium tabular-nums text-center tracking-tight">
        {totalEvents > 0 ? (
          <>
            Showing <span className="text-text-1 font-semibold">{startIdx}–{endIdx}</span> of{' '}
            <span className="text-text-1 font-semibold">{totalEvents}</span> events
          </>
        ) : (
          <>
            Page <span className="text-text-1 font-semibold">{page}</span> of{' '}
            <span className="text-text-1 font-semibold">{totalPages}</span>
          </>
        )}
      </div>
    </nav>
  );
}
