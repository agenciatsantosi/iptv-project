import React, { useState } from 'react';
import { useWatchHistory } from '@/stores/watchHistoryStore';
import { IoAdd, IoClose } from 'react-icons/io5';

interface TagManagerProps {
  contentId: string;
  contentType: 'movie' | 'series';
}

export const TagManager: React.FC<TagManagerProps> = ({
  contentId,
  contentType,
}) => {
  const { tags, taggedContent, createTag, addTag, removeTag } = useWatchHistory();
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6'); // Azul padrão

  const contentTags = taggedContent[contentId]?.tags || [];

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const tagId = createTag(newTagName.trim(), newTagColor);
      addTag(contentId, contentType, tagId);
      setNewTagName('');
      setShowNewTagForm(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    removeTag(contentId, tagId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tags</h3>
        <button
          onClick={() => setShowNewTagForm(!showNewTagForm)}
          className="p-2 text-blue-500 hover:text-blue-600"
        >
          <IoAdd size={24} />
        </button>
      </div>

      {showNewTagForm && (
        <div className="space-y-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome da tag"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex space-x-2">
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <button
              onClick={handleCreateTag}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Criar Tag
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {contentTags.map((tagId) => {
          const tag = tags[tagId];
          if (!tag) return null;

          return (
            <div
              key={tag.id}
              className="flex items-center px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: tag.color }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-2 p-1 hover:text-gray-200"
              >
                <IoClose size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Tags Disponíveis</h4>
        <div className="flex flex-wrap gap-2">
          {Object.values(tags)
            .filter((tag) => !contentTags.includes(tag.id))
            .map((tag) => (
              <button
                key={tag.id}
                onClick={() => addTag(contentId, contentType, tag.id)}
                className="px-3 py-1 rounded-full text-white opacity-60 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
