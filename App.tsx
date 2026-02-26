
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
        setOwnerLoginError('INVALID_ACCESS_CODE');
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
    <div className="min-h-screen bg-[#0f0f12]">
      {showOwnerLogin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0f0f12]/98">
          <div className="bg-[#16161b] border border-[#22d3ee50] w-full max-w-md rounded-xl overflow-hidden p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
            <div className="space-y-2 mb-6">
              <span className="mono text-[10px] text-[#38bdf8]">$ sudo access</span>
              <h2 className="mono text-[11px] font-bold tracking-widest uppercase text-gradient">OWNER_ACCESS</h2>
            </div>
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="mono text-[9px] text-[#94a3b8] block uppercase tracking-widest mb-2">PASSWORD:</label>
                <input
                  type="password"
                  value={ownerPasswordInput}
                  onChange={(e) => { setOwnerPasswordInput(e.target.value); setOwnerLoginError(''); }}
                  placeholder=""
                  autoFocus
                  className="w-full bg-[#0f0f12] border border-[#334155] p-3 text-sm mono text-[#e2e8f0] focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee40] outline-none rounded-md placeholder:text-[#64748b]"
                />
              </div>
              {ownerLoginError && (
                <p className="mono text-[9px] text-[#fb7185]">{ownerLoginError}</p>
              )}
              {ownerLoginDebug && (
                <p className="mono text-[8px] text-[#94a3b8] break-all border border-[#334155] rounded-md p-2 bg-[#0f0f12]">
                  DEBUG: {ownerLoginDebug}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={ownerLoginLoading}
                  onClick={() => { window.location.hash = ''; setShowOwnerLogin(false); }}
                  className="flex-1 mono text-[10px] py-2 border border-[#334155] text-[#94a3b8] hover:border-[#64748b] hover:text-[#e2e8f0] transition-colors rounded-md disabled:opacity-50"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={ownerLoginLoading}
                  className="flex-1 mono text-[10px] py-2 bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] text-black font-bold hover:opacity-90 transition-opacity rounded-md disabled:opacity-50"
                >
                  {ownerLoginLoading ? '[ VERIFYING... ]' : '[ UNLOCK ]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navbar searchValue={searchInput} onSearchChange={setSearchInput} onAdminToggle={() => { setCourseToEdit(null); setIsAdminOpen(true); }} isOwner={isOwner} onOwnerLogout={handleOwnerLogout} />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-28 text-[#e2e8f0]">
        <div className="mb-12 space-y-6 border-b border-[#334155] pb-6">
          <div className="flex flex-wrap gap-x-10 gap-y-4 items-center">
            <span className="mono text-[10px] text-[#64748b] tracking-widest">DOMAIN_FILTER:</span>
            <button 
              onClick={() => { setSelectedCategory(null); setShowArchived(false); }}
              className={`mono text-[11px] tracking-widest transition-colors ${!selectedCategory && !showArchived ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-[#94a3b8] hover:text-[#22d3ee]'}`}
            >
              [ GLOBAL ]
            </button>
            <button 
              onClick={() => { setSelectedCategory(null); setShowArchived(true); }}
              className={`mono text-[11px] tracking-widest transition-colors ${showArchived ? 'text-[#a78bfa] border-b-2 border-[#a78bfa]' : 'text-[#94a3b8] hover:text-[#a78bfa]'}`}
            >
              [ PERSONAL_ARCHIVE ]
            </button>
            {categories.map((cat, i) => {
              const colors = ['#f59e0b', '#22d3ee', '#a78bfa', '#10b981', '#fb7185', '#38bdf8'];
              const c = colors[i % colors.length];
              const active = selectedCategory === cat.name;
              return (
                <button 
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); setShowArchived(false); }}
                  className={`mono text-[11px] tracking-widest transition-colors ${active ? 'border-b-2' : ''}`}
                  style={active ? { color: c, borderColor: c } : { color: '#94a3b8' }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = c; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = '#94a3b8'; } }}
                >
                  [ {cat.name.toUpperCase()} ]
                </button>
              );
            })}
            {isOwner && (
              <button
                onClick={() => setIsDomainsModalOpen(true)}
                className="mono text-[11px] tracking-widest text-[#64748b] hover:text-[#f59e0b] border border-[#334155] hover:border-[#f59e0b50] px-2 py-1 rounded-md transition-colors"
              >
                [ EDIT_DOMAINS ]
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
            <span className="mono text-[10px] text-[#64748b] tracking-widest uppercase">SORT:</span>
            <div className="flex gap-2">
              {(['date', 'rating', 'title'] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`mono text-[10px] px-3 py-1.5 rounded-md border transition-colors ${
                    sortBy === option 
                      ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa15]' 
                      : 'border-[#334155] text-[#94a3b8] hover:border-[#a78bfa50] hover:text-[#a78bfa]'
                  }`}
                >
                  {option === 'date' ? 'NEWEST_FIRST' : option.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="ml-auto mono text-[10px] text-[#64748b]">
              TOTAL_RECORDS // <span className="text-[#22d3ee]">{processedCourses.length}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border border-[#334155] p-2 rounded-xl bg-[#16161b]/50">
          {processedCourses.map((course) => (
            <div key={course.id} className="p-1 flex-[1_1_260px] min-w-[260px] max-w-full rounded-lg border border-black transition-colors bg-[#16161b]">
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
          <div className="py-32 text-center border border-[#334155] rounded-xl bg-[#16161b]/50">
            <span className="mono text-[10px] text-[#64748b]">$ echo "</span><span className="text-[#fb7185]">NO_MATCHING_DATA_FOUND</span><span className="text-[#64748b]">"</span>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 glass-panel px-4 py-2.5 flex items-center gap-6 z-50 border-t border-[#334155] rounded-none">
        <span className="mono text-[9px] text-[#64748b]">root@kb:~#</span>
        <span className="mono text-[9px] text-[#94a3b8] uppercase"><span className="text-[#10b981]">{bookmarks.length}</span> BOOKMARKS</span>
        {isOwner && (
          <button 
            onClick={() => { setCourseToEdit(null); setIsAdminOpen(true); }}
            className="mono text-[9px] text-[#22d3ee] font-bold hover:text-[#38bdf8] transition-colors"
          >
            [ + ADD_NEW_NODE ]
          </button>
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
