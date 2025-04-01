import React, { useState } from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { IoAdd, IoTrash, IoList } from 'react-icons/io5';

interface CustomListsProps {
  contentId: string;
  contentType: 'movie' | 'series';
}

export const CustomLists: React.FC<CustomListsProps> = ({
  contentId,
  contentType,
}) => {
  const { customLists, createCustomList, addToList, removeFromList } = useWatchHistory();
  const [newListName, setNewListName] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);

  const handleCreateList = () => {
    if (newListName.trim()) {
      const listId = createCustomList(newListName.trim());
      addToList(listId, contentId, contentType);
      setNewListName('');
      setShowNewListForm(false);
    }
  };

  const isInList = (listId: string) => {
    return customLists[listId]?.items.some(item => item.id === contentId);
  };

  const toggleInList = (listId: string) => {
    if (isInList(listId)) {
      removeFromList(listId, contentId);
    } else {
      addToList(listId, contentId, contentType);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Listas Personalizadas</h3>
        <button
          onClick={() => setShowNewListForm(!showNewListForm)}
          className="p-2 text-blue-500 hover:text-blue-600"
        >
          <IoAdd size={24} />
        </button>
      </div>

      {showNewListForm && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nome da nova lista"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleCreateList}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Criar
          </button>
        </div>
      )}

      <div className="space-y-2">
        {Object.values(customLists).map((list) => (
          <div
            key={list.id}
            className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <IoList className="text-gray-500" />
              <span>{list.name}</span>
            </div>
            <button
              onClick={() => toggleInList(list.id)}
              className={`p-2 rounded-full ${
                isInList(list.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isInList(list.id) ? 'Remover' : 'Adicionar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
