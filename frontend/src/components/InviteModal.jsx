import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { inviteAPI } from '../services/inviteAPI';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { value: 'read',       label: 'Read Only',    desc: 'View project & tasks' },
  { value: 'read_write', label: 'Read & Write', desc: 'Create & edit tasks' },
  { value: 'alter',      label: 'Admin',        desc: 'Full control + invite' },
];

export default function InviteModal({ projectId, onClose }) {
  const [permission, setPermission] = useState('read_write');
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const res = await inviteAPI.generate(projectId, { permission, expires_in: 48 });
      setCode(res.data.code);
      toast.success('Code generated!');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Invite to Project</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            {PERMISSIONS.map(p => (
              <label key={p.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${permission === p.value ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
                <input type="radio" name="permission" value={p.value}
                  checked={permission === p.value} onChange={e => setPermission(e.target.value)}
                  className="mt-0.5 accent-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
          {code ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Share this code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-bold text-indigo-700 tracking-wider">{code}</span>
                <button onClick={copyCode} className="p-2 hover:bg-gray-200 rounded-lg">
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Expires in 48 hours</p>
            </div>
          ) : (
            <button onClick={generateCode} disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Invite Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
