import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useUserProfile } from '../../hooks/useUserProfile';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AvatarSelector() {
  const { user } = useAuthContext();
  const { profile, updateProfile } = useUserProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'O arquivo deve ter no máximo 5MB';
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Apenas imagens JPG, PNG ou GIF são permitidas';
    }

    return null;
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      if (!user) {
        throw new Error('Você precisa estar logado para alterar o avatar');
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem para fazer upload');
      }

      const file = event.target.files[0];
      
      // Validar arquivo
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Remover avatar anterior se existir
      if (profile?.avatar_url) {
        const { error: deleteError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .remove([`${user.id}/*`]);

        if (deleteError) {
          console.error('Erro ao remover avatar anterior:', deleteError);
        }
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Gerar URL pública
      const { data: urlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(fileName);

      // Atualizar perfil do usuário
      await updateProfile({
        avatar_url: fileName
      });

      // Limpar input de arquivo
      event.target.value = '';
    } catch (err) {
      console.error('Erro ao atualizar avatar:', err);
      if (err instanceof Error) {
        if (err.message.includes('security policy')) {
          setError('Erro de permissão. Por favor, faça login novamente.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro ao atualizar avatar');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    try {
      setError(null);
      setUploading(true);

      // Remover arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([`${user.id}/*`]);

      if (deleteError) throw deleteError;

      // Atualizar perfil
      await updateProfile({
        avatar_url: null
      });

    } catch (err) {
      console.error('Erro ao remover avatar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="relative group">
        <img
          src={profile?.avatar_url ? supabase.storage.from(AVATAR_BUCKET).getPublicUrl(profile.avatar_url).data.publicUrl : '/default-avatar.png'}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 group-hover:opacity-75 transition-opacity"
        />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <label
            htmlFor="avatar-upload"
            className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {profile?.avatar_url && (
            <button
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="ml-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              title="Remover avatar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="text-sm text-gray-400">
          Enviando...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-900/50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        Clique na imagem para alterar seu avatar<br />
        Tamanho máximo: 5MB
      </div>
    </div>
  );
}
