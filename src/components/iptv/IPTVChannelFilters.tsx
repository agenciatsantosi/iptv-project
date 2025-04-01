import React from 'react';
import { Channel } from '../../types/iptv';

interface IPTVChannelFiltersProps {
  channels: Channel[];
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}

export function IPTVChannelFilters({
  channels,
  selectedGroup,
  onGroupChange,
}: IPTVChannelFiltersProps) {
  const groups = React.useMemo(() => {
    const uniqueGroups = ['all', ...new Set(channels.map((channel) => channel.group))];
    return uniqueGroups.sort();
  }, [channels]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {groups.map((group) => (
        <button
          key={group}
          onClick={() => onGroupChange(group)}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedGroup === group
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
          }`}
        >
          {group === 'all' ? 'Todos' : group}
        </button>
      ))}
    </div>
  );
}