import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, ThumbsUp, Award, DollarSign, Heart, User } from 'lucide-react';

interface Rating {
  id: string;
  rating: number;
  organization_rating: number | null;
  course_rating: number | null;
  atmosphere_rating: number | null;
  value_rating: number | null;
  review_text: string | null;
  would_recommend: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface RaceRatingProps {
  eventId: string;
}

export function RaceRating({ eventId }: RaceRatingProps) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    organization_rating: 0,
    course_rating: 0,
    atmosphere_rating: 0,
    value_rating: 0,
    review_text: '',
    would_recommend: true,
  });

  useEffect(() => {
    fetchRatings();
  }, [eventId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('race_ratings')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRatings(data || []);

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
      }

      if (user) {
        const userRatingData = data?.find((r) => r.user_id === user.id);
        if (userRatingData) {
          setUserRating(userRatingData);
          setFormData({
            rating: userRatingData.rating,
            organization_rating: userRatingData.organization_rating || 0,
            course_rating: userRatingData.course_rating || 0,
            atmosphere_rating: userRatingData.atmosphere_rating || 0,
            value_rating: userRatingData.value_rating || 0,
            review_text: userRatingData.review_text || '',
            would_recommend: userRatingData.would_recommend,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const ratingData = {
        event_id: eventId,
        user_id: user.id,
        ...formData,
      };

      if (userRating) {
        const { error } = await supabase
          .from('race_ratings')
          .update(ratingData)
          .eq('id', userRating.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('race_ratings').insert(ratingData);
        if (error) throw error;
      }

      setShowForm(false);
      fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const StarRating = ({ value, onChange, readonly = false }: any) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Vurderinger
            </h3>
            {ratings.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(averageRating)} readonly />
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {averageRating.toFixed(1)} ({ratings.length} vurderinger)
                </span>
              </div>
            )}
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {userRating ? 'Rediger vurdering' : 'Legg til vurdering'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Totalvurdering *
              </label>
              <StarRating
                value={formData.rating}
                onChange={(value: number) => setFormData({ ...formData, rating: value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  Organisering
                </label>
                <StarRating
                  value={formData.organization_rating}
                  onChange={(value: number) =>
                    setFormData({ ...formData, organization_rating: value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Løype
                </label>
                <StarRating
                  value={formData.course_rating}
                  onChange={(value: number) => setFormData({ ...formData, course_rating: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Stemning
                </label>
                <StarRating
                  value={formData.atmosphere_rating}
                  onChange={(value: number) =>
                    setFormData({ ...formData, atmosphere_rating: value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Pris/kvalitet
                </label>
                <StarRating
                  value={formData.value_rating}
                  onChange={(value: number) => setFormData({ ...formData, value_rating: value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Din anmeldelse
              </label>
              <textarea
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                placeholder="Del dine erfaringer med løpet..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommend"
                checked={formData.would_recommend}
                onChange={(e) => setFormData({ ...formData, would_recommend: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="recommend" className="text-sm text-slate-700 dark:text-slate-300">
                <ThumbsUp className="w-4 h-4 inline mr-1" />
                Jeg anbefaler dette løpet
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Lagre vurdering
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400">
              Ingen vurderinger ennå. Vær den første til å anmelde!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {rating.profiles?.full_name || 'Anonym'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={rating.rating} readonly />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(rating.created_at)}
                    </span>
                  </div>
                </div>

                {(rating.organization_rating ||
                  rating.course_rating ||
                  rating.atmosphere_rating ||
                  rating.value_rating) && (
                  <div className="flex flex-wrap gap-4 mb-3 text-sm text-slate-600 dark:text-slate-400">
                    {rating.organization_rating && (
                      <span>Organisering: {rating.organization_rating}/5</span>
                    )}
                    {rating.course_rating && <span>Løype: {rating.course_rating}/5</span>}
                    {rating.atmosphere_rating && <span>Stemning: {rating.atmosphere_rating}/5</span>}
                    {rating.value_rating && <span>Verdi: {rating.value_rating}/5</span>}
                  </div>
                )}

                {rating.review_text && (
                  <p className="text-slate-700 dark:text-slate-300 mb-2">{rating.review_text}</p>
                )}

                {rating.would_recommend && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Anbefaler løpet</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
