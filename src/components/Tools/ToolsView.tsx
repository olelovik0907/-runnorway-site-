import React, { useState } from 'react';
import { Zap, Target, Timer, Activity } from 'lucide-react';
import { PaceCalculator } from './PaceCalculator';
import { RacePredictor } from './RacePredictor';
import { TrackTimer } from './TrackTimer';
import { TreadmillConverter } from './TreadmillConverter';

export function ToolsView() {
  const [activeTab, setActiveTab] = useState('pace');

  const tabs = [
    { id: 'pace', label: 'Pace Calculator', icon: Zap },
    { id: 'predictor', label: 'Race Predictor', icon: Target },
    { id: 'timer', label: 'Track Timer', icon: Timer },
    { id: 'treadmill', label: 'Treadmill Converter', icon: Activity },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--brand)' }}>
            Running Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Calculate pace, predict race times, and more
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={activeTab === tab.id ? { background: 'var(--brand)' } : {}}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          {activeTab === 'pace' && <PaceCalculator />}
          {activeTab === 'predictor' && <RacePredictor />}
          {activeTab === 'timer' && <TrackTimer />}
          {activeTab === 'treadmill' && <TreadmillConverter />}
        </div>
      </div>
    </div>
  );
}
