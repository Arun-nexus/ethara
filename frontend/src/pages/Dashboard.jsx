import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, CheckCircle2, Clock, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { projectAPI } from '../services/projectAPI';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, done: 0, in_progress: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data);

      // Aggregate stats from all projects
      let agg = { total: 0, done: 0, in_progress: 0, overdue: 0 };
      for (const p of res.data) {
        try {
          const d = await projectAPI.dashboard(p._id);
          agg.total       += d.data.total;
          agg.done        += d.data.done;
          agg.in_progress += d.data.in_progress;
          agg.overdue     += d.data.overdue;
        } catch {}
      }
      setStats(agg);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Tasks',   value: stats.total,       icon: FolderGit2,    color: 'bg-brand-50 text-brand-600' },
    { label: 'Completed',     value: stats.done,        icon: CheckCircle2,  color: 'bg-green-50 text-green-600' },
    { label: 'In Progress',   value: stats.in_progress, icon: Clock,         color: 'bg-blue-50 text-blue-600' },
    { label: 'Overdue',       value: stats.overdue,     icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-in"
               style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
        <Link
          to="/projects"
          className="flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FolderGit2 size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first project to get started</p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm
              font-medium rounded-xl hover:bg-brand-700 transition-colors"
          >
            <Plus size={16} /> New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((p, i) => (
            <Link
              key={p._id}
              to={`/projects/${p._id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all animate-in group"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <FolderGit2 size={20} className="text-brand-600" />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description || 'No description'}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{p.task_count || 0} tasks</span>
                <span>·</span>
                <span>{p.members?.length || 0} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
