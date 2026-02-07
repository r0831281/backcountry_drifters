import { useState, useCallback } from 'react';

interface UseScrollRevealOptions {
  /** IntersectionObserver threshold (0-1). Default: 0.15 */
  threshold?: number;
  /** Root margin for triggering earlier/later. Default: '0px 0px -40px 0px' */
  rootMargin?: string;
  /** Only trigger once. Default: true */
  triggerOnce?: boolean;
}

interface UseScrollRevealResult<T extends HTMLElement> {
  /** Callback ref to attach to the target element */
  observe: (node: T | null) => void;
  /** Whether the element has entered the viewport */
  isVisible: boolean;
}

/**
 * Hook that observes an element's visibility in the viewport
 * and returns whether it has been revealed.
 *
 * Uses a callback ref pattern for IntersectionObserver.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): UseScrollRevealResult<T> {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);

  const observe = useCallback(
    (node: T | null) => {
      if (!node) return;

      // Respect reduced-motion preference: reveal immediately
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(node);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
    },
    [threshold, rootMargin, triggerOnce]
  );

  return { observe, isVisible };
}

interface UseStaggerRevealResult<T extends HTMLElement> extends UseScrollRevealResult<T> {
  /** Returns transition-delay style for staggering child animations */
  getStaggerStyle: (index: number, baseDelayMs?: number) => { transitionDelay: string };
}

/**
 * Hook for staggered reveal of child elements.
 * Returns a callback ref for the container and an isVisible state.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): UseStaggerRevealResult<T> {
  const { observe, isVisible } = useScrollReveal<T>(options);

  const getStaggerStyle = useCallback(
    (index: number, baseDelayMs: number = 100) => ({
      transitionDelay: isVisible ? `${index * baseDelayMs}ms` : '0ms',
    }),
    [isVisible]
  );

  return { observe, isVisible, getStaggerStyle };
}
