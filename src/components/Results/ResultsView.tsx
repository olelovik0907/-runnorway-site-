import React from 'react';
import { Trophy, Clock, TrendingUp } from 'lucide-react';

export function ResultsView() {
  const results = [
    {
      event: 'Oslo Marathon 2024',
      date: '2024-09-15',
      distance: '42.2 km',
      time: '3:24:15',
      placement: 145,
    },
    {
      event: 'Bergen Half Marathon 2024',
      date: '2024-06-10',
      distance: '21.1 km',
      time: '1:38:22',
      placement: 82,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Siste Resultater
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Se resultater fra nylige løp
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {result.event}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {new Date(result.date).toLocaleDateString('nb-NO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
                    {result.distance}
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
                    {result.time}
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Trophy className="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" />
                    Plassering: {result.placement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
