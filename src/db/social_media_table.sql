-- Criar tabela para redes sociais
CREATE TABLE IF NOT EXISTS social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança RLS (Row Level Security)
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa visualize redes sociais
CREATE POLICY "Qualquer pessoa pode visualizar redes sociais" 
ON social_media FOR SELECT USING (true);

-- Permitir que apenas usuários autenticados modifiquem redes sociais
-- Nota: Em um ambiente de produção, você deve restringir isso apenas a administradores
CREATE POLICY "Apenas usuários autenticados podem inserir redes sociais" 
ON social_media FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Apenas usuários autenticados podem atualizar redes sociais" 
ON social_media FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Apenas usuários autenticados podem excluir redes sociais" 
ON social_media FOR DELETE 
TO authenticated 
USING (true);

-- Inserir dados iniciais
INSERT INTO social_media (name, url, icon, active, "order")
VALUES 
  ('Telegram', 'https://t.me/seu_grupo_telegram', 'telegram', true, 1),
  ('WhatsApp', 'https://chat.whatsapp.com/seu_grupo', 'whatsapp', true, 2),
  ('Instagram', 'https://instagram.com/sua_conta', 'instagram', false, 3),
  ('Facebook', 'https://facebook.com/sua_pagina', 'facebook', false, 4);

-- Criar função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_social_media_timestamp
BEFORE UPDATE ON social_media
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
