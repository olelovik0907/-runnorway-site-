import React from 'react';
import { Calendar } from 'lucide-react';

export function CalendarView() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Calendar View</h2>
            <p className="text-slate-600">View events in a calendar format</p>
          </div>
        </div>
      </div>
    </div>
  );
}
