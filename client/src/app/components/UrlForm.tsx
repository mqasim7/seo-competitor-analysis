
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeWebsite } from '../lib/api';
import { useState } from 'react';
import { Competitor } from '../lib/api';
import { useRouter } from 'next/navigation';

interface UrlFormProps {
  onAnalysisComplete: (competitors: Competitor[]) => void;
}

export default function UrlForm() {
  const [url, setUrl] = useState('');
  const router = useRouter();
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationKey: ['competitor-analysis'],
        mutationFn: () => analyzeWebsite(url),
        onSuccess: (data) => {
        queryClient.setQueryData(['competitor-analysis'], data);  
        router.push('/competitors');
        }
    });

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <form onSubmit={(e) => {
        e.preventDefault();
        mutate();
      }}>
        <div className="relative flex items-center rounded-full border-2 border-[#FA5C12]/50 bg-black/80 p-1 shadow-[0_0_15px_rgba(250,92,18,0.3)]">
          <input
            type="url"
            placeholder="Paste your website URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isPending}
            className="flex-grow bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none disabled:opacity-70"
            required
          />
          <button
            type="submit"
            disabled={isPending || !url.trim()}
            className="rounded-full bg-[#FA5C12] px-6 py-3 font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
          >
            {isPending ? "Searching..." : "Find Competitors Now"}
          </button>
        </div>
      </form>

    </div>
  );
}