
import React from 'react';

interface NavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdminToggle: () => void;
  isOwner: boolean;
  onOwnerLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchValue, onSearchChange, onAdminToggle, isOwner, onOwnerLogout }) => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass-panel rounded-full px-6 py-3 flex items-center justify-between border border-white/10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.hash = ''}>
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black text-lg skew-x-[-12deg] group-hover:bg-white/90 transition-colors">
            L
          </div>
          <span className="mono text-sm tracking-tighter font-bold hidden sm:block">KNOWLEDGE_BASE // v2.0.4</span>
        </div>
      </div>

      <div className="flex-grow max-w-md mx-8 relative min-w-0">
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="QUERY_SYSTEM..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs mono focus:border-white/50 outline-none transition-all placeholder:text-white/20"
          aria-label="Search courses"
        />
        <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <div className="flex items-center gap-4">
        {isOwner && (
          <>
            <button 
              onClick={onAdminToggle}
              className="hidden sm:block text-[10px] mono tracking-widest text-white/50 hover:text-white transition-colors"
            >
              [ ADD_CONTENT ]
            </button>
            {onOwnerLogout && (
              <button 
                onClick={onOwnerLogout}
                className="hidden sm:block text-[10px] mono tracking-widest text-white/30 hover:text-white/60 transition-colors"
              >
                [ EXIT_OWNER ]
              </button>
            )}
          </>
        )}
        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-white transition-all">
          <img src="https://picsum.photos/100/100?grayscale" alt="User" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
