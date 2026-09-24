/**
 * Hook: detecta swipe para baixo em um elemento e chama onSwipeDown
 * Usado para fechar modais com gesto no celular
 */
import { useEffect } from 'react';

export function useSwipeDown(
  ref: React.RefObject<HTMLElement | null>,
  onSwipeDown: () => void,
  threshold = 80
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startY = 0;
    let startScrollTop = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startScrollTop = el.scrollTop;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY;
      // Só fecha se estiver no topo (scrollTop === 0) e o swipe for para baixo
      if (dy > threshold && startScrollTop === 0) {
        onSwipeDown();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, onSwipeDown, threshold]);
}
