import React from 'react';
import { IPTVUploader } from '../components/iptv/IPTVUploader';
import { IPTVChannelList } from '../components/iptv/IPTVChannelList';
import { useIPTVStore } from '../store/iptvStore';

export function IPTVPage() {
  const { channels } = useIPTVStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">TV ao Vivo</h1>
      
      <div className="space-y-8">
        <IPTVUploader />
        
        {channels.length > 0 && (
          <IPTVChannelList />
        )}
      </div>
    </div>
  );
}