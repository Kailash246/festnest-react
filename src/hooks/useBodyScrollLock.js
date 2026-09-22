// src/hooks/useBodyScrollLock.js
import { useEffect } from 'react';

// Shared lock counter so nested/stacked drawers/modals don't prematurely unlock body scroll
let lockCount = 0;
let originalBodyStyles = null;
let originalHtmlStyles = null;

/**
 * Locks background/page scrolling while `isLocked` is true, ensuring that
 * only the target element (or container) can be scrolled.
 *
 * Handles:
 * - Body & HTML overflow/overscroll locks
 * - Window-level touchmove interception (prevents background touch dragging)
 * - Scroll chaining / rubber-banding prevention at top and bottom boundaries
 * - Desktop scrollbar width compensation to prevent horizontal layout shift
 * - Safe restoration when closed or unmounted
 *
 * @param {boolean} isLocked Whether scrolling should be locked
 * @param {React.RefObject} scrollableRef Ref to the independently scrollable container
 */
export default function useBodyScrollLock(isLocked, scrollableRef) {
  useEffect(() => {
    if (!isLocked || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // 1. Lock documentElement & body
    if (lockCount === 0) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      originalBodyStyles = {
        overflow: document.body.style.overflow,
        overscrollBehavior: document.body.style.overscrollBehavior,
        paddingRight: document.body.style.paddingRight,
      };

      originalHtmlStyles = {
        overflow: document.documentElement.style.overflow,
        overscrollBehavior: document.documentElement.style.overscrollBehavior,
      };

      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';

      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    lockCount += 1;

    // 2. Global touchmove interceptor
    // Any touchmove that occurs outside the scrollable element is canceled immediately
    const handleWindowTouchMove = (e) => {
      const scrollEl = scrollableRef?.current;
      if (!scrollEl || !scrollEl.contains(e.target)) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });

    // 3. Boundary touchmove & wheel handling on the scrollable container
    // Prevents scroll chaining / elastic bounce when hitting the top or bottom
    const scrollEl = scrollableRef?.current;
    let cleanupScrollEl = null;

    if (scrollEl) {
      let startY = 0;
      let startX = 0;

      const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
        }
      };

      const handleTouchMove = (e) => {
        if (e.touches.length !== 1) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - startY;
        const deltaX = Math.abs(currentX - startX);
        const absDeltaY = Math.abs(deltaY);

        // Cancel horizontal drag chaining
        if (deltaX > absDeltaY && deltaX > 8) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        const isDraggingDown = deltaY > 0;
        const isDraggingUp = deltaY < 0;

        const isAtTop = scrollEl.scrollTop <= 0;
        const isAtBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;

        // If pulling down at top, or pulling up at bottom: kill the gesture
        if ((isAtTop && isDraggingDown) || (isAtBottom && isDraggingUp)) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }

        // Stop propagation so parent containers do not receive this touchmove
        e.stopPropagation();
      };

      const handleWheel = (e) => {
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;

        const isAtTop = scrollEl.scrollTop <= 0;
        const isAtBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;

        if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }

        e.stopPropagation();
      };

      scrollEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollEl.addEventListener('touchmove', handleTouchMove, { passive: false });
      scrollEl.addEventListener('wheel', handleWheel, { passive: false });

      cleanupScrollEl = () => {
        scrollEl.removeEventListener('touchstart', handleTouchStart);
        scrollEl.removeEventListener('touchmove', handleTouchMove);
        scrollEl.removeEventListener('wheel', handleWheel);
      };
    }

    return () => {
      window.removeEventListener('touchmove', handleWindowTouchMove);
      if (cleanupScrollEl) {
        cleanupScrollEl();
      }

      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        if (originalBodyStyles) {
          document.body.style.overflow = originalBodyStyles.overflow;
          document.body.style.overscrollBehavior = originalBodyStyles.overscrollBehavior;
          document.body.style.paddingRight = originalBodyStyles.paddingRight;
          originalBodyStyles = null;
        }

        if (originalHtmlStyles) {
          document.documentElement.style.overflow = originalHtmlStyles.overflow;
          document.documentElement.style.overscrollBehavior = originalHtmlStyles.overscrollBehavior;
          originalHtmlStyles = null;
        }
      }
    };
  }, [isLocked, scrollableRef]);
}

