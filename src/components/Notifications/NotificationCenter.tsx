import React from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { IoNotifications, IoCheckmark, IoClose } from 'react-icons/io5';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useWatchHistory();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button className="relative p-2">
        <IoNotifications size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpar todas
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhuma notificação
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="ml-2 p-1 text-blue-500 hover:text-blue-600"
                    >
                      <IoCheckmark size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
