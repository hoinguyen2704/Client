import { useRef, useState, useEffect, useCallback } from 'react';
import type { SlidingTabsProps } from './types';

export default function SlidingTabs({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}: SlidingTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!el || !container) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({
      left: elRect.left - containerRect.left + container.scrollLeft,
      width: elRect.width,
    });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  // Scroll active tab into view (for underline variant with many tabs)
  useEffect(() => {
    if (variant !== 'underline') return;
    const el = tabRefs.current.get(activeTab);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab, variant]);

  const setTabRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(id, el);
    } else {
      tabRefs.current.delete(id);
    }
  }, []);

  if (variant === 'pill') {
    return (
      <div
        ref={containerRef}
        className={`bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 flex relative overflow-hidden ${className}`}
      >
        {/* Sliding pill indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-md transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => setTabRef(tab.id, el)}
            onClick={() => onChange(tab.id)}
            className={`relative z-10 flex-1 py-3 px-4 rounded-xl font-medium text-center transition-colors duration-300 ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-muted hover:text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      ref={containerRef}
      className={`flex overflow-x-auto hide-scrollbar relative ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => setTabRef(tab.id, el)}
          onClick={() => onChange(tab.id)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 text-md sm:text-base font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'text-blue-600'
              : 'text-muted hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
      {/* Sliding underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}
