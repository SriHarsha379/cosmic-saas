'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  gradient?: string;
}

export default function StatsCard({ title, value, icon, change, changeType = 'neutral', gradient }: StatsCardProps) {
  const changeColor =
    changeType === 'up' ? 'text-emerald-400' : changeType === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${
            gradient || 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
          } border border-white/10`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
