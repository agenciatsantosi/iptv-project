import { supabase } from '../lib/supabase';

async function createInitialAdmin(email: string, password: string) {
  try {
    // 1. Criar usuário no auth
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    if (!authUser.user) throw new Error('Usuário não criado');

    // 2. Criar papel super_admin se não existir
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    let roleId = existingRole?.id;

    if (!roleId) {
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert([
          {
            name: 'super_admin',
            permissions: ['all'],
          },
        ])
        .select()
        .single();

      if (roleError) throw roleError;
      roleId = newRole.id;
    }

    // 3. Criar admin_user
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert([
        {
          user_id: authUser.user.id,
          role_id: roleId,
        },
      ]);

    if (adminError) throw adminError;

    console.log('Admin inicial criado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar admin inicial:', error);
    return false;
  }
}

// Exemplo de uso:
// createInitialAdmin('seu-email@exemplo.com', 'sua-senha-segura');
