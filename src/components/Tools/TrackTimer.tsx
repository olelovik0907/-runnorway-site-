import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export function TrackTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps([...laps, time]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const getLapTime = (index: number) => {
    if (index === 0) return laps[0];
    return laps[index] - laps[index - 1];
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Timer className="w-8 h-8" style={{ color: 'var(--brand)' }} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Track Timer</h2>
          <p className="text-slate-600 dark:text-slate-400">Time your laps on the track</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-8 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}>
          <p className="text-white text-6xl font-bold font-mono">
            {formatTime(time)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleStartPause}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-lg"
            style={{ background: isRunning ? '#ef4444' : 'var(--brand)' }}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>Start</span>
              </>
            )}
          </button>

          {isRunning && (
            <button
              onClick={handleLap}
              className="px-6 py-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Lap
            </button>
          )}

          {!isRunning && time > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {laps.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Laps</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {laps.map((lap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Lap {index + 1}
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: 'var(--brand)' }}>
                      {formatTime(getLapTime(index))}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Total: {formatTime(lap)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
