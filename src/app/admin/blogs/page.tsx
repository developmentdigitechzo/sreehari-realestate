'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import RichTextEditor from '@/components/admin/RichTextEditor';
import {
  Newspaper,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Clock,
  User,
  Tag,
  Globe,
  FileText,
  Calendar,
  Grid,
  List as ListIcon,
  Upload,
  RefreshCw,
  Loader2
} from 'lucide-react';

const DEFAULT_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

const CATEGORIES = [
  'All Categories',
  'Buying Guide',
  'Market Trends',
  'Investment',
  'Project Updates',
  'Legal & Approval'
];

const STATUSES = ['All Statuses', 'Published', 'Draft'];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'grid' | 'table' | 'form'
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'form'>('grid');
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);

  // Delete Modal state
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Notification Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Image Upload State & Form Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    category: 'Buying Guide',
    author: 'Sree Hari Realty Editorial',
    read_time: '5 min read',
    image_url: '',
    excerpt: '',
    content: '',
    seo_title: '',
    seo_description: '',
    status: 'Published'
  });

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const res = await api.getBlogs();
      if (res && res.success && Array.isArray(res.data)) {
        setBlogs(res.data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
      showToast('Error loading blog articles');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleTitleChange(val: string) {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: generatedSlug,
      seo_title: (!prev.seo_title || prev.seo_title === prev.title) ? val : prev.seo_title
    }));
  }

  function handleCreateNew() {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Buying Guide',
      author: 'Sree Hari Realty Editorial',
      read_time: '5 min read',
      image_url: '',
      excerpt: '',
      content: '',
      seo_title: '',
      seo_description: '',
      status: 'Published'
    });
    setViewMode('form');
  }

  function handleEdit(blog: BlogPost) {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'Buying Guide',
      author: blog.author || 'Sree Hari Realty Editorial',
      read_time: blog.read_time || '5 min read',
      image_url: blog.image_url || blog.banner_image || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
      status: blog.status || 'Published'
    });
    setViewMode('form');
  }

  function handleView(blog: BlogPost) {
    setViewingBlog(blog);
    setIsViewModalOpen(true);
  }

  async function handleImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.png, .jpg, .jpeg, .webp)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const uploadRes = await api.uploadMedia({
          imageBase64: base64Data,
          filename: file.name
        });
        if (uploadRes && uploadRes.success && uploadRes.fileUrl) {
          setFormData((prev) => ({ ...prev, image_url: uploadRes.fileUrl }));
          showToast('Image uploaded successfully');
        } else {
          setFormData((prev) => ({ ...prev, image_url: base64Data }));
          showToast('Image loaded successfully');
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, image_url: base64Data }));
        showToast('Image loaded successfully');
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(targetStatus?: 'Published' | 'Draft') {
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter article title / heading');
      return;
    }

    const currentStatus = targetStatus || formData.status || 'Published';
    const computedSlug = formData.slug && formData.slug.trim()
      ? formData.slug.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      : formData.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    const finalImage = formData.image_url && formData.image_url.trim() !== ''
      ? formData.image_url.trim()
      : DEFAULT_BLOG_IMAGE;

    const payload = {
      ...formData,
      status: currentStatus,
      slug: computedSlug,
      image_url: finalImage,
      banner_image: finalImage,
      seo_title: formData.seo_title || formData.title,
      seo_description: formData.seo_description || formData.excerpt
    };

    setIsSaving(true);
    try {
      if (editingBlog && editingBlog.id) {
        const res = await api.updateBlog(editingBlog.id, payload);
        if (res && res.success) {
          showToast(
            currentStatus === 'Draft'
              ? 'Blog article saved as Draft (Hidden from website)'
              : 'Blog article updated and live on website'
          );
        } else {
          showToast(res.message || 'Failed to update article');
        }
      } else {
        const res = await api.createBlog(payload);
        if (res && res.success) {
          showToast(
            currentStatus === 'Draft'
              ? 'New blog article saved as Draft (Hidden from website)'
              : 'New blog article published and live on website'
          );
        } else {
          showToast(res.message || 'Failed to create article');
        }
      }
      await loadBlogs();
      setViewMode('grid');
    } catch (err: any) {
      showToast('Error saving article: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingBlogId) return;
    try {
      const res = await api.deleteBlog(deletingBlogId);
      if (res && res.success) {
        showToast('Blog article deleted successfully');
        await loadBlogs();
      } else {
        showToast(res.message || 'Failed to delete article');
      }
    } catch (err: any) {
      showToast('Delete failed: ' + err.message);
    } finally {
      setDeletingBlogId(null);
    }
  }

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      blog.title.toLowerCase().includes(q) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(q)) ||
      (blog.category && blog.category.toLowerCase().includes(q)) ||
      (blog.author && blog.author.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'All Categories' || blog.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All Statuses' || blog.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Blog Manager
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage real estate articles, guides, market news & SEO articles
              </p>
            </div>
          </div>
        </div>

        {viewMode !== 'form' && (
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Grid View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" /> Table View
              </button>
            </div>

            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 border border-emerald-400/30 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Write New Article
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE: FORM (Create / Edit Article) */}
      {viewMode === 'form' ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className="text-slate-400 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Articles List
            </button>
            <h2 className="text-base font-semibold text-emerald-400">
              {editingBlog ? 'Edit Blog Article' : 'Create & Publish New Blog Article'}
            </h2>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(formData.status || 'Published'); }} className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-amber-400" /> Article Metadata & Header Content
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Article Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Complete Guide to Buying DTCP Approved Plots in Trichy"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">URL Slug</label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = (formData.title || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                        setFormData((prev) => ({ ...prev, slug: s }));
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Sync slug with current title"
                    >
                      <RefreshCw className="w-3 h-3" /> Sync with Title
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') })}
                    placeholder="dtcp-approved-plots-trichy-guide"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 placeholder-slate-600 focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-500">Auto-generated from title. Accessible at /blog/{"{"}slug{"}"}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={formData.category || 'Buying Guide'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Author Name</label>
                  <input
                    type="text"
                    value={formData.author || 'Sree Hari Realty Editorial'}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Read Time Estimate</label>
                  <input
                    type="text"
                    value={formData.read_time || '5 min read'}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Status</label>
                  <select
                    value={formData.status || 'Published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  >
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Draft">Draft (Internal Only)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" /> Cover / Header Image
                    </label>
                    {formData.image_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        Reset to Default Image
                      </button>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {/* Upload button and URL input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full min-h-[42px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>Upload Image from Device</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="sm:col-span-8">
                      <input
                        type="url"
                        value={formData.image_url || ''}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Or paste image URL (https://images.unsplash.com/...)"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload an image file from your computer or paste an external image link. Leave blank to use default real estate layout image.
                  </p>
                </div>

                {/* Cover Image Preview */}
                <div className="md:col-span-2">
                  <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url && formData.image_url.trim() !== '' ? formData.image_url : DEFAULT_BLOG_IMAGE}
                      alt="Blog Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-4">
                      <span className="text-[11px] text-slate-300 font-medium bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 backdrop-blur-md">
                        {formData.image_url ? 'Custom Upload / URL' : 'Default Real Estate Cover'}
                      </span>
                      {formData.image_url && (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Active Image
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" /> Article Content & Summary
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Short Excerpt / Summary <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief 2-3 sentence overview displayed on blog index card grid..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Full Article Body (Rich Text & Visual / HTML Editor) <span className="text-amber-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content || ''}
                  onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                  placeholder="Write full article body content, format text, and insert media..."
                  minHeight="380px"
                />
              </div>
            </div>

            {/* SEO Settings & Snippet Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-amber-400" /> SEO Optimization & Search Engine Snippet Preview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.seo_title || ''}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="DTCP Approved Plots Guide Trichy 2026"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SEO Meta Description</label>
                  <input
                    type="text"
                    value={formData.seo_description || ''}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Discover step-by-step guidance on DTCP layout approval..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>

                {/* Google Snippet Card */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <GoogleIcon className="w-3.5 h-3.5" /> https://sreeharirealty.com › blog › {formData.slug || 'article-slug'}
                  </div>
                  <h4 className="text-sm font-medium text-blue-400 truncate hover:underline cursor-pointer">
                    {formData.seo_title || formData.title || 'Article Title Preview'} | Sree Hari Realty Promoters
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {formData.seo_description || formData.excerpt || 'Article summary description snippet preview will appear here in Google Search results.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* Save as Draft Button */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave('Draft')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/40 flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Save as Draft</span>
              </button>

              {/* Save & Publish Button */}
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave('Published')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all border border-emerald-400/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{editingBlog ? 'Update & Publish Article' : 'Save & Publish Article'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VIEW MODE: LIST / GRID */
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, excerpt, category, author..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {(searchQuery || categoryFilter !== 'All Categories' || statusFilter !== 'All Statuses') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All Categories');
                    setStatusFilter('All Statuses');
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-amber-400">{filteredBlogs.length}</strong> of{' '}
              <strong className="text-slate-200">{blogs.length}</strong> blog articles
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">No blog articles found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try adjusting your search query or category filters, or click Write New Article to publish a new post.
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Write First Article
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW CARDS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl overflow-hidden shadow-lg transition-all group flex flex-col"
                >
                  {/* Card Cover Image */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.image_url || DEFAULT_BLOG_IMAGE}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${
                          blog.status === 'Published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {blog.status || 'Published'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                        {blog.category || 'Guide'}
                      </span>
                    </div>

                    {/* Read Time & Date overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {blog.read_time || '5 min read'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />{' '}
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '2026'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {blog.excerpt || blog.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-amber-400 shrink-0" /> {blog.author || 'Sree Hari Editorial'}
                      </span>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(blog)}
                          title="View Article Details"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          title="Edit Article"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBlogId(blog.id)}
                          title="Delete Article"
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3.5">Article</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Author</th>
                      <th className="px-4 py-3.5">Read Time</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredBlogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={blog.image_url || DEFAULT_BLOG_IMAGE}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-white truncate">{blog.title}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">/blog/{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-amber-400">{blog.category}</td>
                        <td className="px-4 py-3.5 text-slate-300">{blog.author || 'Editorial'}</td>
                        <td className="px-4 py-3.5 text-slate-400">{blog.read_time || '5 min'}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              blog.status === 'Published'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(blog)}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(blog)}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingBlogId(blog.id)}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ARTICLE VIEW MODAL */}
      {isViewModalOpen && viewingBlog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prominent High-Z Close 'X' Button */}
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-950/95 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-700 shadow-2xl transition-all cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Modal Image Header */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingBlog.image_url || DEFAULT_BLOG_IMAGE}
                alt={viewingBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                    {viewingBlog.category}
                  </span>
                  <h2 className="text-xl font-bold text-white drop-shadow-md">{viewingBlog.title}</h2>
                </div>
              </div>
            </div>

            {/* Article Details Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-b border-slate-800 pb-4">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" /> {viewingBlog.author || 'Editorial Team'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> {viewingBlog.read_time || '5 min read'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-amber-400/80">
                <Globe className="w-4 h-4 text-amber-400" /> /blog/{viewingBlog.slug}
              </span>
            </div>

            {/* Excerpt Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Summary Excerpt</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">{viewingBlog.excerpt}</p>
            </div>

            {/* Full Content */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Content Body</span>
              <div
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans max-h-80 overflow-y-auto prose prose-invert max-w-none prose-img:rounded-xl prose-a:text-amber-400"
                dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
              />
            </div>

            {/* SEO Metadata */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-amber-400" /> Search Engine Preview
              </span>
              <p className="text-xs font-semibold text-blue-400">{viewingBlog.seo_title || viewingBlog.title}</p>
              <p className="text-[11px] text-slate-400">{viewingBlog.seo_description || viewingBlog.excerpt}</p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                viewingBlog.status === 'Published'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Status: {viewingBlog.status || 'Published'}
              </span>

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingBlogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Delete Blog Article?</h3>
              <p className="text-xs text-slate-400">
                This action will permanently remove this blog post from PostgreSQL database and website feed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingBlogId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
