import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Mountain, Snowflake, Bike, Compass, Zap } from 'lucide-react';

interface SportCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  distance_km: number | null;
  sport_type: string;
}

export function SportCategoriesView() {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchEventsBySport(selectedSport);
    }
  }, [selectedSport]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sport_categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedSport(data[0].name);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsBySport = async (sportType: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('sport_type', sportType)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getSportIcon = (name: string) => {
    switch (name) {
      case 'running':
        return <Activity className="w-8 h-8" />;
      case 'ultra':
        return <Mountain className="w-8 h-8" />;
      case 'cross_country':
        return <Snowflake className="w-8 h-8" />;
      case 'cycling':
        return <Bike className="w-8 h-8" />;
      case 'orienteering':
        return <Compass className="w-8 h-8" />;
      case 'multisport':
        return <Zap className="w-8 h-8" />;
      default:
        return <Activity className="w-8 h-8" />;
    }
  };

  const getSportColor = (name: string) => {
    switch (name) {
      case 'running':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'ultra':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'cross_country':
        return 'bg-cyan-600 hover:bg-cyan-700';
      case 'cycling':
        return 'bg-green-600 hover:bg-green-700';
      case 'orienteering':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'multisport':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Idrettsgrener</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedSport(category.name)}
              className={`p-6 rounded-xl text-white transition-all transform hover:scale-105 ${getSportColor(
                category.name
              )} ${
                selectedSport === category.name
                  ? 'ring-4 ring-white dark:ring-slate-700 shadow-xl'
                  : 'shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {getSportIcon(category.name)}
                <h3 className="text-2xl font-bold">{category.display_name}</h3>
              </div>
              {category.description && (
                <p className="text-white/90 text-sm">{category.description}</p>
              )}
            </button>
          ))}
        </div>

        {selectedSport && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Kommende {categories.find((c) => c.name === selectedSport)?.display_name}-arrangement
            </h2>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Ingen kommende arrangement funnet for denne idretten.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {event.location}
                          </span>
                          <span>{formatDate(event.event_date)}</span>
                          {event.distance_km && <span>{event.distance_km} km</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
