import React from 'react';
import { Users, MapPin, TrendingUp } from 'lucide-react';

export function ClubsView() {
  const clubs = [
    { name: 'Oslo Løpeklubb', members: 450, location: 'Oslo', type: 'Road Running' },
    { name: 'Bergen Trail Runners', members: 320, location: 'Bergen', type: 'Trail' },
    { name: 'Trondheim Triathlon', members: 280, location: 'Trondheim', type: 'Multi-sport' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Løpeklubber
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Finn din lokale løpeklubb og bli en del av fellesskapet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {club.name}
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {club.location}
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                {club.type}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {club.members} medlemmer
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors">
              Bli medlem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
