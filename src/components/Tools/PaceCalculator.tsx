import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export function PaceCalculator() {
  const [distance, setDistance] = useState('10');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('50');
  const [seconds, setSeconds] = useState('0');

  const calculatePace = () => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    const distanceKm = parseFloat(distance);

    if (distanceKm <= 0 || totalSeconds <= 0) return { min: 0, sec: 0 };

    const paceSeconds = totalSeconds / distanceKm;
    const paceMin = Math.floor(paceSeconds / 60);
    const paceSec = Math.round(paceSeconds % 60);

    return { min: paceMin, sec: paceSec };
  };

  const pace = calculatePace();

  const presetDistances = [
    { label: '5K', value: '5' },
    { label: '10K', value: '10' },
    { label: 'Half Marathon', value: '21.1' },
    { label: 'Marathon', value: '42.195' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8" style={{ color: 'var(--brand)' }} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pace Calculator</h2>
          <p className="text-slate-600 dark:text-slate-400">Calculate your running pace per kilometer</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Distance (km)
          </label>
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
            placeholder="10"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {presetDistances.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDistance(preset.value)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Time
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg text-center"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}>
          <div className="text-center">
            <p className="text-white/80 text-sm font-medium mb-2">Your Pace</p>
            <p className="text-white text-5xl font-bold">
              {pace.min}:{pace.sec.toString().padStart(2, '0')}
            </p>
            <p className="text-white/80 text-sm mt-2">per kilometer</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Time</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {hours}h {minutes}m {seconds}s
            </p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Distance</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {distance} km
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
