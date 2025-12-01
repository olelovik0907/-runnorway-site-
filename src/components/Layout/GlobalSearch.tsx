import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Users, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchResult {
  id: string;
  type: 'event' | 'article' | 'club';
  title: string;
  subtitle?: string;
  date?: string;
}

interface GlobalSearchProps {
  onSelectResult: (type: string, id: string) => void;
}

export function GlobalSearch({ onSelectResult }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchQuery = `%${query}%`;

        const [eventsRes, articlesRes] = await Promise.all([
          supabase
            .from('events')
            .select('id, title, location, event_date')
            .or(`title.ilike.${searchQuery},location.ilike.${searchQuery}`)
            .limit(5),
          supabase
            .from('articles')
            .select('id, title, excerpt, published_at')
            .or(`title.ilike.${searchQuery},excerpt.ilike.${searchQuery}`)
            .not('published_at', 'is', null)
            .limit(5),
        ]);

        const allResults: SearchResult[] = [];

        if (eventsRes.data) {
          allResults.push(...eventsRes.data.map(event => ({
            id: event.id,
            type: 'event' as const,
            title: event.title,
            subtitle: event.location,
            date: event.event_date,
          })));
        }

        if (articlesRes.data) {
          allResults.push(...articlesRes.data.map(article => ({
            id: article.id,
            type: 'article' as const,
            title: article.title,
            subtitle: article.excerpt,
            date: article.published_at,
          })));
        }

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelectResult(result.type, result.id);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'club':
        return <Users className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event':
        return 'Arrangement';
      case 'article':
        return 'Artikkel';
      case 'club':
        return 'Klubb';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk etter arrangementer, artikler..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left flex items-start gap-3"
                  >
                    <div className="mt-1" style={{ color: 'var(--brand)' }}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex-shrink-0">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                      {result.date && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(result.date).toLocaleDateString('nb-NO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Ingen resultater funnet
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                Skriv minst 2 tegn for å søke
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
