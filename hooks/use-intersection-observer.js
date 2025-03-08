'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element is visible in the viewport
 * This replaces the react-intersection-observer package to avoid dependency conflicts
 * 
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - A number between 0 and 1 indicating the percentage that should be visible
 * @param {string|Element} options.root - The element that is used as the viewport for checking visibility
 * @param {string} options.rootMargin - Margin around the root element
 * @returns {Array} - [ref, isIntersecting, entry]
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
} = {}) {
  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin]);

  return [elementRef, isIntersecting, entry];
}

/**
 * Simplified version that mimics the react-intersection-observer useInView hook
 * 
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} - [ref, inView]
 */
export function useInView(options = {}) {
  const [ref, inView] = useIntersectionObserver(options);
  return [ref, inView];
} 