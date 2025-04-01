import { create } from 'zustand';
import { supabase } from "../lib/supabase";

interface Role {
  id: string;
  name: string;
  created_at: string;
}

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  roles: Role[];
  initialized: boolean;
  initialize: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  createRole: (name: string) => Promise<void>;
  updateRole: (id: string, name: string) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

export const useAdmin = create<AdminState>((set, get) => ({
  isAdmin: false,
  loading: false,
  error: null,
  roles: [],
  initialized: false,

  initialize: async () => {
    // Se já foi inicializado e é admin, não precisa verificar novamente
    if (get().initialized && get().isAdmin) {
      return;
    }

    try {
      console.log('Iniciando verificação de admin...');
      set({ loading: true, error: null });
      
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user) {
        console.log('Usuário não está logado');
        set({ isAdmin: false, initialized: true });
        return;
      }

      // Verificar no banco de dados se o usuário é admin
      const userId = session.session.user.id;
      const { data: userRoles, error: rolesError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (rolesError && rolesError.code !== 'PGRST116') {
        console.error('Erro ao verificar permissões:', rolesError);
        throw rolesError;
      }

      // Se não encontrou na tabela admin_users, tenta verificar na tabela user_roles
      if (!userRoles) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId);

        if (roleError) {
          console.error('Erro ao verificar roles:', roleError);
          throw roleError;
        }

        // Verificar se alguma das roles é de admin (role_id = 1 geralmente é admin)
        const isAdmin = roleData?.some(role => role.role_id === 1);
        console.log('Verificação de admin por roles:', { userId, isAdmin });
        set({ isAdmin: !!isAdmin, initialized: true });
        return;
      }

      console.log('Verificação de admin por tabela admin_users:', { userId, isAdmin: !!userRoles });
      set({ isAdmin: !!userRoles, initialized: true });
      
    } catch (error: any) {
      console.error('Erro ao verificar admin:', error);
      set({ error: error.message, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  fetchRoles: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ roles: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createRole: async (name: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('roles')
        .insert([{ name }]);

      if (error) throw error;
      get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateRole: async (id: string, name: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('roles')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteRole: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      get().fetchRoles();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  }
}));