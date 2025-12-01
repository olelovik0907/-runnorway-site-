import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, User, Eye, MessageCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  sport_type: string;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
}

export function ArticleDetail({ articleId, onBack }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchArticle();
    fetchComments();
    incrementViewCount();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (full_name, avatar_url)
        `)
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('content_type', 'article')
        .eq('content_id', articleId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_article_views', { article_id: articleId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        content_type: 'article',
        content_id: articleId,
        comment_text: commentText,
      });

      if (error) throw error;

      setCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
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

  if (!article) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Artikkelen ble ikke funnet.</p>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Tilbake til artikler
        </button>

        <article className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {article.featured_image_url && (
            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.profiles?.full_name || 'Anonym'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.view_count} visninger</span>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        </article>

        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Kommentarer ({comments.length})
          </h2>

          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Skriv en kommentar..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              rows={3}
            />
            <button
              type="submit"
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Legg til kommentar
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{comment.profiles?.full_name || 'Anonym'}</span>
                  <span>•</span>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{comment.comment_text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
