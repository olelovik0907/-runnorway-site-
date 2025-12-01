import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Plus, Clock, Eye, Tag, User, Edit, Trash2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
  } | null;
}

export function BlogView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (!user) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const postData = {
        title: formData.title,
        slug,
        content: formData.content,
        excerpt: formData.excerpt || null,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : null,
        published: formData.published,
        published_at: formData.published ? new Date().toISOString() : null,
        author_id: user.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', excerpt: '', tags: '', published: false });
      fetchPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      tags: post.tags?.join(', ') || '',
      published: post.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette blogginnlegget?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (selectedPost) {
    return (
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Tilbake til blogg
          </button>

          <article className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{selectedPost.profiles?.full_name || 'Anonym'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(selectedPost.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{selectedPost.view_count} visninger</span>
              </div>
            </div>

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\n/g, '<br />') }} />
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Blogg</h1>
          </div>
          {user && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingPost(null);
                setFormData({ title: '', content: '', excerpt: '', tags: '', published: false });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nytt innlegg
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 space-y-4"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {editingPost ? 'Rediger innlegg' : 'Nytt blogginnlegg'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tittel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sammendrag
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Innhold *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={12}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags (kommaseparert)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="løping, trening, motivasjon"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="published" className="text-sm text-slate-700 dark:text-slate-300">
                Publiser umiddelbart
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                {editingPost ? 'Oppdater' : 'Publiser'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                }}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Ingen blogginnlegg ennå.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  {!post.published && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs font-medium mb-2">
                      Utkast
                    </span>
                  )}

                  <h3
                    onClick={() => post.published && setSelectedPost(post)}
                    className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
                  >
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.profiles?.full_name || 'Anonym'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>

                  {user && user.id === post.author_id && (
                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Rediger
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Slett
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
