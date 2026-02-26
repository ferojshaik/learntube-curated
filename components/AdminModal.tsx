
import React, { useState, useEffect } from 'react';
import { Course, Difficulty } from '../types';

interface AdminModalProps {
  onClose: () => void;
  onAdd: (course: Course) => void;
  onDelete?: (id: string) => void;
  categories: string[];
  editCourse?: Course | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onAdd, onDelete, categories, editCourse }) => {
  const [url, setUrl] = useState(editCourse?.videoUrl || '');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Course>>({
    title: editCourse?.title || '',
    channelName: editCourse?.channelName || '',
    channelUrl: editCourse?.channelUrl || '',
    channelThumbnailUrl: editCourse?.channelThumbnailUrl || '',
    videoUrl: editCourse?.videoUrl || '',
    description: editCourse?.description || '',
    skills: editCourse?.skills || [],
    category: editCourse?.category || (categories[0] || 'General'),
    difficulty: editCourse?.difficulty || Difficulty.BEGINNER,
  });

  useEffect(() => {
    if (editCourse && !categories.includes(editCourse.category)) {
      setIsCustomCategory(true);
    }
  }, [editCourse, categories]);

  const initiatePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) return;
    setShowConfirmation(true);
  };

  const handleFinalConfirm = () => {
    const newCourse: Course = {
      ...(formData as Course),
      id: editCourse?.id || Date.now().toString(),
      rating: editCourse?.rating || 5.0,
      dateAdded: editCourse?.dateAdded || new Date().toISOString().split('T')[0],
      thumbnailUrl: formData.thumbnailUrl || `https://picsum.photos/seed/${editCourse?.id || Date.now()}/800/450`,
      skills: Array.isArray(formData.skills) ? formData.skills : (formData.skills as unknown as string || '').split(',').map(s => s.trim())
    };

    onAdd(newCourse);
    onClose();
  };

  const handleDelete = () => {
    if (editCourse && onDelete) {
      onDelete(editCourse.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98">
      <div className="bg-[#16161b] border border-[#22d3ee] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">
        <div className="p-4 border-b border-[#334155] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="mono text-[10px] text-[#22d3ee]">$</span>
            <h2 className="mono text-[10px] font-bold tracking-widest uppercase text-[#e2e8f0]">
              {showDeleteConfirm ? 'PURGE' : showConfirmation ? 'VERIFY' : editCourse ? 'EDIT_NODE' : 'ADD_NODE'}
            </h2>
          </div>
          {!showConfirmation && !showDeleteConfirm && (
            <div className="flex gap-2 items-center">
              {editCourse && onDelete && (
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="text-[9px] mono text-[#fb7185] hover:text-[#fda4af] transition-colors mr-2"
                >
                  [ DELETE ]
                </button>
              )}
              <button onClick={onClose} className="text-[#94a3b8] hover:text-[#22d3ee] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
        </div>
        
        {showDeleteConfirm ? (
          <div className="p-12 flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-300">
             <div className="space-y-4">
              <div className="w-16 h-16 border border-red-500/30 mx-auto flex items-center justify-center">
                <div className="w-8 h-8 bg-red-500 animate-pulse"></div>
              </div>
              <h3 className="mono text-2xl font-black tracking-tighter uppercase text-red-500">PURGE_NODE?</h3>
              <p className="mono text-[10px] text-white/40 tracking-[0.2em] max-w-xs mx-auto uppercase leading-loose">
                DESTRUCTIVE_ACTION. CANNOT_BE_UNDONE.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="mono text-[10px] py-4 border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest rounded-xl"
              >
                [ ABORT ]
              </button>
              <button 
                onClick={handleDelete}
                className="mono text-[10px] py-4 bg-red-600 text-white font-black hover:bg-red-500 transition-all uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
              >
                [ CONFIRM_DELETE ]
              </button>
            </div>
          </div>
        ) : !showConfirmation ? (
          <form onSubmit={initiatePublish} className="p-8 overflow-y-auto space-y-8">
            <div className="space-y-4">
              <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">SOURCE_URI (YOUTUBE URL)</label>
              <input 
                type="text" 
                value={url}
                required
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFormData(prev => ({ ...prev, videoUrl: e.target.value }));
                }}
                placeholder=" https://youtube.com/watch?v=..."
                className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none transition-all rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">NODE_TITLE</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">CHANNEL_IDENTITY</label>
                <input 
                  required
                  type="text" 
                  value={formData.channelName}
                  onChange={(e) => setFormData({...formData, channelName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">DATA_SYNOPSIS</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none resize-none rounded-xl"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">DOMAIN</label>
                {isCustomCategory ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="NEW_DOMAIN..."
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl"
                    />
                    <button 
                      type="button" 
                      onClick={() => {setIsCustomCategory(false); setFormData({...formData, category: categories[0]});}}
                      className="text-[8px] mono text-white/20 hover:text-white uppercase text-left pl-2"
                    >
                      [ RETURN_TO_LIST ]
                    </button>
                  </div>
                ) : (
                  <select 
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_ENTRY') {
                        setIsCustomCategory(true);
                        setFormData({...formData, category: ''});
                      } else {
                        setFormData({...formData, category: e.target.value});
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-black">{cat.toUpperCase()}</option>
                    ))}
                    <option value="CUSTOM_ENTRY" className="bg-black italic text-white/50">+ ADD NEW</option>
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">TIER</label>
                <select 
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as Difficulty})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl appearance-none"
                >
                  {Object.values(Difficulty).map(diff => (
                    <option key={diff} value={diff} className="bg-black">{diff.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">SKILL_TAGS</label>
                <input 
                  type="text" 
                  value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills as unknown as string)}
                  onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim())})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs mono focus:border-white/50 outline-none rounded-xl"
                  placeholder=" tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] text-black py-5 text-xs mono font-black hover:opacity-90 transition-opacity rounded-xl uppercase tracking-[0.4em]"
              >
                {editCourse ? '[ Update_Record ]' : '[ Commit_To_Archive ]'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
              <div className="w-16 h-16 border border-white mx-auto flex items-center justify-center">
                <div className="w-8 h-8 bg-white animate-pulse"></div>
              </div>
              <h3 className="mono text-2xl font-black tracking-tighter uppercase">COMMIT_TO_ARCHIVE?</h3>
              <p className="mono text-[10px] text-white/40 tracking-[0.2em] max-w-xs mx-auto uppercase leading-relaxed">
                NODE_WILL_BE_VISIBLE_TO_ALL_USERS.
              </p>
            </div>

            <div className="w-full p-8 border border-white/5 bg-white/[0.01] rounded-3xl text-left space-y-4">
              <div>
                <span className="mono text-[8px] text-white/20 block uppercase tracking-widest mb-1">RECORD_TITLE</span>
                <span className="mono font-bold text-xl uppercase tracking-tighter">{formData.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="mono text-[8px] text-white/20 block uppercase tracking-widest mb-1">DOMAIN</span>
                  <span className="mono text-[10px] text-white/60">{formData.category?.toUpperCase()}</span>
                </div>
                <div>
                  <span className="mono text-[8px] text-white/20 block uppercase tracking-widest mb-1">SOURCE</span>
                  <span className="mono text-[10px] text-white/60">{formData.channelName?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-4">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="mono text-[10px] py-4 border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest rounded-xl"
              >
                [ GO_BACK ]
              </button>
              <button 
                onClick={handleFinalConfirm}
                className="mono text-[10px] py-4 bg-gradient-to-r from-[#22d3ee] to-[#a78bfa] text-black font-black hover:opacity-90 transition-opacity uppercase tracking-widest rounded-xl shadow-[0_10px_40px_rgba(34,211,238,0.2)]"
              >
                [ COMMIT_NOW ]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
