import React, { useState, useEffect } from 'react';
import { Course, Comment } from '../types';

const COMMENTS_STORAGE_KEY = 'learntube_comments';
const VOTES_STORAGE_KEY = 'learntube_video_votes';
const MY_VOTES_KEY = 'learntube_my_votes';

interface VideoVotes {
  likes: number;
  dislikes: number;
}

function getVideoVotes(courseId: string): VideoVotes {
  try {
    const raw = localStorage.getItem(VOTES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const v = all[courseId];
    return v && typeof v.likes === 'number' && typeof v.dislikes === 'number'
      ? { likes: v.likes, dislikes: v.dislikes }
      : { likes: 0, dislikes: 0 };
  } catch {
    return { likes: 0, dislikes: 0 };
  }
}

function saveVideoVotes(courseId: string, votes: VideoVotes) {
  try {
    const raw = localStorage.getItem(VOTES_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[courseId] = votes;
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function getMyVote(courseId: string): 'like' | 'dislike' | null {
  try {
    const raw = localStorage.getItem(MY_VOTES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const v = all[courseId];
    return v === 'like' || v === 'dislike' ? v : null;
  } catch {
    return null;
  }
}

function saveMyVote(courseId: string, vote: 'like' | 'dislike' | null) {
  try {
    const raw = localStorage.getItem(MY_VOTES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (vote) all[courseId] = vote; else delete all[courseId];
    localStorage.setItem(MY_VOTES_KEY, JSON.stringify(all));
  } catch {}
}

function getCommentsForCourse(courseId: string): Comment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return Array.isArray(all[courseId]) ? all[courseId] : [];
  } catch {
    return [];
  }
}

function saveCommentsForCourse(courseId: string, comments: Comment[]) {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[courseId] = comments;
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

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
  const [comments, setComments] = useState<Comment[]>(() => getCommentsForCourse(course.id));
  const [newAuthor, setNewAuthor] = useState('');
  const [newText, setNewText] = useState('');
  const [votes, setVotes] = useState<VideoVotes>(() => getVideoVotes(course.id));
  const [myVote, setMyVote] = useState<'like' | 'dislike' | null>(() => getMyVote(course.id));

  useEffect(() => {
    setComments(getCommentsForCourse(course.id));
    setNewAuthor('');
    setNewText('');
    setVotes(getVideoVotes(course.id));
    setMyVote(getMyVote(course.id));
  }, [course.id]);

  const handleLike = () => {
    const next = { ...votes };
    if (myVote === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
    if (myVote !== 'like') next.likes += 1; else next.likes = Math.max(0, next.likes - 1);
    const newMyVote = myVote === 'like' ? null : 'like';
    setVotes(next);
    setMyVote(newMyVote);
    saveVideoVotes(course.id, next);
    saveMyVote(course.id, newMyVote);
  };

  const handleDislike = () => {
    const next = { ...votes };
    if (myVote === 'like') next.likes = Math.max(0, next.likes - 1);
    if (myVote !== 'dislike') next.dislikes += 1; else next.dislikes = Math.max(0, next.dislikes - 1);
    const newMyVote = myVote === 'dislike' ? null : 'dislike';
    setVotes(next);
    setMyVote(newMyVote);
    saveVideoVotes(course.id, next);
    saveMyVote(course.id, newMyVote);
  };

  const totalVotes = votes.likes + votes.dislikes;
  const effectiveRating = totalVotes > 0
    ? (votes.likes / totalVotes) * 5
    : course.rating;

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: newAuthor.trim() || 'GUEST',
      text,
      date: new Date().toISOString(),
    };
    const next = [comment, ...comments];
    setComments(next);
    saveCommentsForCourse(course.id, next);
    setNewText('');
  };

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
      {/* Theater: video centered full-width; normal: constrained layout */}
      {immersive ? (
        <div className="fixed inset-0 flex flex-col bg-black">
          <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-black/80 z-10 shrink-0">
            <button onClick={onBack} className="mono text-[10px] text-[#94a3b8] hover:text-[#22d3ee] flex items-center gap-2 transition-colors">
              <span>←</span> [ RETURN ]
            </button>
            <div className="flex gap-2">
              <button onClick={onToggleBookmark} className={`mono text-[10px] px-3 py-1.5 border rounded-md transition-colors ${isBookmarked ? 'bg-[#10b981] text-white border-[#10b981]' : 'border-white/20 text-[#94a3b8] hover:border-[#10b981] hover:text-[#10b981]'}`}>
                {isBookmarked ? '[ SYNCED ]' : '[ SYNC ]'}
              </button>
              {isOwner && (
                <button onClick={() => onEdit(course)} className="mono text-[10px] px-3 py-1.5 border border-white/20 text-[#94a3b8] hover:text-[#a78bfa] hover:border-[#a78bfa] rounded-md transition-colors">
                  [ EDIT ]
                </button>
              )}
              <button onClick={() => setImmersive(false)} className="mono text-[10px] px-3 py-1.5 border rounded-md bg-[#a78bfa] text-white border-[#a78bfa]">
                [ EXIT ]
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 h-[calc(100vh-52px)] w-full">
            <div className="max-w-full max-h-full aspect-video w-full max-w-[1920px] bg-black">
              {embedUrl ? (
                <iframe key={key} width="100%" height="100%" src={embedUrl} title={course.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center mono text-[#64748b] text-[10px]">INVALID_VIDEO_SIGNAL</div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-6 py-10">
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
              onClick={() => setImmersive(true)}
              className="mono text-[10px] px-3 py-1.5 border border-[#334155] text-[#94a3b8] hover:border-[#a78bfa] hover:text-[#a78bfa] rounded-md transition-colors"
            >
              [ THEATER ]
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
                <div className="flex items-center gap-4 shrink-0">
                  <div className="mono text-[10px] uppercase tracking-wider">
                    <span className="text-[#94a3b8]">RATING </span>
                    <span className="text-[#f59e0b] font-semibold">{effectiveRating.toFixed(1)}</span>
                    <span className="text-[#94a3b8]">/5.0</span>
                  </div>
                  <div className="flex items-center gap-1 border border-[#334155] rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={handleLike}
                      className={`mono text-[10px] px-2 py-1.5 flex items-center gap-1 transition-colors ${myVote === 'like' ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-[#16161b] text-[#94a3b8] hover:text-[#10b981] border-r border-[#334155]'}`}
                    >
                      [ LIKE ] <span className="text-[8px] opacity-80">{votes.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDislike}
                      className={`mono text-[10px] px-2 py-1.5 flex items-center gap-1 transition-colors ${myVote === 'dislike' ? 'bg-[#fb7185] text-white border-[#fb7185]' : 'bg-[#16161b] text-[#94a3b8] hover:text-[#fb7185]'}`}
                    >
                      [ DISLIKE ] <span className="text-[8px] opacity-80">{votes.dislikes}</span>
                    </button>
                  </div>
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

              <section className="border-t border-[#334155] pt-8">
                <h2 className="mono text-[10px] text-[#22d3ee] tracking-widest uppercase mb-4">--comments</h2>
                <form onSubmit={addComment} className="space-y-3 mb-6">
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder=" NAME (optional)"
                    className="w-full bg-[#16161b] border border-[#334155] px-3 py-2 text-[10px] mono text-[#e2e8f0] focus:border-[#22d3ee] outline-none rounded-md placeholder:text-[#64748b]"
                  />
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder=" COMMENT..."
                    rows={2}
                    required
                    className="w-full bg-[#16161b] border border-[#334155] px-3 py-2 text-[10px] mono text-[#e2e8f0] focus:border-[#22d3ee] outline-none resize-none rounded-md placeholder:text-[#64748b]"
                  />
                  <button type="submit" className="mono text-[10px] px-4 py-2 border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-black transition-colors rounded-md">
                    [ POST ]
                  </button>
                </form>
                <ul className="space-y-4">
                  {comments.length === 0 && (
                    <li className="mono text-[9px] text-[#64748b]">NO_COMMENTS_YET</li>
                  )}
                  {comments.map((c) => (
                    <li key={c.id} className="border-l-2 border-[#334155] pl-3 py-1">
                      <div className="mono text-[9px] text-[#94a3b8] uppercase">
                        <span className="text-[#22d3ee]">{c.author}</span>
                        <span className="text-[#64748b] ml-2">
                          {new Date(c.date).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[10px] mono text-[#cbd5e1] mt-0.5 whitespace-pre-wrap">{c.text}</p>
                    </li>
                  ))}
                </ul>
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
      )}
    </div>
  );
};

export default CourseDetail;
