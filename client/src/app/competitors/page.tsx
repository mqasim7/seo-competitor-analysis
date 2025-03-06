// app/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { analyzeWebsite, Competitor, AnalysisResponse } from '../lib/api';
import CompetitorTable from '../components/CompetitorTable';
import { Providers } from '../providers';
import { useMutationState, useQuery } from '@tanstack/react-query';

export default function CompetitorsPage() {

    const { data, isLoading, error } = useQuery({
    queryKey: ['competitor-analysis'],
    queryFn: () => analyzeWebsite(''), // Empty fn since we're using persisted data
    enabled: false, // Don't auto-fetch
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data?.competitors) {
    return <div>No analysis data found. Please submit a website first.</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Logo */}
        <div className="mb-16">
          BabyLoveGrowth.ai
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">SEO Competitors</h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Discover a detailed breakdown of your competitors' SEO performance. Uncover key areas for improvement and
              capitalize on missed opportunities to enhance your ranking.
            </p>
          </div>

          {/* Competitors List */}
          <CompetitorTable data={data.competitors} />
        </div>
      </div>
    </main> 
  );
}