
import React, { useState } from 'react';
import { Course } from '../types';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEdit: (course: Course) => void;
  isOwner: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEdit, isOwner, isBookmarked, onToggleBookmark }) => {
  const [immersive, setImmersive] = useState(false);
  const [key, setKey] = useState(0);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) return url;
    let videoId = '';
    try {
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('/shorts/')) videoId = url.split('/shorts/')[1].split('/')[0];
      if (!videoId || videoId.length !== 11) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2] && match[2].length === 11) videoId = match[2];
      }
    } catch (e) {}
    if (videoId && videoId.length === 11) return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    return "";
  };

  const embedUrl = getEmbedUrl(course.videoUrl);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${immersive ? 'bg-black' : 'bg-[#030303]'}`}>
      <div className={`max-w-7xl mx-auto px-6 py-12 transition-opacity duration-700 ${immersive ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex justify-between items-center mb-12">
          <button onClick={onBack} className="mono text-[10px] tracking-[0.3em] text-white/40 hover:text-white flex items-center gap-4 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> [ RETURN_TO_SYSTEM ]
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onToggleBookmark}
              className={`mono text-[10px] px-4 py-2 border rounded-full transition-all ${isBookmarked ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}
            >
              {isBookmarked ? '[ SYNCED_TO_ARCHIVE ]' : '[ SYNC_TO_ARCHIVE ]'}
            </button>
            {isOwner && (
              <button 
                onClick={() => onEdit(course)}
                className="mono text-[10px] px-4 py-2 border border-white/10 text-white/40 hover:text-white hover:border-white/30 rounded-full transition-all"
              >
                [ EDIT_NODE ]
              </button>
            )}
            <button 
              onClick={() => setImmersive(!immersive)}
              className={`mono text-[10px] px-4 py-2 border rounded-full transition-all ${immersive ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:border-white/30'}`}
            >
              {immersive ? 'EXIT_IMMERSIVE' : 'ENTER_THEATER_MODE'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/5 blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                {embedUrl ? (
                  <iframe 
                    key={key}
                    width="100%" height="100%" 
                    src={embedUrl}
                    title={course.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center mono text-white/20">
                    <span className="text-4xl mb-4">⚠️</span>
                    <span className="text-[10px] tracking-widest uppercase">INVALID_VIDEO_SIGNAL</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 px-1">
              <button onClick={() => setKey(k => k+1)} className="mono text-[9px] text-white/20 hover:text-white/60 uppercase tracking-[0.2em]">[ RELOAD_SIGNAL ]</button>
              <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest border-b border-white/10">[ OPEN_DIRECTLY ]</a>
            </div>

            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none max-w-2xl">{course.title}</h1>
                <div className="text-right mono shrink-0">
                  <div className="text-white/20 text-[10px] mb-1 uppercase tracking-widest">DATA_PRECISION</div>
                  <div className="text-2xl font-light">{course.rating}<span className="text-white/20">/5.0</span></div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {course.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] mono text-white/60">#{s.toUpperCase()}</span>
                ))}
              </div>

              <section className="border-t border-white/10 pt-10">
                <h2 className="mono text-[10px] text-white/30 tracking-[0.2em] uppercase mb-6">POST_CONTENT</h2>
                <div className="prose prose-invert max-w-3xl">
                  <p className="text-lg text-white/70 font-light leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>
              </section>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-6">
              <h3 className="mono text-[10px] text-white/20 tracking-[0.2em] uppercase">ENTITY_SOURCE</h3>
              <div className="p-8 border border-white/10 rounded-[2rem] bg-white/[0.02] flex flex-col items-center text-center gap-6 group hover:border-white/20 transition-all">
                <div className="w-20 h-20 rounded-full bg-white/5 overflow-hidden flex items-center justify-center font-black text-3xl border border-white/10">
                  {course.channelThumbnailUrl ? (
                    <img src={course.channelThumbnailUrl} alt={course.channelName} className="w-full h-full object-cover" />
                  ) : ( <span className="text-white/20">{course.channelName[0]}</span> )}
                </div>
                <div>
                  <div className="font-bold text-xl">{course.channelName}</div>
                  <div className="mono text-[10px] text-white/30 mt-1 uppercase tracking-widest">VERIFIED_PROVIDER</div>
                </div>
                <div className="w-full pt-4">
                  <a href={course.channelUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-5 bg-white text-black font-black text-xs tracking-[0.3em] rounded-2xl hover:bg-white/80 transition-all">SYNC_CHANNEL</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
