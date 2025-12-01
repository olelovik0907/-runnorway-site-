import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Calendar, MapPin, TrendingUp } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
  county: string;
  distance_category: string;
  image_url: string;
  distance_km: number;
  entry_fee: number;
  is_free: boolean;
}

interface RecommendedEventsProps {
  onEventClick: (eventId: string) => void;
}

export function RecommendedEvents({ onEventClick }: RecommendedEventsProps) {
  const { user } = useAuth();
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedEvents();
  }, [user]);

  const fetchRecommendedEvents = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_distances, home_county')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.preferred_distances && profile.preferred_distances.length > 0) {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .in('distance_category', profile.preferred_distances)
            .gte('event_date', new Date().toISOString().split('T')[0])
            .order('event_date', { ascending: true })
            .limit(6);

          if (!error && data) {
            setRecommendedEvents(data);
            setIsLoading(false);
            return;
          }
        }
      }

      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .eq('featured', true)
        .order('event_date', { ascending: true })
        .limit(6);

      if (data) {
        setRecommendedEvents(data);
      }
    } catch (error) {
      console.error('Error fetching recommended events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (recommendedEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl" style={{ background: 'var(--brand)' }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {user ? 'Anbefalt for deg' : 'Populære arrangementer'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {user ? 'Basert på dine preferanser og aktivitet' : 'De mest populære løpene akkurat nå'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.map((event, index) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="group card overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
              <div className="relative h-48 overflow-hidden">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {index === 0 && (
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500 rounded-full">
                      <TrendingUp className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">Populært</span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                    {event.county}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {event.title}
                </h3>

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

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {event.distance_km} km
                    </span>
                  </div>
                  <div className="text-right">
                    {event.is_free ? (
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Gratis</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{event.entry_fee} kr</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
