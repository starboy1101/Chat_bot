import React from 'react';
import Icon from '../../../components/AppIcon';
import { ChatHistoryStats } from '../types';

interface StatsOverviewProps {
  stats: ChatHistoryStats;
  className?: string;
}

const StatsOverview = ({ stats, className = '' }: StatsOverviewProps) => {
  const statCards = [
    {
      title: 'Total Conversations',
      value: stats.totalConversations.toLocaleString(),
      icon: 'MessageSquare',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages.toLocaleString(),
      icon: 'MessageCircle',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Favorites',
      value: stats.favoriteCount.toLocaleString(),
      icon: 'Heart',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Archived',
      value: stats.archivedCount.toLocaleString(),
      icon: 'Archive',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    }
  ];

  const topCategories = Object.entries(stats.categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className={`bg-card border border-border rounded-lg p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Chat History Overview</h2>
        <Icon name="BarChart3" size={20} className="text-muted-foreground" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${stat.bgColor}`}>
              <Icon name={stat.icon as any} size={24} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map(([category, count], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary' : 
                    index === 1 ? 'bg-secondary' : 'bg-muted-foreground'
                  }`}></div>
                  <span className="text-sm text-foreground capitalize">{category}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {count} conversation{count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;