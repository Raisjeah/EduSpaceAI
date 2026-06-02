'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_ICON = {
  completed: <CheckCircle size={16} className="text-green-500" />,
  running: <Clock size={16} className="text-amber-500 animate-pulse" />,
  failed: <XCircle size={16} className="text-red-500" />,
  pending: <Clock size={16} className="text-slate-400" />,
};

const STATUS_TEXT = {
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
  pending: 'Pending',
};

export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Activity Timeline</h4>
      {activities.map((activity, idx) => (
        <div key={`${activity.agent}-${activity.status}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
          {STATUS_ICON[activity.status] || STATUS_ICON.pending}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {activity.agent.charAt(0).toUpperCase() + activity.agent.slice(1)} Agent: {activity.task}
            </div>
            <div className="text-xs text-slate-500">{activity.time}</div>
          </div>
          <span className={`text-xs font-medium ${
            activity.status === 'completed' ? 'text-green-500' :
            activity.status === 'running' ? 'text-amber-500' :
            activity.status === 'failed' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {STATUS_TEXT[activity.status] || STATUS_TEXT.pending}
          </span>
        </div>
      ))}
    </div>
  );
}
