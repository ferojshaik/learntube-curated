
import React, { useState, useEffect, useMemo } from 'react';
import { Course, Category } from './types';
import { INITIAL_COURSES, INITIAL_CATEGORIES, OWNER_PASSWORD_HASH } from './constants';
import Navbar from './components/Navbar';
import CourseCard from './components/CourseCard';
import CourseDetail from './components/CourseDetail';
import AdminModal from './components/AdminModal';
import DomainsModal from './components/DomainsModal';

const CATEGORIES_STORAGE_KEY = 'learntube_categories';

const OWNER_AUTH_KEY = 'learntube_owner_auth';

async function hashPassword(password: string): Promise<string> {
  const normalized = password.trim().normalize('NFC');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyOwnerPassword(input: string): Promise<{ ok: boolean; debug?: string }> {
  const trimmed = input.trim();
  let envPassword = import.meta.env.VITE_OWNER_PASSWORD as string | undefined;
  if (typeof envPassword === 'string') {
    envPassword = envPassword.replace(/^['"]|['"]$/g, '').trim();
    envPassword = envPassword.replace(/\\\$/g, '$').replace(/\\@/g, '@');
  }
  const envSet = !!envPassword;
  const envLen = envPassword?.length ?? 0;
  const inputLen = trimmed.length;
  const envMatch = envPassword && trimmed === envPassword;
  if (envMatch) return { ok: true };
  const hash = await hashPassword(input);
  const hashMatch = hash === OWNER_PASSWORD_HASH;
  if (hashMatch) return { ok: true };
  const debug = [
    `env set: ${envSet}`,
    `env len: ${envLen}`,
    `input len: ${inputLen}`,
    `env match: ${envMatch}`,
    `hash match: ${hashMatch}`,
    envPassword ? `env first 3: "${envPassword.slice(0, 3)}" last 3: "${envPassword.slice(-3)}"` : 'no env',
    trimmed ? `input first 3: "${trimmed.slice(0, 3)}" last 3: "${trimmed.slice(-3)}"` : 'empty input',
  ].join(' | ');
  return { ok: false, debug };
}

function isOwnerAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(OWNER_AUTH_KEY) === '1';
  } catch {
    return false;
  }
}

function setOwnerAuthenticated(value: boolean) {
  try {
    if (value) sessionStorage.setItem(OWNER_AUTH_KEY, '1');
    else sessionStorage.removeItem(OWNER_AUTH_KEY);
  } catch {}
}

type SortOption = 'title' | 'date' | 'rating';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('learntube_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('learntube_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDomainsModalOpen, setIsDomainsModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(() => window.location.hash === '#/owner' && isOwnerAuthenticated());
  const [showOwnerLogin, setShowOwnerLogin] = useState(() => window.location.hash === '#/owner' && !isOwnerAuthenticated());
  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [ownerLoginError, setOwnerLoginError] = useState('');
  const [ownerLoginDebug, setOwnerLoginDebug] = useState('');
  const [ownerLoginLoading, setOwnerLoginLoading] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const onOwnerRoute = window.location.hash === '#/owner';
      if (onOwnerRoute && isOwnerAuthenticated()) {
        setIsOwner(true);
        setShowOwnerLogin(false);
      } else if (onOwnerRoute) {
        setShowOwnerLogin(true);
        setIsOwner(false);
      } else {
        setIsOwner(false);
        setShowOwnerLogin(false);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerLoginError('');
    setOwnerLoginDebug('');
    setOwnerLoginLoading(true);
    try {
      const result = await verifyOwnerPassword(ownerPasswordInput);
      if (result.ok) {
        setOwnerAuthenticated(true);
        setIsOwner(true);
        setShowOwnerLogin(false);
        setOwnerPasswordInput('');
      } else {
        setOwnerLoginError('Invalid access code.');
        if (result.debug) setOwnerLoginDebug(result.debug);
      }
    } finally {
      setOwnerLoginLoading(false);
    }
  };

  const handleOwnerLogout = () => {
    setOwnerAuthenticated(false);
    setIsOwner(false);
    window.location.hash = '';
  };

  useEffect(() => {
    localStorage.setItem('learntube_courses', JSON.stringify(courses));
    localStorage.setItem('learntube_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    
    if (selectedCourse) {
      const current = courses.find(c => c.id === selectedCourse.id);
      if (!current) setSelectedCourse(null);
      else if (JSON.stringify(current) !== JSON.stringify(selectedCourse)) setSelectedCourse(current);
    }
  }, [courses, bookmarks, categories, selectedCourse]);

  const processedCourses = useMemo(() => {
    let result = courses.filter(course => {
      const matchesCategory = selectedCategory ? course.category === selectedCategory : true;
      const matchesArchived = showArchived ? bookmarks.includes(course.id) : true;
      const queryTokens = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      const matchesSearch = queryTokens.length === 0 || queryTokens.every(token => 
        course.title.toLowerCase().includes(token) || 
        course.channelName.toLowerCase().includes(token) ||
        course.description.toLowerCase().includes(token) ||
        course.skills.some(skill => skill.toLowerCase().includes(token))
      );
      return matchesCategory && matchesSearch && matchesArchived;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  }, [courses, selectedCategory, showArchived, bookmarks, searchQuery, sortBy]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handleAddOrUpdateCourse = (course: Course) => {
    const categoryName = course.category?.trim();
    if (categoryName && !categories.some(c => c.name === categoryName)) {
      setCategories(prev => [...prev, { id: Date.now().toString(), name: categoryName, icon: '📁' }]);
    }
    setCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      return exists ? prev.map(c => c.id === course.id ? course : c) : [course, ...prev];
    });
  };

  const courseCountByCategory = (name: string) => courses.filter(c => c.category === name).length;

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setBookmarks(prev => prev.filter(b => b !== id));
  };

  const handleEditClick = (course: Course) => {
    if (!isOwner) return;
    setCourseToEdit(course);
    setIsAdminOpen(true);
  };

  if (selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
        onEdit={handleEditClick}
        isOwner={isOwner}
        isBookmarked={bookmarks.includes(selectedCourse.id)}
        onToggleBookmark={() => toggleBookmark(selectedCourse.id)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {showOwnerLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden p-8">
            <div className="space-y-2 mb-6">
              <div className="w-2 h-2 bg-white"></div>
              <h2 className="mono text-[10px] font-bold tracking-[0.3em] uppercase">OWNER_ACCESS</h2>
            </div>
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest mb-2">ACCESS_CODE</label>
                <input
                  type="password"
                  value={ownerPasswordInput}
                  onChange={(e) => { setOwnerPasswordInput(e.target.value); setOwnerLoginError(''); }}
                  placeholder="Enter password"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm mono focus:border-white/50 outline-none transition-all rounded-xl placeholder:text-white/20"
                />
              </div>
              {ownerLoginError && (
                <p className="mono text-[9px] text-red-500 uppercase tracking-wider">{ownerLoginError}</p>
              )}
              {ownerLoginDebug && (
                <p className="mono text-[8px] text-white/40 break-all border border-white/10 rounded p-2 bg-black/30">
                  DEBUG: {ownerLoginDebug}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={ownerLoginLoading}
                  onClick={() => { window.location.hash = ''; setShowOwnerLogin(false); }}
                  className="flex-1 mono text-[10px] py-3 border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest rounded-xl disabled:opacity-50"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={ownerLoginLoading}
                  className="flex-1 mono text-[10px] py-3 bg-white text-black font-black hover:bg-white/90 transition-all uppercase tracking-widest rounded-xl disabled:opacity-50"
                >
                  {ownerLoginLoading ? '[ VERIFYING... ]' : '[ UNLOCK ]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navbar searchValue={searchInput} onSearchChange={setSearchInput} onAdminToggle={() => { setCourseToEdit(null); setIsAdminOpen(true); }} isOwner={isOwner} onOwnerLogout={handleOwnerLogout} />

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 flex-grow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-white"></div>
              <span className="mono text-[10px] text-white font-bold tracking-[0.4em]">SYSTEM_ARCHIVE_v1.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] max-w-4xl uppercase">
              Curated <span className="text-white/20 italic">Mastery</span> Nodes.
            </h1>
            <p className="mono text-[11px] text-white/30 uppercase tracking-[0.2em] max-w-xl">
              A high-precision vault for digital knowledge. Hand-selected education for builders, hackers, and creators.
            </p>
          </div>

          <div className="w-full md:w-80 p-8 glass-panel border border-white/10 rounded-[2rem] space-y-6">
            <div className="space-y-2">
              <div className="w-2 h-2 bg-white animate-pulse"></div>
              <h3 className="mono text-[10px] font-bold tracking-widest uppercase">System_Overview</h3>
            </div>
            <p className="mono text-[9px] text-white/40 leading-relaxed uppercase">
              Current index contains {courses.length} verified learning paths across {categories.length} specialized domains.
            </p>
            <div className="h-px w-full bg-white/10"></div>
            <div className="flex justify-between items-center mono text-[8px] text-white/20 uppercase tracking-widest">
              <span>Status</span>
              <span className="text-white">Active</span>
            </div>
          </div>
        </div>

        <div className="mb-16 space-y-8 border-b border-white/5 pb-8">
          <div className="flex flex-wrap gap-x-12 gap-y-6 items-center">
            <div className="mono text-[10px] text-white/20 tracking-widest">DOMAIN_FILTER:</div>
            <button 
              onClick={() => { setSelectedCategory(null); setShowArchived(false); }}
              className={`mono text-[11px] tracking-widest transition-all ${!selectedCategory && !showArchived ? 'text-white border-b border-white' : 'text-white/40 hover:text-white'}`}
            >
              [ GLOBAL ]
            </button>
            <button 
              onClick={() => { setSelectedCategory(null); setShowArchived(true); }}
              className={`mono text-[11px] tracking-widest transition-all ${showArchived ? 'text-white border-b border-white' : 'text-white/40 hover:text-white'}`}
            >
              [ PERSONAL_ARCHIVE ]
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); setShowArchived(false); }}
                className={`mono text-[11px] tracking-widest transition-all ${selectedCategory === cat.name ? 'text-white border-b border-white' : 'text-white/40 hover:text-white'}`}
              >
                [ {cat.name.toUpperCase()} ]
              </button>
            ))}
            {isOwner && (
              <button
                onClick={() => setIsDomainsModalOpen(true)}
                className="mono text-[11px] tracking-widest text-white/30 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1 rounded transition-all"
              >
                [ EDIT_DOMAINS ]
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
            <div className="mono text-[10px] text-white/20 tracking-widest uppercase">Sort_Parameters:</div>
            <div className="flex gap-4">
              {(['date', 'rating', 'title'] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`mono text-[10px] px-3 py-1 rounded border transition-all ${
                    sortBy === option 
                      ? 'border-white text-white bg-white/5' 
                      : 'border-white/5 text-white/30 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {option === 'date' ? 'NEWEST_FIRST' : option.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="ml-auto hidden md:block">
              <span className="mono text-[10px] text-white/10 uppercase tracking-tighter">
                TOTAL_RECORDS // {processedCourses.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-px bg-white/5 border border-white/5 p-px">
          {processedCourses.map(course => (
            <div key={course.id} className="bg-[#030303] p-1 flex-[1_1_260px] min-w-[260px] max-w-full">
               <CourseCard 
                course={course} 
                onClick={setSelectedCourse} 
                onEdit={handleEditClick} 
                isOwner={isOwner} 
                isBookmarked={bookmarks.includes(course.id)}
                onToggleBookmark={() => toggleBookmark(course.id)}
              />
            </div>
          ))}
        </div>

        {processedCourses.length === 0 && (
          <div className="py-40 text-center border border-white/5 bg-white/[0.01]">
            <span className="mono text-[10px] text-white/20">NO_MATCHING_DATA_FOUND</span>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-8 z-50">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
          <span className="mono text-[9px] text-white/40 uppercase tracking-widest">NETWORK_STABLE</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10"></div>
        <div className="mono text-[9px] text-white/40 uppercase tracking-widest">
          {bookmarks.length} STORED_NODES
        </div>
        {isOwner && (
          <>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              onClick={() => { setCourseToEdit(null); setIsAdminOpen(true); }}
              className="mono text-[9px] text-white font-bold hover:tracking-[0.2em] transition-all"
            >
              [ + ADD_NEW_NODE ]
            </button>
          </>
        )}
      </div>

      {isAdminOpen && isOwner && (
        <AdminModal 
          onClose={() => { setIsAdminOpen(false); setCourseToEdit(null); }} 
          onAdd={handleAddOrUpdateCourse}
          onDelete={handleDeleteCourse}
          categories={categories.map(c => c.name)}
          editCourse={courseToEdit}
        />
      )}

      {isDomainsModalOpen && isOwner && (
        <DomainsModal
          categories={categories}
          onSave={(newCategories) => {
            const renames = new Map<string, string>();
            newCategories.forEach(nc => {
              const old = categories.find(c => c.id === nc.id);
              if (old && old.name !== nc.name) renames.set(old.name, nc.name);
            });
            if (renames.size > 0) {
              setCourses(prev => prev.map(c => {
                const newName = renames.get(c.category);
                return newName ? { ...c, category: newName } : c;
              }));
            }
            setCategories(newCategories);
          }}
          onClose={() => setIsDomainsModalOpen(false)}
          courseCountByCategory={courseCountByCategory}
        />
      )}
    </div>
  );
};

export default App;
