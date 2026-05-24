import { GitBranch, GitCommit } from 'lucide-react';
import { format } from 'date-fns';

const DOT_COLORS = { todo: 'bg-gray-300', in_progress: 'bg-blue-500', review: 'bg-amber-500', done: 'bg-green-500' };

export default function BranchLine({ timeline }) {
  if (!timeline) return <p className="text-sm text-gray-400 text-center py-8">No commits yet. Create tasks to see the timeline.</p>;
  const { main, features } = timeline;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={18} className="text-indigo-600" />
          <span className="font-mono text-sm font-semibold text-indigo-700">main</span>
          <span className="text-xs text-gray-400">· {main?.commits?.length || 0} commits</span>
        </div>
        <div className="relative pl-8 space-y-0">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-100" />
          {main?.commits?.map((commit, i) => (
            <div key={i} className="relative flex items-start gap-3 pb-5">
              <div className={`absolute left-[-18px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm
                ${DOT_COLORS[commit.status] || 'bg-indigo-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{commit.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{commit.author_name}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{format(new Date(commit.timestamp), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
          ))}
          {(!main?.commits || main.commits.length === 0) && (
            <p className="text-sm text-gray-400 py-4">No commits yet.</p>
          )}
        </div>
      </div>
      {features?.length > 0 && features.map(branch => (
        <div key={branch._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={14} className="text-purple-500" />
            <span className="font-mono text-xs font-semibold text-purple-700">{branch.name}</span>
          </div>
          <div className="pl-4 border-l-2 border-purple-200 space-y-2">
            {branch.commits?.map((commit, i) => (
              <div key={i} className="flex items-start gap-2">
                <GitCommit size={12} className="text-purple-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">{commit.message}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
