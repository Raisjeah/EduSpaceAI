'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

const Mermaid = ({ chart }) => {
  const chartRef = useRef(null);
  const { theme, resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentTheme = resolvedTheme || theme || 'light';
    mermaid.initialize({
      startOnLoad: false,
      theme: currentTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const renderChart = async () => {
      if (chartRef.current && chart) {
        try {
          setError(null);
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        } catch (err) {
          console.error('Mermaid render error:', err);
          setError(err.message);
        }
      }
    };

    renderChart();
  }, [chart, theme, resolvedTheme]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono overflow-auto">
        <p className="font-bold mb-1">Mermaid Syntax Error:</p>
        <pre>{error}</pre>
        <pre className="mt-2 text-slate-500">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="mermaid-container w-full overflow-x-auto flex justify-center bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm my-4 transition-colors"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Mermaid;
