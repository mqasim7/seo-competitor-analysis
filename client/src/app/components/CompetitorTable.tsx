'use client';

import { Competitor } from '../lib/api';

interface CompetitorTableProps {
  data: Competitor[];
}

export default function CompetitorTable({ data }: CompetitorTableProps) {
 
  if (!data.length) return null;

  return (
    <div className="mt-12 bg-zinc-900/50 rounded-xl p-6">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 mb-6 text-sm text-gray-400">
        <div className="col-span-3">Competitors</div>
        <div className="col-span-3">Organic traffic</div>
        <div className="col-span-3">Similarity Score</div>
        <div className="col-span-3">Short description</div>
      </div>

      {/* Table Content */}
      <div className="space-y-6">
        {data.map((competitor) => (
          <div key={competitor.url} className="grid grid-cols-12 gap-4 items-center">
            {/* Competitor */}
            <div className="col-span-3 flex items-center gap-3">
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {competitor.name}
                </span>
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate"
                >
                  {competitor.url}
                </a>
              </div>
            </div>
            {/* Traffic */}
            <div className="col-span-3 flex items-center gap-3">
              <span className="text-sm whitespace-nowrap text-white">
                {(competitor.organicTraffic / 1000).toFixed(1)}k
              </span>
              <div className="flex-grow h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
                  style={{ width: `${Math.min(100, competitor.organicTraffic / 1000)}%` }}
                />
              </div>
            </div>
            {/* Similarity Score */}
            <div className="col-span-3">
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-green-400">
                  Score: {parseFloat(competitor.similarityScore).toFixed(2)}
                </span>
              </div>
            </div>
            {/* Description */}
            <div className="col-span-3">
              <p className="text-sm text-gray-400 line-clamp-2">
                {competitor.description}
              </p>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}