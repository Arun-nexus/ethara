import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, GitBranch, UserPlus, LayoutGrid, GitCommit, BarChart3 } from 'lucide-react';
import { projectAPI } from '../services/projectAPI';
import { taskAPI } from '../services/taskAPI';
import { branchAPI } from '../services/branchAPI';
import TaskCard from '../components/TaskCard';
import BranchLine from '../components/BranchLine';
import InviteModal from '../components/InviteModal';
import CreateTaskModal from '../components/CreateTaskModal';
import RoleBadge from '../components/RoleBadge';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      const [pRes, tRes, bRes, dRes] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getAll(id),
        branchAPI.getTimeline(id),
        projectAPI.dashboard(id),
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setTimeline(bRes.data);
      setStats(dRes.data);
    } catch (err) {
      toast.error('Failed to load project');
    }
    setLoading(false);
  };

  const isOwner = project?.owner_id === user?.id;

  const tabs = [
    { key: 'tasks',    label: 'Tasks',    icon: LayoutGrid },
    { key: 'branches', label: 'Branches', icon: GitBranch },
    { key: 'stats',    label: 'Stats',    icon: BarChart3 },
  ];

  // Group tasks by status
  const grouped = {
    todo:        tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review:      tasks.filter(t => t.status === 'review'),
    done:        tasks.filter(t => t.status === 'done'),
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
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project?.description || 'No description'}</p>
            <div className="flex items-center gap-3 mt-2">
              <RoleBadge role={isOwner ? 'owner' : 'member'} />
              <span className="text-xs text-gray-400">
                {project?.members?.length || 0} members
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {(isOwner || true) && (
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-sm
                  text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={16} /> Invite
              </button>
            )}
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white text-sm
                font-medium rounded-xl hover:bg-brand-700 transition-colors"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${
                  status === 'todo' ? 'bg-gray-400' :
                  status === 'in_progress' ? 'bg-blue-500' :
                  status === 'review' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                <h3 className="text-sm font-semibold text-gray-700 capitalize">
                  {status.replace('_', ' ')}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    projectId={id}
                    onUpdate={loadAll}
                  />
                ))}
                {items.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <BranchLine timeline={timeline} />
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total',       value: stats.total,       color: 'bg-gray-50' },
            { label: 'To Do',       value: stats.todo,        color: 'bg-gray-50' },
            { label: 'In Progress', value: stats.in_progress, color: 'bg-blue-50' },
            { label: 'Review',      value: stats.review,      color: 'bg-amber-50' },
            { label: 'Done',        value: stats.done,        color: 'bg-green-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-5 text-center animate-in`}
                 style={{ animationDelay: `${i * 0.05}s` }}>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
          {stats.overdue > 0 && (
            <div className="bg-red-50 rounded-xl p-5 text-center col-span-2 lg:col-span-5 animate-in">
              <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-red-500 mt-1">Overdue Tasks</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showInvite && <InviteModal projectId={id} onClose={() => setShowInvite(false)} />}
      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          onClose={() => setShowCreateTask(false)}
          onCreated={loadAll}
        />
      )}
    </div>
  );
}
