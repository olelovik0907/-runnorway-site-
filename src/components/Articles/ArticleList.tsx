import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Newspaper, Clock, User, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  sport_type: string;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  author_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface ArticleListProps {
  onArticleClick: (articleId: string) => void;
}

export function ArticleList({ onArticleClick }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { t } = useApp();

  const categories = [
    { value: 'all', label: 'Alle artikler' },
    { value: 'news', label: 'Nyheter' },
    { value: 'training', label: 'Treningsråd' },
    { value: 'nutrition', label: 'Kosthold' },
    { value: 'injury', label: 'Skadeforebygging' },
    { value: 'interview', label: 'Intervjuer' },
    { value: 'race_report', label: 'Løpsrapporter' },
    { value: 'review', label: 'Anmeldelser' },
  ];

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (full_name)
        `)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Artikler & Nyheter
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Ingen artikler funnet i denne kategorien.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                onClick={() => onArticleClick(article.id)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
              >
                {article.featured_image_url && (
                  <div className="aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img
                      src={article.featured_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-medium">
                      {categories.find((c) => c.value === article.category)?.label || article.category}
                    </span>
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <User className="w-4 h-4" />
                      <span>{article.profiles?.full_name || 'Anonym'}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
