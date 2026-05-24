import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { inviteAPI } from '../services/inviteAPI';
import toast from 'react-hot-toast';

export default function JoinProject() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Enter an invite code');

    setLoading(true);
    try {
      const res = await inviteAPI.join(code.trim().toUpperCase());
      setJoined(res.data);
      toast.success('Joined project!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code');
    }
    setLoading(false);
  };

  if (joined) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You're in! 🎉</h2>
        <p className="text-gray-500 mb-6">You've joined the project successfully.</p>
        <button
          onClick={() => navigate(`/projects/${joined.project_id}`)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white
            font-medium rounded-xl hover:bg-brand-700 transition-colors"
        >
          Open Project <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Ticket size={28} className="text-brand-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Join a Project</h2>
        <p className="text-sm text-gray-500 mt-1">Enter the invite code shared with you</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="TF-XXXXXXXX"
          maxLength={12}
          className="w-full text-center font-mono text-2xl tracking-[0.3em] px-4 py-4 
            border-2 border-gray-200 rounded-2xl
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none
            placeholder:text-gray-300 placeholder:tracking-[0.15em] placeholder:text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 text-white
            font-semibold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-40"
        >
          {loading ? 'Joining...' : 'Join Project'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Ask your team admin for an invite code. Codes look like TF-A3X9KP and expire in 48 hours.
      </p>
    </div>
  );
}
