import React, { useState } from 'react';
import { Category } from '../types';

const DEFAULT_ICON = '📁';

interface DomainsModalProps {
  categories: Category[];
  onSave: (categories: Category[]) => void;
  onClose: () => void;
  courseCountByCategory: (name: string) => number;
}

const DomainsModal: React.FC<DomainsModalProps> = ({ categories, onSave, onClose, courseCountByCategory }) => {
  const [list, setList] = useState<Category[]>(() => [...categories]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (list.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setNewName('');
      return;
    }
    setList(prev => [...prev, { id: Date.now().toString(), name, icon: DEFAULT_ICON }]);
    setNewName('');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    setList(prev => prev.map(c => c.id === editingId ? { ...c, name } : c));
    setEditingId(null);
    setEditName('');
  };

  const remove = (cat: Category) => {
    const count = courseCountByCategory(cat.name);
    if (count > 0 && !window.confirm(`"${cat.name}" is used by ${count} course(s). Remove anyway? Courses will keep the category name.`)) return;
    setList(prev => prev.filter(c => c.id !== cat.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] rounded-[2rem]">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white"></div>
            <h2 className="mono text-[10px] font-bold tracking-[0.3em] uppercase">EDIT_DOMAINS</h2>
          </div>
          <button onClick={onClose} className="hover:text-white text-white/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">ADD_NEW_DOMAIN</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Domain name..."
                className="flex-1 bg-white/5 border border-white/10 p-3 text-sm mono focus:border-white/50 outline-none rounded-xl placeholder:text-white/20"
              />
              <button type="button" onClick={handleAdd} className="mono text-[10px] px-4 py-2 bg-white text-black font-black rounded-xl hover:bg-white/90">
                ADD
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="mono text-[9px] text-white/30 block uppercase tracking-widest">CURRENT_DOMAINS</label>
            <ul className="space-y-1 border border-white/10 rounded-xl overflow-hidden">
              {list.map(cat => (
                <li key={cat.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border-b border-white/5 last:border-b-0">
                  <span className="text-lg" aria-hidden>{cat.icon}</span>
                  {editingId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="flex-1 bg-white/5 border border-white/20 p-2 text-xs mono outline-none rounded"
                      />
                      <button type="button" onClick={saveEdit} className="mono text-[9px] text-white/60 hover:text-white">DONE</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 mono text-[11px] text-white/90">{cat.name}</span>
                      <span className="mono text-[8px] text-white/30">{courseCountByCategory(cat.name)} courses</span>
                      <button type="button" onClick={() => startEdit(cat)} className="mono text-[9px] text-white/40 hover:text-white">EDIT</button>
                      <button type="button" onClick={() => remove(cat)} className="mono text-[9px] text-red-500/70 hover:text-red-500">REMOVE</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 mono text-[10px] py-3 border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest rounded-xl">
              CANCEL
            </button>
            <button type="submit" className="flex-1 mono text-[10px] py-3 bg-white text-black font-black hover:bg-white/90 transition-all uppercase tracking-widest rounded-xl">
              SAVE_DOMAINS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DomainsModal;
