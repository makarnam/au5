import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataPoint {
  category: string;
  currentValue: number;
  thresholdMin: number;
  thresholdMax: number;
  utilization: number;
  status: 'within_appetite' | 'approaching_limit' | 'breached';
  trend: 'up' | 'down' | 'stable';
}

interface RiskToleranceChartProps {
  data: DataPoint[];
  height?: number;
  showThresholds?: boolean;
  showTrends?: boolean;
}

export default function RiskToleranceChart({
  data,
  height = 300,
  showThresholds = true,
  showTrends = true
}: RiskToleranceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Chart dimensions
    const padding = 60;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);
    const barWidth = Math.max(20, (chartWidth / data.length) * 0.6);
    const barSpacing = chartWidth / data.length;

    // Colors
    const colors = {
      within_appetite: '#10B981', // green
      approaching_limit: '#F59E0B', // yellow
      breached: '#EF4444', // red
      threshold: '#6B7280', // gray
      background: '#F9FAFB' // light gray
    };

    // Draw background
    ctx.fillStyle = colors.background;
    ctx.fillRect(padding, padding, chartWidth, chartHeight);

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight * i) / 10;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#6B7280';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 10}%`, padding - 10, y + 4);
    }

    // Draw bars
    data.forEach((item, index) => {
      const x = padding + (index * barSpacing) + (barSpacing - barWidth) / 2;
      const barHeight = (item.utilization / 100) * chartHeight;
      const y = padding + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = colors[item.status];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw bar border
      ctx.strokeStyle = colors[item.status];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw threshold lines if enabled
      if (showThresholds) {
        const thresholdY = padding + chartHeight - ((item.thresholdMax / Math.max(...data.map(d => d.thresholdMax))) * chartHeight);
        ctx.strokeStyle = colors.threshold;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, thresholdY);
        ctx.lineTo(x + barWidth, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw trend indicator if enabled
      if (showTrends) {
        const trendY = y - 20;
        const trendX = x + barWidth / 2;

        if (item.trend === 'up') {
          ctx.fillStyle = '#EF4444';
          // Draw up arrow
          ctx.beginPath();
          ctx.moveTo(trendX, trendY);
          ctx.lineTo(trendX - 5, trendY + 10);
          ctx.lineTo(trendX + 5, trendY + 10);
          ctx.closePath();
          ctx.fill();
        } else if (item.trend === 'down') {
          ctx.fillStyle = '#10B981';
          // Draw down arrow
          ctx.beginPath();
          ctx.moveTo(trendX, trendY + 10);
          ctx.lineTo(trendX - 5, trendY);
          ctx.lineTo(trendX + 5, trendY);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.strokeStyle = '#6B7280';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(trendX - 5, trendY + 5);
          ctx.lineTo(trendX + 5, trendY + 5);
          ctx.stroke();
        }
      }
    });

    // Draw X-axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    data.forEach((item, index) => {
      const x = padding + (index * barSpacing) + barSpacing / 2;
      const y = padding + chartHeight + 20;

      // Truncate long category names
      const label = item.category.length > 12 ? item.category.substring(0, 12) + '...' : item.category;

      ctx.fillText(label, x, y);
    });

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Risk Tolerance Utilization by Category', rect.width / 2, 30);

  }, [data, height, showThresholds, showTrends]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-200 rounded-lg"
        style={{ height: `${height}px` }}
      />
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Within Appetite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Approaching Limit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Breached</span>
        </div>
        {showThresholds && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <span>Threshold</span>
          </div>
        )}
      </div>
    </div>
  );
}