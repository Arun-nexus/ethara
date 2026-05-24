import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = isSignup
      ? await signup(form)
      : await login({ email: form.email, password: form.password });

    if (result.success) {
      toast.success(isSignup ? 'Account created!' : 'Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 px-12 text-white max-w-lg">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
            <span className="text-3xl font-bold">TF</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Manage tasks.<br />Track progress.<br />
            <span className="text-brand-200">Like git, but for teams.</span>
          </h1>
          <p className="text-brand-200 text-lg leading-relaxed">
            Create projects, invite your team with a code, assign tasks, and
            watch your progress on a git-style branch timeline.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Invite Codes', 'Role-Based Access', 'Branch Timeline', 'Task Dashboard'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-sm border border-white/20 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-700 rounded-full translate-y-1/3 -translate-x-1/4 opacity-50" />
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">TaskFlow</h2>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isSignup ? 'Start managing your team in seconds' : 'Sign in to continue to TaskFlow'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Arun Kumar"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm
                    focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm
                  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm
                  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white
                font-semibold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 group"
            >
              {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-brand-600 font-semibold hover:underline"
            >
              {isSignup ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
