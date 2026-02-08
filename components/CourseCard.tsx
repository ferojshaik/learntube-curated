
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  onEdit: (course: Course) => void;
  isOwner: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onEdit, isOwner, isBookmarked, onToggleBookmark }) => {
  return (
    <div 
      className="group relative h-[450px] bg-[#030303] cursor-pointer overflow-hidden transition-all duration-700 border border-white/5"
    >
      <div 
        onClick={() => onClick(course)}
        className="absolute inset-0 transition-all duration-1000"
      >
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 scale-100 group-hover:scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40"></div>
      </div>

      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
        <div className="mono text-[8px] text-white/40 tracking-[0.4em] uppercase pointer-events-none">REF_{course.id.slice(-4)}</div>
        <div className="flex gap-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={`backdrop-blur-md px-2 py-0.5 rounded-full border transition-all ${isBookmarked ? 'bg-white text-black border-white' : 'bg-white/10 text-white/80 border-white/10 hover:border-white/40'}`}
          >
            <svg className="w-3 h-3" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[8px] mono text-white/80 border border-white/10 pointer-events-none">
            {course.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="absolute top-14 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(course); }}
            className="bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-xl border border-white/20 p-2 rounded-full transition-all"
            title="Edit Node"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      )}

      <div 
        onClick={() => onClick(course)}
        className="absolute bottom-8 left-8 right-8 space-y-4 z-10 transition-all duration-500"
      >
        <div className="h-[1px] w-full bg-white/20 group-hover:bg-white transition-all duration-700"></div>
        <h3 className="text-xl font-bold leading-tight text-white transition-colors">
          {course.title.toUpperCase()}
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-[10px] mono text-white/50 uppercase tracking-widest line-clamp-1">
            VIA // {course.channelName}
          </p>
          <div className="flex items-center gap-1">
            <span className="mono text-[10px] text-white/60">
              ★ {course.rating}
            </span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 opacity-100 transition-all pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10 opacity-100 transition-all pointer-events-none"></div>
    </div>
  );
};

export default CourseCard;
