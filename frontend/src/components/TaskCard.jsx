import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { taskAPI } from '../services/taskAPI';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       cls: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  { value: 'review',      label: 'Review',      cls: 'bg-amber-100 text-amber-700' },
  { value: 'done',        label: 'Done',        cls: 'bg-green-100 text-green-700' },
];

export default function TaskCard({ task, projectId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const current = STATUS_OPTIONS.find(s => s.value === task.status);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await taskAPI.update(projectId, task._id, { status: newStatus });
      toast.success('Status updated!');
      onUpdate?.();
    } catch { toast.error('Update failed'); }
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm flex-1 mr-2">{task.title}</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          task.priority === 'high' ? 'bg-red-50 text-red-600' :
          task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
          {task.priority}
        </span>
      </div>
      {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}
      {task.due_date && (
        <p className={`text-xs mb-3 flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
          <Calendar size={11} />{format(new Date(task.due_date), 'MMM d')}{isOverdue && ' · Overdue'}
        </p>
      )}
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} disabled={loading}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium ${current?.cls}`}>
          {loading ? 'Updating...' : current?.label}
          <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${task.status === opt.value ? 'font-semibold' : ''}`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
