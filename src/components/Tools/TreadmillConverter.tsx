import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export function TreadmillConverter() {
  const [speed, setSpeed] = useState('10');
  const [incline, setIncline] = useState('0');

  const kmhToMinPerKm = (kmh: number) => {
    if (kmh <= 0) return '0:00';
    const totalMinutes = 60 / kmh;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const minPerKmToKmh = (min: number, sec: number) => {
    const totalMinutes = min + sec / 60;
    if (totalMinutes <= 0) return 0;
    return (60 / totalMinutes).toFixed(1);
  };

  const calculateEquivalentPace = () => {
    const speedNum = parseFloat(speed);
    const inclineNum = parseFloat(incline);

    if (speedNum <= 0) return speed;

    const inclineAdjustment = 1 + (inclineNum * 0.02);
    const equivalentSpeed = speedNum * inclineAdjustment;

    return equivalentSpeed.toFixed(1);
  };

  const commonSpeeds = [
    { label: 'Easy Run', speed: '8' },
    { label: 'Steady', speed: '10' },
    { label: 'Tempo', speed: '12' },
    { label: 'Fast', speed: '14' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-8 h-8" style={{ color: 'var(--brand)' }} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Treadmill Pace Converter</h2>
          <p className="text-slate-600 dark:text-slate-400">Convert between km/h and min/km, adjust for incline</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Treadmill Speed (km/h)
          </label>
          <input
            type="number"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
            placeholder="10"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {commonSpeeds.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setSpeed(preset.speed)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Incline (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={incline}
            onChange={(e) => setIncline(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg"
            placeholder="0"
          />
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={incline}
            onChange={(e) => setIncline(e.target.value)}
            className="w-full mt-2"
          />
        </div>

        <div className="grid gap-4">
          <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}>
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium mb-2">Pace per Kilometer</p>
              <p className="text-white text-5xl font-bold">
                {kmhToMinPerKm(parseFloat(speed))}
              </p>
              <p className="text-white/80 text-sm mt-2">min/km</p>
            </div>
          </div>

          {parseFloat(incline) > 0 && (
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
                  Equivalent Flat Speed
                </p>
                <p className="text-4xl font-bold" style={{ color: 'var(--brand)' }}>
                  {calculateEquivalentPace()}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">km/h</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                  Running at {speed} km/h with {incline}% incline is like running {calculateEquivalentPace()} km/h on flat ground
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Speed</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{speed} km/h</p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Incline</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{incline}%</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Tip:</strong> Adding incline to your treadmill run makes it more challenging and closer to outdoor running.
            A 1-2% incline is often recommended to simulate outdoor conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
