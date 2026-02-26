import React from 'react';
import { Course } from '../types';

function getEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) return url;
  let videoId = '';
  try {
    if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('/shorts/')) videoId = url.split('/shorts/')[1].split('/')[0];
    if (!videoId || videoId.length !== 11) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match?.[2]?.length === 11) videoId = match[2];
    }
  } catch {}
  if (videoId?.length === 11) return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  return '';
}

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  onEdit: (course: Course) => void;
  isOwner: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onEdit, isOwner, isBookmarked, onToggleBookmark }) => {
  const embedUrl = getEmbedUrl(course.videoUrl);

  return (
    <div 
      className="group relative h-[260px] bg-[#16161b] cursor-pointer overflow-hidden transition-all duration-300 border border-[#334155] hover:border-[#22d3ee50] hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] rounded-lg"
    >
      <div 
        onClick={() => onClick(course)}
        className="absolute inset-0 flex flex-col"
      >
        <div className="flex-1 min-h-0 w-full relative bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={course.title}
              className="absolute inset-0 w-full h-full pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center mono text-[#64748b] text-[10px] uppercase tracking-widest">
              NO_VIDEO
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#16161b] via-transparent to-transparent pointer-events-none" aria-hidden />
      </div>

      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
        <span className="mono text-[7px] text-[#64748b] tracking-wider pointer-events-none">ref_{course.id.slice(-4)}</span>
        <div className="flex gap-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={`px-2 py-0.5 rounded-md border text-[10px] mono transition-colors ${isBookmarked ? 'bg-[#10b981] text-white border-[#10b981]' : 'border-[#334155] text-[#94a3b8] hover:border-[#10b98150] hover:text-[#10b981]'}`}
          >
            <svg className="w-3 h-3" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <span className="bg-[#a78bfa15] px-2 py-0.5 rounded-md text-[8px] mono text-[#a78bfa] border border-[#a78bfa30] pointer-events-none">
            {course.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {isOwner && (
        <div className="absolute top-9 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(course); }}
            className="bg-[#16161b] hover:bg-[#22d3ee] text-[#94a3b8] hover:text-black border border-[#334155] hover:border-[#22d3ee] p-1.5 rounded-md transition-colors mono text-[9px]"
            title="EDIT_NODE"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      )}

      <div 
        onClick={() => onClick(course)}
        className="absolute bottom-2 left-2 right-2 space-y-0.5 z-10"
      >
        <div className="h-px w-full bg-gradient-to-r from-[#22d3ee30] via-[#a78bfa30] to-transparent"></div>
        <h3 className="text-xs font-bold leading-tight text-[#e2e8f0] mono line-clamp-2 group-hover:text-white transition-colors">
          {course.title}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-[8px] mono text-[#22d3ee] line-clamp-1">
            {course.channelName}
          </p>
          <span className="mono text-[8px] text-[#f59e0b]">★ {course.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
