import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterOptions {
  search: string;
  month: string;
  county: string;
  distanceCategories: string[];
  terrainTypes: string[];
  difficultyLevels: string[];
  priceRange: { min: number; max: number };
  registrationOpen: boolean | null;
  sportType: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export function AdvancedFilters({ filters, onChange, onReset }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const months = [
    { value: '', label: 'Alle måneder' },
    { value: '0', label: 'Januar' },
    { value: '1', label: 'Februar' },
    { value: '2', label: 'Mars' },
    { value: '3', label: 'April' },
    { value: '4', label: 'Mai' },
    { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' },
  ];

  const counties = [
    '', 'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark',
    'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal',
    'Trøndelag', 'Nordland', 'Troms og Finnmark'
  ];

  const distanceCategories = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra'];
  const terrainTypes = ['road', 'trail', 'track', 'mixed'];
  const difficultyLevels = ['easy', 'moderate', 'hard', 'extreme'];
  const sportTypes = [
    { value: '', label: 'Alle' },
    { value: 'running', label: 'Løp' },
    { value: 'ultra', label: 'Ultraløp' },
    { value: 'cross_country', label: 'Langrenn' },
    { value: 'cycling', label: 'Sykkel' },
    { value: 'orienteering', label: 'Orientering' },
    { value: 'multisport', label: 'Multisport' }
  ];

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const activeFilterCount =
    (filters.month ? 1 : 0) +
    (filters.county ? 1 : 0) +
    filters.distanceCategories.length +
    filters.terrainTypes.length +
    filters.difficultyLevels.length +
    (filters.priceRange.min > 0 || filters.priceRange.max < 5000 ? 1 : 0) +
    (filters.registrationOpen !== null ? 1 : 0) +
    (filters.sportType ? 1 : 0);

  return (
    <div className="card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" style={{ color: 'var(--brand)' }} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Filtrer arrangementer
          </h3>
          {activeFilterCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ background: 'var(--brand)' }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium hover:opacity-80 transition"
          style={{ color: 'var(--brand)' }}
        >
          {isExpanded ? (
            <>
              <span>Skjul</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Vis flere</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <label>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Søk</span>
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Søk på navn eller sted"
          />
        </label>

        <label>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Idrett</span>
          <select
            value={filters.sportType}
            onChange={(e) => onChange({ ...filters, sportType: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {sportTypes.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Måned</span>
          <select
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fylke</span>
          <select
            value={filters.county}
            onChange={(e) => onChange({ ...filters, county: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Alle fylker</option>
            {counties.filter(c => c).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Distanse
            </span>
            <div className="flex flex-wrap gap-2">
              {distanceCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleArrayFilter('distanceCategories', category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.distanceCategories.includes(category)
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={filters.distanceCategories.includes(category) ? { background: 'var(--brand)' } : {}}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Underlag
            </span>
            <div className="flex flex-wrap gap-2">
              {terrainTypes.map(terrain => (
                <button
                  key={terrain}
                  onClick={() => toggleArrayFilter('terrainTypes', terrain)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    filters.terrainTypes.includes(terrain)
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={filters.terrainTypes.includes(terrain) ? { background: 'var(--brand)' } : {}}
                >
                  {terrain === 'road' ? 'Vei' : terrain === 'trail' ? 'Terreng' : terrain === 'track' ? 'Bane' : 'Blandet'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Vanskelighetsgrad
            </span>
            <div className="flex flex-wrap gap-2">
              {difficultyLevels.map(level => (
                <button
                  key={level}
                  onClick={() => toggleArrayFilter('difficultyLevels', level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    filters.difficultyLevels.includes(level)
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={filters.difficultyLevels.includes(level) ? { background: 'var(--brand)' } : {}}
                >
                  {level === 'easy' ? 'Lett' : level === 'moderate' ? 'Middels' : level === 'hard' ? 'Krevende' : 'Ekstrem'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Påmelding
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ ...filters, registrationOpen: null })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.registrationOpen === null
                    ? 'text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                style={filters.registrationOpen === null ? { background: 'var(--brand)' } : {}}
              >
                Alle
              </button>
              <button
                onClick={() => onChange({ ...filters, registrationOpen: true })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.registrationOpen === true
                    ? 'text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                style={filters.registrationOpen === true ? { background: 'var(--brand)' } : {}}
              >
                Åpen
              </button>
              <button
                onClick={() => onChange({ ...filters, registrationOpen: false })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.registrationOpen === false
                    ? 'text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                style={filters.registrationOpen === false ? { background: 'var(--brand)' } : {}}
              >
                Stengt
              </button>
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Pris: {filters.priceRange.min} kr - {filters.priceRange.max === 5000 ? '5000+ kr' : `${filters.priceRange.max} kr`}
            </span>
            <div className="flex gap-3 items-center">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.priceRange.min}
                onChange={(e) => onChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, min: parseInt(e.target.value) }
                })}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.priceRange.max}
                onChange={(e) => onChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, max: parseInt(e.target.value) }
                })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Nullstill alle filtre</span>
        </button>
      </div>
    </div>
  );
}
