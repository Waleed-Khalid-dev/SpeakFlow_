"use client";

import { LineChart as ChartIcon } from "lucide-react";
import { MOCK_SESSION_DATA } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressChart() {
  const { progressChart } = MOCK_SESSION_DATA;

  return (
    <div className="speakflow-card p-6 h-full bg-white flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-sans text-text-primary flex items-center">
            <ChartIcon className="w-5 h-5 mr-2 text-text-muted" />
            Weekly Progress
          </h2>
          <p className="text-sm text-text-secondary">Fluency & Accuracy</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-accent-primary mr-2"></div>
            <span className="text-xs font-mono text-text-muted">WPM</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-status-good mr-2"></div>
            <span className="text-xs font-mono text-text-muted">ACCURACY</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={progressChart}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="session" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontFamily: 'monospace' }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="wpm" 
              stroke="var(--accent-primary-dark)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="accuracy" 
              stroke="var(--status-good)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
