import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Dumbbell, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  sport_type: string;
  difficulty_level: string;
  duration_weeks: number;
  goal_distance: string | null;
  author_id: string;
  profiles: {
    full_name: string;
  } | null;
}

export function TrainingView() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const difficulties = [
    { value: 'all', label: 'Alle nivåer' },
    { value: 'beginner', label: 'Nybegynner' },
    { value: 'intermediate', label: 'Middels' },
    { value: 'advanced', label: 'Avansert' },
  ];

  useEffect(() => {
    fetchPrograms();
  }, [difficultyFilter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('training_programs')
        .select(`
          *,
          profiles:author_id (full_name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching training programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getDifficultyLabel = (level: string) => {
    const difficulty = difficulties.find((d) => d.value === level);
    return difficulty?.label || level;
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Dumbbell className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Treningsprogram
          </h1>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Om treningsprogrammene
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                Her finner du strukturerte treningsprogram laget av erfarne trenere og utøvere.
                Velg program basert på ditt nivå og mål. Husk å tilpasse programmet til din egen form og hverdag.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setDifficultyFilter(diff.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                difficultyFilter === diff.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-700'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Ingen treningsprogram funnet for dette nivået.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                        program.difficulty_level
                      )}`}
                    >
                      {getDifficultyLabel(program.difficulty_level)}
                    </span>
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {program.title}
                  </h3>

                  {program.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {program.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration_weeks} uker</span>
                    </div>
                    {program.goal_distance && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Mål: {program.goal_distance}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Av {program.profiles?.full_name || 'Anonym'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Treningsråd
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li>• Øk intensitet og volum gradvis</li>
              <li>• Ta tilstrekkelig restitusjonstid</li>
              <li>• Varmer opp før hvert treningsøkt</li>
              <li>• Lytt til kroppen din</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              Ernæring
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li>• Spis karbohydrater før lange økter</li>
              <li>• Proteiner for muskelrestitusjon</li>
              <li>• Drikk nok vann gjennom dagen</li>
              <li>• Planlegg måltider rundt trening</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              Skadeforebygging
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li>• Styrketrening 2-3 ganger i uken</li>
              <li>• Strekk og mobilisering daglig</li>
              <li>• Bruk riktig utstyr og sko</li>
              <li>• Søk hjelp ved smerter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
