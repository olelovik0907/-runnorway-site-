import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Calendar, MapPin, Loader, Heart, Star, Check, Clock } from 'lucide-react';

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
}

export function EventList() {
  const { user } = useAuth();
  const { t } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [going, setGoing] = useState<Set<string>>(new Set());

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
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
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
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || new Date(event.event_date).getMonth() === parseInt(selectedMonth);
    const matchesRegion = !selectedRegion || event.county === selectedRegion;
    return matchesSearch && matchesMonth && matchesRegion;
  });

  const months = [
    { value: '', label: 'Alle' },
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

  const regions = ['', 'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 'Trøndelag', 'Nordland', 'Troms og Finnmark'];

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
    <section className="bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-1 relative inline-block pb-1" style={{ color: 'var(--brand)' }}>
          Finn løp
          <span className="absolute left-0 bottom-0 w-14 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Søk etter løp i hele Norge og filtrer på måned, region og distanse.
        </p>

        <div className="card p-4 sm:p-6 mb-6">
          <div className="grid gap-3 sm:grid-cols-4 items-end">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Søk</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Søk på navn eller sted"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Måned</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Region</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Alle</option>
                {regions.filter(r => r).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => { setSearchTerm(''); setSelectedMonth(''); setSelectedRegion(''); }}
              className="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition"
            >
              Nullstill
            </button>
            <button
              onClick={() => setSearchTerm('5')}
              className="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition"
            >
              5K
            </button>
            <button
              onClick={() => setSearchTerm('10')}
              className="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition"
            >
              10K
            </button>
            <button
              onClick={() => setSearchTerm('21')}
              className="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition"
            >
              21K
            </button>
          </div>

          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Viser {filteredEvents.length} av {events.length} arrangementer
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--brand)' }} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="card overflow-hidden hover:shadow-xl transition-shadow">
                <div
                  className="h-32 relative"
                  style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}
                >
                  {user && (
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(event.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm font-semibold" style={{ color: 'var(--brand)' }}>
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
                    <button className="btn-brand px-4 py-2 text-sm w-full">
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
    </section>
  );
}
