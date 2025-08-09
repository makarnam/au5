import React from 'react';
import type { Regulation } from '../../types/regulation';

export default function RegulationCard({ item, onClick }: { item: Regulation; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border rounded-lg p-4 hover:shadow bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{item.code}</div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          item.status === 'active' ? 'bg-green-100 text-green-700' : item.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
        }`}>{item.status}</span>
      </div>
      <div className="mt-1 font-medium">{item.title}</div>
      {item.description ? (
        <div className="mt-1 text-sm text-gray-600 line-clamp-2">{item.description}</div>
      ) : null}
      <div className="mt-2 text-xs text-gray-500 flex gap-3">
        {item.jurisdiction ? <span>Jurisdiction: {item.jurisdiction}</span> : null}
        {item.category ? <span>Category: {item.category}</span> : null}
        {item.effective_date ? <span>Effective: {new Date(item.effective_date).toLocaleDateString()}</span> : null}
      </div>
    </button>
  );
}


