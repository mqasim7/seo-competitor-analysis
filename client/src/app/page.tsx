'use client';
import { useState } from 'react';
import { Providers } from './providers';
import UrlForm from './components/UrlForm';
import CompetitorTable from './components/CompetitorTable';
import { Competitor } from './lib/api';

export default function Home() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
        <div className="max-w-4xl w-full flex flex-col">
          {/* Logo */}
          <div className="mb-16">
            BabyLoveGrowth.ai
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 w-full">
            <h1 className="text-5xl md:text-7xl font-bold">
              Find
              <div className="mt-2">SEO Competitors</div>
            </h1>

            <p className="text-lg md:text-xl mt-6 mb-12 text-gray-300">
              With a single click find all your competitors and key SEO metrics.
            </p>

            <UrlForm />
          </div>
        </div>
      </main>
  );
}