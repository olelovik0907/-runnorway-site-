import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

export function Hero() {
  const { t } = useApp();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextRace, setNextRace] = useState('');

  useEffect(() => {
    const targetDate = new Date('2025-05-01T10:00:00');
    setNextRace('Oslo Marathon 2025');

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="pt-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 50%, #083d3b 100%)',
        color: '#ffffff',
        paddingBottom: '140px',
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '12px',
          background: 'var(--accent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-24 text-center relative z-10">
        <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <span className="text-sm font-semibold text-cyan-300">Norges største løpskalender</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-white mb-4 tracking-tight">
          RunNorway
        </h1>
        <p className="text-xl sm:text-2xl text-white/95 max-w-2xl mx-auto font-normal">
          Finn alle løp i Norge. Ett sted. Én kalender.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="btn-brand px-8 py-3 text-base shadow-xl hover:shadow-2xl transition-all">
            Se program
          </button>
          <button className="px-8 py-3 rounded-full bg-white/95 text-slate-900 font-semibold hover:bg-white transition-all">
            Finn ditt resultat
          </button>
        </div>

        {nextRace && (
          <>
            <div className="max-w-3xl mx-auto mt-12 flex items-center justify-center gap-3 flex-wrap">
              <p
                className="rounded-full border font-semibold text-sm px-4 py-1"
                style={{
                  background: 'rgba(15,23,42,0.95)',
                  color: '#F9FAFB',
                  borderColor: 'rgba(249,250,251,0.4)',
                }}
              >
                Neste løp: {nextRace}
              </p>
              <button className="btn-brand px-4 py-2 text-sm">Meld deg på</button>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-4 gap-3 text-center mt-6">
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>
                  {countdown.days}
                </div>
                <div className="text-xs uppercase tracking-wider mt-2 font-semibold">DAGER</div>
              </div>
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>
                  {countdown.hours}
                </div>
                <div className="text-xs uppercase tracking-wider mt-2 font-semibold">TIMER</div>
              </div>
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>
                  {countdown.minutes}
                </div>
                <div className="text-xs uppercase tracking-wider mt-2 font-semibold">MIN</div>
              </div>
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-5xl font-bold" style={{ color: 'var(--accent)' }}>
                  {countdown.seconds}
                </div>
                <div className="text-xs uppercase tracking-wider mt-2 font-semibold">SEK</div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
