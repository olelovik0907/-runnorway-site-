import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Calendar, MapPin, Loader, Heart, Star, Check, Clock } from 'lucide-react';
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import { EventDetail } from './EventDetail';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  county: string;
  distance_category: string;
  distance_km: number;
  difficulty_level: string;
  terrain_type: string;
  entry_fee: number;
  is_free: boolean;
  organizer: string;
  max_participants: number;
  current_participants: number;
  registration_open: boolean;
  registration_deadline?: string;
  image_url?: string | null;
  sport_type?: string;
}

const defaultFilters: FilterOptions = {
  search: '',
  month: '',
  county: '',
  distanceCategories: [],
  terrainTypes: [],
  difficultyLevels: [],
  priceRange: { min: 0, max: 5000 },
  registrationOpen: null,
  sportType: '',
};

export function EventList() {
  const { user } = useAuth();
  const { t } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [going, setGoing] = useState<Set<string>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchFavorites();
      fetchRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching events from Supabase...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      console.log('Supabase response:', { data, error });
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Events fetched successfully:', data?.length || 0);
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('event_id')
      .eq('user_id', user.id);
    if (data) setFavorites(new Set(data.map(f => f.event_id)));
  };

  const fetchRegistrations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('registrations')
      .select('event_id, registration_status')
      .eq('user_id', user.id);

    if (data) {
      const interestedSet = new Set<string>();
      const goingSet = new Set<string>();
      data.forEach(reg => {
        if (reg.registration_status === 'interested') interestedSet.add(reg.event_id);
        else if (reg.registration_status === 'registered') goingSet.add(reg.event_id);
      });
      setInterested(interestedSet);
      setGoing(goingSet);
    }
  };

  const toggleFavorite = async (eventId: string) => {
    if (!user) return;
    if (favorites.has(eventId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
      setFavorites(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, event_id: eventId });
      setFavorites(prev => new Set(prev).add(eventId));
    }
  };

  const toggleInterested = async (eventId: string) => {
    if (!user) return;
    if (interested.has(eventId)) {
      await supabase.from('registrations').delete().eq('user_id', user.id).eq('event_id', eventId);
      setInterested(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    } else {
      await supabase.from('registrations').upsert({ user_id: user.id, event_id: eventId, registration_status: 'interested' });
      setInterested(prev => new Set(prev).add(eventId));
      setGoing(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    }
  };

  const toggleGoing = async (eventId: string) => {
    if (!user) return;
    if (going.has(eventId)) {
      await supabase.from('registrations').delete().eq('user_id', user.id).eq('event_id', eventId);
      setGoing(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    } else {
      await supabase.from('registrations').upsert({ user_id: user.id, event_id: eventId, registration_status: 'registered' });
      setGoing(prev => new Set(prev).add(eventId));
      setInterested(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !filters.search ||
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.location.toLowerCase().includes(filters.search.toLowerCase());

    const matchesMonth = !filters.month ||
      new Date(event.event_date).getMonth() === parseInt(filters.month);

    const matchesCounty = !filters.county || event.county === filters.county;

    const matchesDistance = filters.distanceCategories.length === 0 ||
      filters.distanceCategories.includes(event.distance_category);

    const matchesTerrain = filters.terrainTypes.length === 0 ||
      filters.terrainTypes.includes(event.terrain_type);

    const matchesDifficulty = filters.difficultyLevels.length === 0 ||
      filters.difficultyLevels.includes(event.difficulty_level);

    const matchesPrice = event.is_free ||
      (event.entry_fee >= filters.priceRange.min && event.entry_fee <= filters.priceRange.max);

    const matchesRegistration = filters.registrationOpen === null ||
      event.registration_open === filters.registrationOpen;

    const matchesSport = !filters.sportType || event.sport_type === filters.sportType;

    return matchesSearch && matchesMonth && matchesCounty && matchesDistance &&
           matchesTerrain && matchesDifficulty && matchesPrice && matchesRegistration && matchesSport;
  });


  const getCountdown = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();

    if (diff < 0) return 'Avholdt';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} dag${days !== 1 ? 'er' : ''}`;
    if (hours > 0) return `${hours} time${hours !== 1 ? 'r' : ''}`;
    return 'I dag';
  };

  return (
    <section className="bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--brand)' }}>
          Finn løp
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Søk etter løp i hele Norge og filtrer på måned, region og distanse.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Søk på navn eller sted"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full max-w-2xl px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilters(defaultFilters)}
            className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
          >
            Nullstill
          </button>
          {['5K', '10K', '21K'].map(dist => (
            <button
              key={dist}
              onClick={() => {
                const isSelected = filters.distanceCategories.includes(dist);
                setFilters({
                  ...filters,
                  distanceCategories: isSelected
                    ? filters.distanceCategories.filter(d => d !== dist)
                    : [...filters.distanceCategories, dist]
                });
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                filters.distanceCategories.includes(dist)
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>

        <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Viser {filteredEvents.length} av {events.length} arrangementer
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--brand)' }} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="card overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {user && (
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(event.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-sm font-semibold" style={{ color: 'var(--brand)' }}>
                      {event.county}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 flex-1">
                      {event.title}
                    </h3>
                    <div className="ml-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--brand)', color: 'white' }}>
                      <Clock className="w-3 h-3" />
                      {getCountdown(event.event_date)}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-2" style={{ color: 'var(--brand)' }} />
                      {new Date(event.event_date).toLocaleDateString('nb-NO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mr-2" style={{ color: 'var(--brand)' }} />
                      {event.location}
                    </div>
                  </div>

                  {user && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => toggleInterested(event.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          interested.has(event.id)
                            ? 'text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        style={interested.has(event.id) ? { background: 'var(--brand)' } : {}}
                      >
                        <Star className={`w-4 h-4 ${interested.has(event.id) ? 'fill-current' : ''}`} />
                        <span>{t('interested')}</span>
                      </button>
                      <button
                        onClick={() => toggleGoing(event.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          going.has(event.id)
                            ? 'text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        style={going.has(event.id) ? { background: 'var(--brand)' } : {}}
                      >
                        <Check className={`w-4 h-4`} />
                        <span>{t('going')}</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {event.is_free ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">Gratis</span>
                        ) : (
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {event.entry_fee} kr
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        event.registration_open
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {event.registration_open ? 'Påmelding åpen' : 'Påmelding stengt'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedEventId(event.id)}
                      className="btn-brand px-4 py-2 text-sm w-full"
                    >
                      Les mer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Ingen arrangementer matcher filtrene.
            </p>
          </div>
        )}
      </div>

      {selectedEventId && (
        <EventDetail
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </section>
  );
}
