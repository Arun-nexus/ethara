import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderGit2, Trash2, Users, ArrowRight } from 'lucide-react';
import { projectAPI } from '../services/projectAPI';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name required');
    setCreating(true);
    try {
      await projectAPI.create(form);
      toast.success('Project created!');
      setForm({ name: '', description: '' });
      setShowCreate(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Create failed');
    }
    setCreating(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? All tasks & branches will be lost.`)) return;
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 && 's'}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm
            font-medium rounded-xl hover:bg-brand-700 transition-colors"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-brand-200 p-5 mb-6 slide-up">
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Project name"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description (optional)"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm
                focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg
                  hover:bg-brand-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-gray-500 text-sm hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderGit2 size={64} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden
              hover:shadow-md transition-all animate-in group"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <Link to={`/projects/${p._id}`} className="block p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <FolderGit2 size={20} className="text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                    <p className="text-xs text-gray-500">
                      {p.owner_id === user?.id ? 'Owner' : 'Member'}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{p.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {p.members?.length || 0}
                  </span>
                  <span>{p.task_count || 0} tasks</span>
                </div>
              </Link>

              {/* Delete — only for owner */}
              {p.owner_id === user?.id && (
                <div className="border-t border-gray-100 px-5 py-2 flex justify-end">
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
