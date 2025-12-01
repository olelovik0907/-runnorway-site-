import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, TrendingUp, Award, Users, Calendar } from 'lucide-react';

interface RunnerStat {
  id: string;
  user_id: string;
  year: number;
  total_races: number;
  total_distance_km: number;
  best_5k_time: string | null;
  best_10k_time: string | null;
  best_half_marathon_time: string | null;
  best_marathon_time: string | null;
  ranking_points: number;
  age_category: string | null;
  profiles: {
    full_name: string;
    home_county: string | null;
  } | null;
}

interface EventStats {
  total_events: number;
  upcoming_events: number;
  total_participants: number;
}

export function StatisticsView() {
  const [topRunners, setTopRunners] = useState<RunnerStat[]>([]);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [distanceFilter, setDistanceFilter] = useState<'all' | '5k' | '10k' | 'half' | 'marathon'>('all');
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchStatistics();
    fetchEventStatistics();
  }, [selectedYear, distanceFilter]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('runner_statistics')
        .select(`
          *,
          profiles:user_id (full_name, home_county)
        `)
        .eq('year', selectedYear)
        .order('ranking_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTopRunners(data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStatistics = async () => {
    try {
      const { data: totalEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true });

      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('event_date', new Date().toISOString());

      const { data: participants } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true });

      setEventStats({
        total_events: totalEvents?.length || 0,
        upcoming_events: upcomingEvents?.length || 0,
        total_participants: participants?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching event statistics:', error);
    }
  };

  const formatTime = (interval: string | null) => {
    if (!interval) return '-';
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (!match) return interval;
    const [, hours, minutes, seconds] = match;
    if (hours !== '00') {
      return `${parseInt(hours)}:${minutes}:${seconds}`;
    }
    return `${parseInt(minutes)}:${seconds}`;
  };

  const getBestTime = (runner: RunnerStat) => {
    switch (distanceFilter) {
      case '5k':
        return formatTime(runner.best_5k_time);
      case '10k':
        return formatTime(runner.best_10k_time);
      case 'half':
        return formatTime(runner.best_half_marathon_time);
      case 'marathon':
        return formatTime(runner.best_marathon_time);
      default:
        return runner.ranking_points.toFixed(0);
    }
  };

  const getDistanceLabel = () => {
    switch (distanceFilter) {
      case '5k':
        return '5K Beste Tid';
      case '10k':
        return '10K Beste Tid';
      case 'half':
        return 'Halvmaraton Beste Tid';
      case 'marathon':
        return 'Marathon Beste Tid';
      default:
        return 'Rankingpoeng';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Statistikk & Rankinglister
          </h1>
        </div>

        {eventStats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Totalt Løp
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{eventStats.total_events}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Kommende Løp
                </h3>
              </div>
              <p className="text-3xl font-bold text-green-600">{eventStats.upcoming_events}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Totalt Deltakere
                </h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">{eventStats.total_participants}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Toppløpere {selectedYear}
          </h2>

          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                År
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Distanse
              </label>
              <select
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="all">Alle (Poeng)</option>
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="half">Halvmaraton</option>
                <option value="marathon">Marathon</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : topRunners.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Ingen statistikk tilgjengelig for {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Navn
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Fylke
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Antall Løp
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Total km
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {getDistanceLabel()}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topRunners.map((runner, index) => (
                    <tr
                      key={runner.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {index < 3 && (
                            <Trophy
                              className={`w-5 h-5 ${
                                index === 0
                                  ? 'text-yellow-500'
                                  : index === 1
                                  ? 'text-slate-400'
                                  : 'text-amber-700'
                              }`}
                            />
                          )}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {runner.profiles?.full_name || 'Ukjent'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {runner.profiles?.home_county || '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-900 dark:text-white">
                        {runner.total_races}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-900 dark:text-white">
                        {runner.total_distance_km.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-900 dark:text-white">
                        {getBestTime(runner)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
