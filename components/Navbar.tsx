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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel px-4 py-2.5 flex items-center justify-between border-b border-[#22d3ee30] rounded-none">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => window.location.hash = ''} className="mono text-[11px] font-bold tracking-tight flex items-center gap-2 group">
          <span className="text-[#94a3b8] group-hover:text-[#22d3ee] transition-colors">user@knowledge-base:~</span>
          <span className="text-[#22d3ee]">$</span>
        </button>
      </div>

      <div className="flex-grow max-w-md mx-6 relative min-w-0 flex items-center">
        <span className="mono text-[#38bdf8] text-xs absolute left-3 pointer-events-none">$</span>
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder=" grep ..."
          className="w-full bg-[#16161b]/80 border border-[#22d3ee30] py-2 pl-7 pr-3 text-xs mono text-[#e2e8f0] focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee40] outline-none transition-all placeholder:text-[#64748b] rounded-md"
          aria-label="Search courses"
        />
      </div>

      <div className="flex items-center gap-3">
        {isOwner && (
          <>
            <button 
              onClick={onAdminToggle}
              className="hidden sm:block mono text-[10px] tracking-widest text-[#10b981] hover:text-[#34d399] transition-colors"
            >
              [ ADD_CONTENT ]
            </button>
            {onOwnerLogout && (
              <button 
                onClick={onOwnerLogout}
                className="hidden sm:block mono text-[10px] tracking-widest text-[#94a3b8] hover:text-[#fb7185] transition-colors"
              >
                [ EXIT_OWNER ]
              </button>
            )}
          </>
        )}
        <span className="mono text-[9px] text-[#64748b] hidden sm:inline">tty1</span>
      </div>
    </nav>
  );
};

export default Navbar;
