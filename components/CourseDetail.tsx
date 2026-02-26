
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
    <div className={`min-h-screen transition-all duration-300 ${immersive ? 'bg-black' : 'bg-[#0f0f12] text-[#e2e8f0]'}`}>
      <div className={`max-w-7xl mx-auto px-6 py-10 transition-opacity duration-300 ${immersive ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex justify-between items-center mb-10 border-b border-[#334155] pb-4">
          <button onClick={onBack} className="mono text-[10px] text-[#94a3b8] hover:text-[#22d3ee] flex items-center gap-2 transition-colors">
            <span>←</span> [ RETURN ]
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onToggleBookmark}
              className={`mono text-[10px] px-3 py-1.5 border rounded-md transition-colors ${isBookmarked ? 'bg-[#10b981] text-white border-[#10b981]' : 'border-[#334155] text-[#94a3b8] hover:border-[#10b981] hover:text-[#10b981]'}`}
            >
              {isBookmarked ? '[ SYNCED ]' : '[ SYNC ]'}
            </button>
            {isOwner && (
              <button 
                onClick={() => onEdit(course)}
                className="mono text-[10px] px-3 py-1.5 border border-[#334155] text-[#94a3b8] hover:text-[#a78bfa] hover:border-[#a78bfa] rounded-md transition-colors"
              >
                [ EDIT ]
              </button>
            )}
            <button 
              onClick={() => setImmersive(!immersive)}
              className={`mono text-[10px] px-3 py-1.5 border rounded-md transition-colors ${immersive ? 'bg-[#a78bfa] text-white border-[#a78bfa]' : 'border-[#334155] text-[#94a3b8] hover:border-[#a78bfa] hover:text-[#a78bfa]'}`}
            >
              {immersive ? 'EXIT' : 'THEATER'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-video bg-black overflow-hidden border border-black rounded-xl">
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
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center mono text-[#64748b] text-[10px]">
                  INVALID_VIDEO_SIGNAL
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <button onClick={() => setKey(k => k+1)} className="mono text-[9px] text-[#64748b] hover:text-[#22d3ee] transition-colors">[ RELOAD ]</button>
              <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-[#38bdf8] hover:text-[#22d3ee] border-b border-[#38bdf850] transition-colors">[ OPEN ]</a>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight max-w-2xl mono text-[#e2e8f0]">{course.title}</h1>
                <div className="mono shrink-0 text-[#94a3b8] text-[10px] uppercase tracking-wider">
                  RATING <span className="text-[#f59e0b] font-semibold">{course.rating}</span>/5.0
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {course.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-[#22d3ee10] border border-[#22d3ee30] rounded-md text-[10px] mono text-[#22d3ee]">#{s}</span>
                ))}
              </div>
              <section className="border-t border-[#334155] pt-8">
                <h2 className="mono text-[10px] text-[#a78bfa] tracking-widest uppercase mb-4">--content</h2>
                <p className="text-sm text-[#cbd5e1] mono leading-relaxed whitespace-pre-line">{course.description}</p>
              </section>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="p-6 border border-[#334155] rounded-xl bg-[#16161b]/80 space-y-4">
              <h3 className="mono text-[10px] text-[#10b981] tracking-widest uppercase">--channel</h3>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#0f0f12] border-2 border-[#22d3ee30] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#22d3ee]">
                  {course.channelThumbnailUrl ? (
                    <img src={course.channelThumbnailUrl} alt={course.channelName} className="w-full h-full object-cover" />
                  ) : course.channelName[0]}
                </div>
                <div className="mono text-[#e2e8f0] font-bold">{course.channelName}</div>
                <a href={course.channelUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-full text-center py-2.5 bg-gradient-to-r from-[#22d3ee] to-[#38bdf8] text-black font-bold text-[10px] mono rounded-md hover:opacity-90 transition-opacity uppercase tracking-wider">
                  [ OPEN_CHANNEL ]
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
