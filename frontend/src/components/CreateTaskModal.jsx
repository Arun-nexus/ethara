import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { taskAPI } from '../services/taskAPI';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ projectId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.due_date) payload.due_date = new Date(payload.due_date).toISOString();
      else delete payload.due_date;
      await taskAPI.create(projectId, payload);
      toast.success('Task created!');
      onCreated?.();
      onClose();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">New Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            placeholder="Task title" required autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Description (optional)" rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            <Plus size={18} />{loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
