-- Primeiro, deletar todos os admins
DELETE FROM public.admin_users;

-- Depois, adicionar apenas você como admin
INSERT INTO public.admin_users (user_id, role_id)
VALUES (
    '39c0fc64-6182-4fc5-ab95-1534a2bdaba3', -- seu user_id
    '3777dffa-4cf9-4439-98ca-63ebc01fe9d8'  -- role_id do super_admin
);
