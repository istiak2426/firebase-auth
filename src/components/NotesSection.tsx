import React, { useState } from 'react';
import {
  Plus,
  Pin,
  Trash2,
  Edit3,
  Copy,
  Check,
  Tag,
  Folder,
  FileText,
  Search,
} from 'lucide-react';
import { Note } from '../types';

interface NotesSectionProps {
  notes: Note[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onOpenNewNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onOpenNewNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      selectedCategory === 'All' || n.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const renderNoteCard = (note: Note) => (
    <div
      key={note.id}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-5 right-5 h-1 rounded-b"
        style={{ backgroundColor: note.color || '#6366f1' }}
      />

      <div>
        {/* Header row: category badge & actions */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Folder className="w-3 h-3 text-slate-400" />
            {note.category}
          </span>

          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onTogglePin(note)}
              className={`p-1.5 rounded-lg transition-colors ${
                note.pinned
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={note.pinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current rotate-45' : ''}`} />
            </button>

            <button
              onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy note text"
            >
              {copiedId === note.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => onEditNote(note)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit note"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDeleteNote(note)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-2 line-clamp-2">
          {note.title}
        </h3>

        {/* Content Preview */}
        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line line-clamp-5 font-normal leading-relaxed mb-4">
          {note.content}
        </p>
      </div>

      <div>
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-md text-[11px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer timestamp */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <span>Updated {formatDate(note.updatedAt)}</span>
          <span className="text-[10px] text-slate-400">
            {note.content.length} chars
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top action bar: categories filter & new note button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenNewNote}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Cloud Note</span>
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {searchQuery ? 'No notes match your search' : 'No notes in this category yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {searchQuery
              ? `Try adjusting your search terms or clear the filter.`
              : `Create your first note to store thoughts, plans, and snippets synchronized to the cloud.`}
          </p>
          <button
            onClick={onOpenNewNote}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned section if present */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-current rotate-45" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pinnedNotes.map(renderNoteCard)}
              </div>
            </div>
          )}

          {/* Regular notes section */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center space-x-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Other Notes ({otherNotes.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherNotes.map(renderNoteCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
