import { useEffect, useRef, useState } from 'react';
import { isWifiConnection } from '../utils/network';

export const useViewportManager = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    shouldLoad: false,
    shouldPlayVideo: false,
    isVisible: false
  });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting;
      setState(prev => ({
        isVisible,
        shouldLoad: isVisible || prev.shouldLoad,
        shouldPlayVideo: isVisible && 
                      window.innerWidth <= 768 && 
                      isWifiConnection()
      }));
    }, { threshold: 0.1, rootMargin: '200px 0px' });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, state] as const;
};