import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Calendar, Trophy, Loader } from 'lucide-react';

interface Favorite {
  id: string;
  event: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    distance_category: string;
  };
}

export function MyRacesView() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          event:events (
            id,
            title,
            event_date,
            location,
            distance_category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Races</h1>
        <p className="text-slate-600">Track your favorite events and race history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-slate-900">
                Favorite Events
              </h2>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {fav.event.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(fav.event.event_date).toLocaleDateString('no-NO')}
                      </span>
                      <span>{fav.event.location}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {fav.event.distance_category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                <Heart className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No favorite events yet</p>
                <p className="text-sm mt-1">Start exploring events and add them to your favorites</p>
              </div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Stats</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Favorite Events</p>
                <p className="text-2xl font-bold text-slate-900">{favorites.length}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
