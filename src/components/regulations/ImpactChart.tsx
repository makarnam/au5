import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Item = { name: string; value: number };

export default function ImpactChart({ data, title }: { data: Item[]; title?: string }) {
  return (
    <div className="w-full h-72 bg-white border rounded-lg p-4">
      {title ? <div className="font-medium mb-2">{title}</div> : null}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


