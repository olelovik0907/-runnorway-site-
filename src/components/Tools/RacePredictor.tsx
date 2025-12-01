import React, { useState } from 'react';
import { Target } from 'lucide-react';

export function RacePredictor() {
  const [distance, setDistance] = useState('10');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('50');
  const [seconds, setSeconds] = useState('0');

  const predictRace = (targetDistance: number) => {
    const currentDistance = parseFloat(distance);
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

    if (currentDistance <= 0 || totalSeconds <= 0) return '0:00:00';

    const riegel = 1.06;
    const predictedSeconds = totalSeconds * Math.pow(targetDistance / currentDistance, riegel);

    const h = Math.floor(predictedSeconds / 3600);
    const m = Math.floor((predictedSeconds % 3600) / 60);
    const s = Math.round(predictedSeconds % 60);

    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const races = [
    { name: '5K', distance: 5 },
    { name: '10K', distance: 10 },
    { name: 'Half Marathon', distance: 21.1 },
    { name: 'Marathon', distance: 42.195 },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-8 h-8" style={{ color: 'var(--brand)' }} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Race Predictor</h2>
          <p className="text-slate-600 dark:text-slate-400">Predict finish times for different distances</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Recent Race Distance (km)
          </label>
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Your Time
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

        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Predicted Times</h3>
          <div className="grid gap-3">
            {races.map((race) => (
              <div
                key={race.name}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{race.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{race.distance} km</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                    {predictRace(race.distance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Note:</strong> These predictions use the Riegel formula and are estimates based on your recent race performance.
            Actual results may vary based on training, terrain, and race conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
