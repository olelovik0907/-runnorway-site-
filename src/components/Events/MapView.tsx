import React from 'react';
import { MapPin } from 'lucide-react';

export function MapView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Event Map</h1>
        <p className="text-slate-600">
          Discover running events across Norway
        </p>
      </div>

      <div className="bg-slate-200 rounded-xl h-96 flex items-center justify-center border-2 border-dashed border-slate-300">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            Interactive map view
          </p>
        </div>
      </div>
    </div>
  );
}
