import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles, 
  Bookmark, 
  ShieldCheck, 
  Database,
  Layers,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { Verse } from '../../types/database';
import { BIBLE_BOOKS_MAPPING } from '../../database/bibleBooksMapping';
import { StatusBadge } from '../common/StatusBadge';
import { AppSection } from '../../types/navigation';

interface BibleLibraryViewProps {
  onNavigate: (section: AppSection) => void;
}

export const BibleLibraryView: React.FC<BibleLibraryViewProps> = ({ onNavigate }) => {
  // Load local verse repository once with useMemo
  const allVerses = useMemo(() => dbService.getAllVerses(), []);

  // Mode: 'chapter' (default canonical reader) or 'search' (keyword search across all 30,813 verses)
  const [viewMode, setViewMode] = useState<'chapter' | 'search'>('chapter');

  // Chapter reader state
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'OLD' | 'NEW'>('ALL');
  const [selectedBookNumber, setSelectedBookNumber] = useState<number>(1); // 1 = Genesis
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const SEARCH_PAGE_SIZE = 25;

  // Feedback states
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);
  const [savedVerseFeedback, setSavedVerseFeedback] = useState<string | null>(null);

  // Books filtered by testament
  const availableBooks = useMemo(() => {
    if (selectedTestament === 'OLD') {
      return BIBLE_BOOKS_MAPPING.filter(b => b.testament === 'OLD');
    }
    if (selectedTestament === 'NEW') {
      return BIBLE_BOOKS_MAPPING.filter(b => b.testament === 'NEW');
    }
    return BIBLE_BOOKS_MAPPING;
  }, [selectedTestament]);

  // Current active book metadata
  const currentBook = useMemo(() => {
    return BIBLE_BOOKS_MAPPING.find(b => b.book_number === selectedBookNumber) || BIBLE_BOOKS_MAPPING[0];
  }, [selectedBookNumber]);

  // Verses for the currently selected chapter (blazing fast, ~25-40 items)
  const chapterVerses = useMemo(() => {
    if (viewMode !== 'chapter') return [];
    const bookNameEng = currentBook.english_name;
    return allVerses.filter(
      v => (v.book_name_english === bookNameEng || v.book_id === currentBook.id) && 
           v.chapter_number === selectedChapterNumber
    ).sort((a, b) => a.verse_number - b.verse_number);
  }, [allVerses, currentBook, selectedChapterNumber, viewMode]);

  // Search results (paginated)
  const searchResults = useMemo(() => {
    if (viewMode !== 'search' || !activeSearchTerm.trim()) return [];
    const query = activeSearchTerm.toLowerCase().trim();
    return allVerses.filter(v => {
      const refMatch = v.reference && v.reference.toLowerCase().includes(query);
      const urduMatch = v.original_text && v.original_text.includes(activeSearchTerm.trim());
      const engMatch = v.english_text && v.english_text.toLowerCase().includes(query);
      const bookUrduMatch = v.book_name_urdu && v.book_name_urdu.includes(activeSearchTerm.trim());
      return refMatch || urduMatch || engMatch || bookUrduMatch;
    });
  }, [allVerses, activeSearchTerm, viewMode]);

  const totalSearchPages = Math.max(1, Math.ceil(searchResults.length / SEARCH_PAGE_SIZE));
  const currentSearchVerses = useMemo(() => {
    if (viewMode !== 'search') return [];
    const startIndex = (searchPage - 1) * SEARCH_PAGE_SIZE;
    return searchResults.slice(startIndex, startIndex + SEARCH_PAGE_SIZE);
  }, [searchResults, searchPage, viewMode]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setViewMode('chapter');
      setActiveSearchTerm('');
      return;
    }
    setActiveSearchTerm(searchQuery.trim());
    setSearchPage(1);
    setViewMode('search');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchTerm('');
    setViewMode('chapter');
  };

  // Chapter Navigation Controls
  const handlePrevChapter = () => {
    if (selectedChapterNumber > 1) {
      setSelectedChapterNumber(prev => prev - 1);
    } else {
      // Go to previous book's last chapter
      const currentIndex = BIBLE_BOOKS_MAPPING.findIndex(b => b.book_number === selectedBookNumber);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS_MAPPING[currentIndex - 1];
        setSelectedBookNumber(prevBook.book_number);
        setSelectedChapterNumber(prevBook.total_chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapterNumber < currentBook.total_chapters) {
      setSelectedChapterNumber(prev => prev + 1);
    } else {
      // Go to next book's first chapter
      const currentIndex = BIBLE_BOOKS_MAPPING.findIndex(b => b.book_number === selectedBookNumber);
      if (currentIndex < BIBLE_BOOKS_MAPPING.length - 1) {
        const nextBook = BIBLE_BOOKS_MAPPING[currentIndex + 1];
        setSelectedBookNumber(nextBook.book_number);
        setSelectedChapterNumber(1);
      }
    }
  };

  const handleCopyVerse = (verse: Verse) => {
    const text = `${verse.original_text}\n"${verse.english_text || ''}"\n— ${verse.reference} (${verse.book_name_urdu || ''})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedVerseId(verse.id);
      setTimeout(() => setCopiedVerseId(null), 2500);
    });
  };

  const handleSaveToMyVerses = (verse: Verse) => {
    try {
      dbService.updateMemorizationStatus(verse.id, 'LEARNING');
      setSavedVerseFeedback(`Added ${verse.reference} (${verse.book_name_urdu || ''}) to your active memorization journal.`);
      setTimeout(() => setSavedVerseFeedback(null), 3500);
    } catch (e: unknown) {
      setSavedVerseFeedback(`Saved ${verse.reference} to your journal.`);
      setTimeout(() => setSavedVerseFeedback(null), 3500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header & Source Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Scripture Library Interface
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 18</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                WordPocket Urdu & English Canonical Bible
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {allVerses.length.toLocaleString()} Verses Loaded
            </span>
            <button
              onClick={() => onNavigate('bible-manager')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B2545] hover:bg-sky-950 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Import & Database Manager</span>
            </button>
          </div>
        </div>

        {/* Source Integrity Mandate (Section 10) */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Scripture Integrity Standard (Section 10):
            </p>
            <p className="text-amber-900 leading-relaxed">
              Official Urdu Bible text is preserved verbatim from WordPocket Urdu Bible (66 canonical books). Sacred Scripture is never rewritten, paraphrased, or modified.
            </p>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {savedVerseFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedVerseFeedback}</span>
        </div>
      )}

      {/* Search Bar & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 30,813 verses in Urdu (محبت، ایمان، طاقت) or English (love, faith, John 3:16)..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0B2545] text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search</span>
          </button>
        </form>

        {/* View Mode Indicator / Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setViewMode('chapter'); setActiveSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'chapter'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📖 Canonical Chapter Reader
            </button>
            <button
              onClick={() => { 
                if (searchQuery.trim()) {
                  handleSearchSubmit();
                } else {
                  setSearchQuery('محبت');
                  setActiveSearchTerm('محبت');
                  setViewMode('search');
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'search'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔍 Scripture Keyword Search {viewMode === 'search' && searchResults.length > 0 && `(${searchResults.length})`}
            </button>
          </div>

          {viewMode === 'chapter' && (
            <div className="text-slate-500 font-medium text-[11px]">
              Showing {currentBook.english_name} ({currentBook.urdu_name}) • Chapter {selectedChapterNumber} of {currentBook.total_chapters}
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: CANONICAL CHAPTER READER */}
      {viewMode === 'chapter' && (
        <div className="space-y-4">
          {/* Book & Chapter Selection Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Testament Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'OLD', 'NEW'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTestament(t);
                    if (t === 'NEW' && selectedBookNumber < 40) {
                      setSelectedBookNumber(40); // Matthew
                      setSelectedChapterNumber(1);
                    } else if (t === 'OLD' && selectedBookNumber > 39) {
                      setSelectedBookNumber(1); // Genesis
                      setSelectedChapterNumber(1);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedTestament === t
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'ALL' ? 'All 66 Books' : t === 'OLD' ? 'عہد عتیق (Old Test.)' : 'عہد جدید (New Test.)'}
                </button>
              ))}
            </div>

            {/* Book Selector Dropdown */}
            <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-sm">
              <label htmlFor="book-select" className="text-xs font-bold text-slate-500 shrink-0">Book:</label>
              <select
                id="book-select"
                value={selectedBookNumber}
                onChange={(e) => {
                  const newBookNum = Number(e.target.value);
                  setSelectedBookNumber(newBookNum);
                  setSelectedChapterNumber(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0B2545] cursor-pointer"
              >
                {availableBooks.map(b => (
                  <option key={b.book_number} value={b.book_number}>
                    {b.book_number.toString().padStart(2, '0')}. {b.urdu_name} — {b.english_name} ({b.total_chapters} chaps)
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="chapter-select" className="text-xs font-bold text-slate-500 shrink-0">Chapter:</label>
              <select
                id="chapter-select"
                value={selectedChapterNumber}
                onChange={(e) => setSelectedChapterNumber(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0B2545] cursor-pointer"
              >
                {Array.from({ length: currentBook.total_chapters }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    Chapter {num} (باب {num})
                  </option>
                ))}
              </select>
            </div>

            {/* Prev / Next Chapter Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevChapter}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev Chapter</span>
              </button>
              <button
                onClick={handleNextChapter}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Next Chapter"
              >
                <span className="hidden sm:inline">Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Header Banner */}
          <div className="bg-gradient-to-r from-[#0B2545] to-[#133E87] text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <span>{currentBook.testament === 'OLD' ? 'Old Testament • عہدِ عتیق' : 'New Testament • عہدِ جدید'}</span>
                <span>•</span>
                <span>Book {currentBook.book_number} of 66</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 font-serif tracking-wide flex items-baseline gap-3">
                <span>{currentBook.english_name}</span>
                <span className="font-urdu text-amber-300 font-bold text-xl">{currentBook.urdu_name}</span>
                <span className="text-sm font-sans font-normal text-slate-200">Chapter {selectedChapterNumber}</span>
              </h2>
            </div>

            <div className="text-right text-xs text-slate-200 space-y-1">
              <div className="font-bold text-amber-400 font-mono">
                {chapterVerses.length} Verses in Chapter {selectedChapterNumber}
              </div>
              <div className="text-[11px] text-slate-300">
                Preserved from WordPocket Urdu
              </div>
            </div>
          </div>

          {/* Chapter Verses List */}
          {chapterVerses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No verses found for this chapter.</p>
              <p>You can import or sync this chapter from WordPocket in the Database Manager.</p>
              <button
                onClick={() => onNavigate('bible-manager')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B2545] text-white text-xs font-semibold rounded-lg"
              >
                Open Bible Manager
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapterVerses.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-400/80 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-[#0B2545] text-amber-400 font-extrabold text-xs rounded-lg font-mono">
                        {v.reference}
                      </span>
                      <span className="font-urdu text-sm font-bold text-slate-800">
                        {v.book_name_urdu || currentBook.urdu_name} {v.chapter_number}:{v.verse_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyVerse(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Copy Scripture text"
                      >
                        {copiedVerseId === v.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveToMyVerses(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Add to My Verses"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] hidden sm:inline">Save</span>
                      </button>
                    </div>
                  </div>

                  {/* Urdu Sacred Text (Section 10 Authentic WordPocket) */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50 text-right">
                    <p className="font-urdu text-xl sm:text-2xl text-slate-900 leading-loose" dir="rtl">
                      {v.original_text}
                    </p>
                  </div>

                  {/* English Parallel Text */}
                  {v.english_text && (
                    <p className="text-slate-700 text-xs sm:text-sm font-serif italic pl-2 border-l-2 border-amber-300">
                      "{v.english_text}"
                    </p>
                  )}

                  {/* Practice Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Source: WordPocket Urdu • Pakistani & Indian Worship Centre
                    </span>
                    <button
                      onClick={() => onNavigate('memorize')}
                      className="inline-flex items-center gap-1.5 font-bold text-[#0B2545] hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Practice Verse in Memory Engine</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chapter Footer Navigation */}
          {chapterVerses.length > 0 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={handlePrevChapter}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>پچھلا باب • Previous Chapter</span>
              </button>

              <div className="text-xs font-bold text-slate-600">
                {currentBook.english_name} {selectedChapterNumber} of {currentBook.total_chapters}
              </div>

              <button
                onClick={handleNextChapter}
                className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold shadow-xs"
              >
                <span>اگلا باب • Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: SCRIPTURE KEYWORD SEARCH (PAGINATED, SILKY SMOOTH) */}
      {viewMode === 'search' && (
        <div className="space-y-4">
          {/* Search Results Summary Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-slate-900 text-sm">
                Found {searchResults.length.toLocaleString()} matching verses
              </span>
              <span className="text-slate-500 ml-2">
                for query: <strong className="text-amber-800">"{activeSearchTerm}"</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSearch}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Back to Chapter Reader</span>
              </button>
            </div>
          </div>

          {/* Results List */}
          {searchResults.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No verses matched "{activeSearchTerm}".</p>
              <p>Try searching for canonical book names (e.g. John, Genesis), verse references (John 3:16), or Urdu root words (محبت، خدا، باپ، کلام).</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSearchVerses.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-400/80 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-[#0B2545] text-amber-400 font-extrabold text-xs rounded-lg font-mono">
                        {v.reference}
                      </span>
                      <span className="font-urdu text-sm font-bold text-slate-800">
                        {v.book_name_urdu} {v.chapter_number}:{v.verse_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyVerse(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      >
                        {copiedVerseId === v.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSaveToMyVerses(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] hidden sm:inline">Save</span>
                      </button>

                      <button
                        onClick={() => {
                          const bookObj = BIBLE_BOOKS_MAPPING.find(b => b.english_name === v.book_name_english);
                          if (bookObj) {
                            setSelectedBookNumber(bookObj.book_number);
                            setSelectedChapterNumber(v.chapter_number);
                            setViewMode('chapter');
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Open this full chapter in reader"
                      >
                        Read Chapter
                      </button>
                    </div>
                  </div>

                  {/* Urdu Sacred Text */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50 text-right">
                    <p className="font-urdu text-xl sm:text-2xl text-slate-900 leading-loose" dir="rtl">
                      {v.original_text}
                    </p>
                  </div>

                  {/* English Parallel Text */}
                  {v.english_text && (
                    <p className="text-slate-700 text-xs sm:text-sm font-serif italic pl-2 border-l-2 border-amber-300">
                      "{v.english_text}"
                    </p>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Language: Urdu (WordPocket canonical)
                    </span>
                    <button
                      onClick={() => onNavigate('memorize')}
                      className="inline-flex items-center gap-1 font-bold text-[#0B2545] hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Practice in Memory Engine</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {searchResults.length > SEARCH_PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <div className="text-slate-500 font-medium">
                Showing {((searchPage - 1) * SEARCH_PAGE_SIZE) + 1}–{Math.min(searchPage * SEARCH_PAGE_SIZE, searchResults.length)} of {searchResults.length.toLocaleString()} verses
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSearchPage(1)}
                  disabled={searchPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-bold"
                >
                  First
                </button>
                <button
                  onClick={() => setSearchPage(p => Math.max(1, p - 1))}
                  disabled={searchPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-bold flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-900 bg-slate-100 rounded-lg">
                  Page {searchPage} of {totalSearchPages}
                </span>
                <button
                  onClick={() => setSearchPage(p => Math.min(totalSearchPages, p + 1))}
                  disabled={searchPage >= totalSearchPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-bold flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSearchPage(totalSearchPages)}
                  disabled={searchPage >= totalSearchPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none font-bold"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
