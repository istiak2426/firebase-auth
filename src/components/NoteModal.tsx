import React, { useState, useEffect } from 'react';
import { X, Pin, Tag, Folder, Palette, Check } from 'lucide-react';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    content: string;
    category: string;
    color: string;
    pinned: boolean;
    tags: string[];
  }) => Promise<void>;
  initialNote?: Note | null;
  categories: string[];
}

const COLOR_PALETTE = [
  { name: 'Indigo', hex: '#6366f1', bgClass: 'bg-indigo-500' },
  { name: 'Emerald', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Amber', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { name: 'Rose', hex: '#f43f5e', bgClass: 'bg-rose-500' },
  { name: 'Sky', hex: '#0ea5e9', bgClass: 'bg-sky-500' },
  { name: 'Purple', hex: '#a855f7', bgClass: 'bg-purple-500' },
  { name: 'Slate', hex: '#64748b', bgClass: 'bg-slate-500' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setColor(initialNote.color || '#6366f1');
      setPinned(Boolean(initialNote.pinned));
      setTags(initialNote.tags || []);
      if (categories.includes(initialNote.category)) {
        setCategory(initialNote.category);
        setIsCustomCategory(false);
      } else {
        setCategory('custom');
        setCustomCategory(initialNote.category || 'General');
        setIsCustomCategory(true);
      }
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setCustomCategory('');
      setIsCustomCategory(false);
      setColor('#6366f1');
      setPinned(false);
      setTags([]);
      setTagInput('');
    }
    setError(null);
  }, [initialNote, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean) && tags.length < 20) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Note title is required.');
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategory.trim() || 'General'
      : category;

    try {
      setSaving(true);
      setError(null);
      await onSave({
        title: title.trim().slice(0, 200),
        content: content.slice(0, 50000),
        category: finalCategory.slice(0, 50),
        color,
        pinned,
        tags,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <span
              className="w-3.5 h-3.5 rounded-full transition-colors shadow-sm"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`p-2 rounded-lg transition-colors ${
                pinned
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={pinned ? 'Pinned to top' : 'Pin note to top'}
            >
              <Pin className={`w-4 h-4 ${pinned ? 'fill-current rotate-45' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q4 Product Roadmap, Project Architecture..."
              maxLength={200}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {title.length}/200
            </div>
          </div>

          {/* Category & Color row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> Category
              </label>
              {!isCustomCategory ? (
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setIsCustomCategory(true);
                        setCustomCategory('');
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ New Category...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Category name"
                    maxLength={50}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory('General');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Color Accent
              </label>
              <div className="flex items-center space-x-2 pt-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and hit Enter (e.g., Firebase, Meeting)..."
                maxLength={40}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Note Content
              </label>
              <span className="text-[11px] text-slate-400">
                Markdown & plain text supported • {content.length} chars
              </span>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes, meeting minutes, thoughts, or checklists..."
              maxLength={50000}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <span>{initialNote ? 'Update Note' : 'Save Note'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
