# IPTV Streaming Platform

Uma plataforma moderna de streaming IPTV construída com React, Vite e Supabase.

## 🚀 Funcionalidades

- ✨ Interface moderna e responsiva
- 📱 Suporte para dispositivos móveis
- 🎬 Streaming de filmes, séries e canais ao vivo
- 🔍 Busca e filtros por categoria
- 💾 Cache inteligente para melhor performance
- 🔄 Atualização em tempo real do conteúdo

## 🛠️ Tecnologias

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.io/)
- [Chakra UI](https://chakra-ui.com/)
- [React Query](https://tanstack.com/query/latest)
- [HLS.js](https://github.com/video-dev/hls.js/)

## 📦 Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/iptv-platform.git
cd iptv-platform
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
Crie um arquivo \`.env\` na raiz do projeto:
\`\`\`env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
\`\`\`

4. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

## 🚀 Deploy

O projeto está configurado para deploy na Vercel. Para fazer o deploy:

1. Faça o push do código para o GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente na Vercel
4. A Vercel fará o deploy automaticamente

## 📱 Suporte Mobile

A plataforma é totalmente responsiva e otimizada para dispositivos móveis:
- Layout adaptativo
- Controles touch-friendly
- Streaming otimizado para conexões móveis
- Cache para economia de dados

## 🔧 Configuração

### Proxy Server

O projeto inclui um servidor proxy para gerenciar o streaming de conteúdo:
- Suporte a diferentes fontes de streaming
- Cache de conteúdo
- Headers CORS configurados
- Compressão de dados

### Supabase

O banco de dados Supabase é usado para:
- Armazenamento de metadados de mídia
- Gerenciamento de usuários
- Cache de dados em tempo real

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as [diretrizes de contribuição](CONTRIBUTING.md) antes de enviar um pull request.
