import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar, MapPin, Users, DollarSign, Clock, Trophy,
  Heart, Star, Check, Share2, ExternalLink, Loader,
  AlertCircle, Navigation, Mail, Phone, Globe
} from 'lucide-react';

interface EventDetailProps {
  eventId: string;
  onClose: () => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  county: string;
  municipality: string;
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
  registration_url: string;
  event_url: string;
  amenities: string[];
  image_url: string;
  sport_type: string;
  tags: string[];
  featured: boolean;
  registration_count: number;
}

interface Participant {
  id: string;
  full_name: string;
  avatar_url: string;
  username: string;
}

interface Rating {
  id: string;
  rating: number;
  organization_rating: number;
  course_rating: number;
  atmosphere_rating: number;
  value_rating: number;
  review_text: string;
  would_recommend: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export function EventDetail({ eventId, onClose }: EventDetailProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [isGoing, setIsGoing] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [goingCount, setGoingCount] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchEventDetails();
    if (user) {
      fetchUserStatus();
    }
    fetchParticipants();
    fetchRatings();
  }, [eventId, user]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    if (!user) return;

    const { data: favData } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    setIsFavorite(!!favData);

    const { data: interestData } = await supabase
      .from('event_interest')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    setIsInterested(!!interestData);

    const { data: regData } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .eq('registration_status', 'registered')
      .maybeSingle();

    setIsGoing(!!regData);
  };

  const fetchParticipants = async () => {
    const { data: interestData } = await supabase
      .from('event_interest')
      .select('user_id')
      .eq('event_id', eventId);

    setInterestedCount(interestData?.length || 0);

    const { data: regData } = await supabase
      .from('registrations')
      .select('user_id, profiles(id, full_name, avatar_url, username)')
      .eq('event_id', eventId)
      .eq('registration_status', 'registered')
      .limit(10);

    setGoingCount(regData?.length || 0);

    if (regData) {
      const participantList = regData
        .filter(r => r.profiles)
        .map(r => ({
          id: r.profiles.id,
          full_name: r.profiles.full_name,
          avatar_url: r.profiles.avatar_url,
          username: r.profiles.username,
        }));
      setParticipants(participantList);
    }
  };

  const fetchRatings = async () => {
    const { data } = await supabase
      .from('race_ratings')
      .select('*, profiles(full_name, username, avatar_url)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRatings(data);
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAverageRating(avg);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, event_id: eventId });
      setIsFavorite(true);
    }
  };

  const toggleInterested = async () => {
    if (!user) return;
    if (isInterested) {
      await supabase.from('event_interest').delete().eq('user_id', user.id).eq('event_id', eventId);
      setIsInterested(false);
      setInterestedCount(prev => prev - 1);
    } else {
      await supabase.from('event_interest').insert({ user_id: user.id, event_id: eventId });
      setIsInterested(true);
      setInterestedCount(prev => prev + 1);
      if (isGoing) {
        await supabase.from('registrations').delete().eq('user_id', user.id).eq('event_id', eventId);
        setIsGoing(false);
        setGoingCount(prev => prev - 1);
      }
    }
  };

  const toggleGoing = async () => {
    if (!user) return;
    if (isGoing) {
      await supabase.from('registrations').delete().eq('user_id', user.id).eq('event_id', eventId);
      setIsGoing(false);
      setGoingCount(prev => prev - 1);
    } else {
      await supabase.from('registrations').insert({
        user_id: user.id,
        event_id: eventId,
        registration_status: 'registered'
      });
      setIsGoing(true);
      setGoingCount(prev => prev + 1);
      if (isInterested) {
        await supabase.from('event_interest').delete().eq('user_id', user.id).eq('event_id', eventId);
        setIsInterested(false);
        setInterestedCount(prev => prev - 1);
      }
    }
  };

  const shareEvent = async (platform: string) => {
    if (!user) return;
    await supabase.from('event_shares').insert({
      user_id: user.id,
      event_id: eventId,
      platform,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
          <Loader className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--brand)' }} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center text-slate-900 dark:text-white">Event not found</p>
          <button onClick={onClose} className="btn-brand mt-4 w-full">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-start justify-center py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
          <div className="relative h-80">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, #0b4f4d 100%)' }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>

            {user && (
              <button
                onClick={toggleFavorite}
                className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
              </button>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex items-center gap-3 text-white/90">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {event.county}
                    </span>
                    {event.featured && (
                      <span className="px-3 py-1 bg-yellow-500/80 backdrop-blur-sm rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {user && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={toggleInterested}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    isInterested ? 'text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={isInterested ? { background: 'var(--brand)' } : {}}
                >
                  <Star className={`w-5 h-5 ${isInterested ? 'fill-current' : ''}`} />
                  <span>Interessert ({interestedCount})</span>
                </button>
                <button
                  onClick={toggleGoing}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    isGoing ? 'text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={isGoing ? { background: 'var(--brand)' } : {}}
                >
                  <Check className="w-5 h-5" />
                  <span>Skal delta ({goingCount})</span>
                </button>
                <button
                  onClick={() => {
                    shareEvent('generic');
                    navigator.share?.({ title: event.title, url: window.location.href });
                  }}
                  className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Detaljer</h2>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand)' }} />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(event.event_date).toLocaleDateString('nb-NO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {event.event_time && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">Kl. {event.event_time}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand)' }} />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.location}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {event.municipality}, {event.county}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{event.distance_km} km</span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-400 capitalize">{event.distance_category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.is_free ? 'Gratis' : `${event.entry_fee} kr`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  <span className="text-slate-900 dark:text-white">
                    {event.current_participants} av {event.max_participants} plasser fylt
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    event.registration_open
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {event.registration_open ? 'Påmelding åpen' : 'Påmelding stengt'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Om løpet</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>

                {event.amenities && event.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Fasiliteter</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm text-white"
                          style={{ background: 'var(--brand)' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {event.registration_url && (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-brand w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Gå til påmelding</span>
                    </a>
                  )}
                  {event.event_url && (
                    <a
                      href={event.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Arrangørens nettside</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {participants.length > 0 && (
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Deltakere ({goingCount})
                </h3>
                <div className="flex -space-x-2">
                  {participants.slice(0, 8).map((participant) => (
                    <div
                      key={participant.id}
                      className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 overflow-hidden"
                      title={participant.full_name || participant.username}
                    >
                      {participant.avatar_url ? (
                        <img src={participant.avatar_url} alt={participant.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {(participant.full_name || participant.username)?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                  {goingCount > 8 && (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                      +{goingCount - 8}
                    </div>
                  )}
                </div>
              </div>
            )}

            {ratings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Vurderinger ({ratings.length})
                </h3>
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                            {rating.profiles.avatar_url ? (
                              <img src={rating.profiles.avatar_url} alt={rating.profiles.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-semibold text-slate-600 dark:text-slate-400">
                                {rating.profiles.full_name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{rating.profiles.full_name}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(rating.created_at).toLocaleDateString('nb-NO')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rating.review_text && (
                        <p className="text-slate-600 dark:text-slate-300">{rating.review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
