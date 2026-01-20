import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // in ms
  animation?: 'fade' | 'scale' | 'slide' | 'enter' | 'fade-up';
  show?: boolean;
}

const animationClasses = {
  fade: 'animate-fade-in',
  scale: 'animate-scale-in',
  slide: 'animate-slide-in-right',
  enter: 'animate-enter',
  'fade-up': 'animate-fade-in-up',
};

export function AnimatedContainer({
  children,
  className,
  delay = 0,
  animation = 'enter',
  show = true,
}: AnimatedContainerProps) {
  if (!show) return null;
  
  return (
    <div 
      className={cn('opacity-0', animationClasses[animation], className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number; // in ms
  animation?: 'fade' | 'scale' | 'slide' | 'enter' | 'fade-up';
}

export function StaggeredGrid({
  children,
  className,
  itemClassName,
  staggerDelay = 50,
  animation = 'enter',
}: StaggeredGridProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn('opacity-0', animationClasses[animation], itemClassName)}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Hook for managing loading transitions with smooth content reveal
export function useLoadingTransition(duration = 1500) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return { isLoading };
}

// Animated section that fades in with staggered children
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <section 
      className={cn('opacity-0 animate-enter', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </section>
  );
}
