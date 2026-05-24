import { Shield, Eye, Pencil, Crown } from 'lucide-react';
const ROLE_CONFIG = {
  read:       { label: 'Read',   icon: Eye,    color: 'bg-gray-100 text-gray-600' },
  read_write: { label: 'Write',  icon: Pencil, color: 'bg-blue-100 text-blue-700' },
  alter:      { label: 'Admin',  icon: Shield, color: 'bg-purple-100 text-purple-700' },
  owner:      { label: 'Owner',  icon: Crown,  color: 'bg-amber-100 text-amber-700' },
  member:     { label: 'Member', icon: Eye,    color: 'bg-gray-100 text-gray-600' },
};
export default function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />{config.label}
    </span>
  );
}
