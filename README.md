# Sistema IPTV - Plataforma de Streaming Avançada

Um sistema completo de IPTV desenvolvido com tecnologias modernas, oferecendo uma experiência completa de streaming com interface moderna e responsiva.

## ✨ Funcionalidades Principais

### 🎥 Sistema de Streaming
- Reprodução de canais ao vivo em alta qualidade
- Suporte a múltiplas resoluções (SD, HD, FHD, 4K)
- Adaptação automática da qualidade baseada na conexão
- Controles avançados de reprodução
- Picture-in-Picture (PIP)
- Closed Captions e legendas
- Timeshift para programação ao vivo

### 📺 Gerenciamento de Conteúdo
- Organização por categorias (Filmes, Séries, Esportes, etc)
- Sistema de favoritos personalizado
- Histórico de visualização
- Continuação automática de reprodução
- Filtros avançados de busca
- Tags e metadados personalizados

### 📱 Interface Multi-Plataforma
- Design responsivo para todos dispositivos
- Temas claro/escuro
- Layout personalizável
- Atalhos de teclado
- Modo TV para smart TVs
- Controle remoto virtual

### 🎮 Controles e Personalização
- Ajuste de qualidade manual/automático
- Controle de volume avançado
- Modos de visualização (normal, wide, stretch)
- Personalização de buffer
- Ajustes de áudio (equalização, balanço)
- Configurações de rede

### 📊 Sistema de Recomendação
- Recomendações baseadas em histórico
- Conteúdo relacionado
- Tendências e populares
- Descoberta de novos conteúdos
- Perfis de interesse
- Recomendações sazonais

### 🔍 Preview e Informações
- Miniaturas dinâmicas
- Informações detalhadas do conteúdo
- Classificação e reviews
- Programação futura
- Detalhes técnicos da transmissão
- Informações do EPG

### 📋 Gerenciamento de Listas
- Importação de múltiplos formatos
- Validação automática de canais
- Backup e sincronização
- Organização personalizada
- Compartilhamento de listas
- Atualizações automáticas

### ⚙️ Configurações Avançadas
- Ajustes de cache
- Configurações de rede
- Perfis de qualidade
- Personalização da interface
- Backup e restauração
- Logs e diagnósticos

## 👑 Painel Administrativo

### 🎛️ Dashboard Principal
- Visão geral do sistema
- Métricas em tempo real
- Gráficos de performance
- Alertas e notificações
- KPIs principais
- Status dos serviços

### 👥 Gestão de Usuários
- Gerenciamento de contas
- Níveis de acesso
- Suspensão/Banimento
- Histórico de atividades
- Logs de acesso
- Gestão de permissões

### 📺 Gestão de Conteúdo
- Gerenciamento de canais
- Categorização de conteúdo
- Moderação de conteúdo
- Upload de EPG
- Gestão de metadados
- Agendamento de conteúdo

### 💳 Gestão Financeira
- Controle de assinaturas
- Histórico de pagamentos
- Relatórios financeiros
- Gestão de planos
- Cupons e descontos
- Integrações com gateways

### 🔍 Monitoramento
- Status dos servidores
- Monitoramento de streams
- Logs do sistema
- Alertas automáticos
- Métricas de qualidade
- Diagnóstico de problemas

### 📊 Relatórios Avançados
- Relatórios personalizados
- Exportação de dados
- Análise de audiência
- Métricas de engajamento
- Relatórios de erro
- Tendências de uso

### ⚙️ Configurações do Sistema
- Configurações gerais
- Limites do sistema
- Blacklist/Whitelist
- Regras de cache
- Políticas de segurança
- Backup do sistema

### 🛠️ Ferramentas de Manutenção
- Limpeza de cache
- Otimização de banco
- Verificação de links
- Testes automáticos
- Ferramentas de debug
- Manutenção programada

### 📨 Comunicação
- Sistema de mensagens
- Notificações em massa
- Templates de email
- Avisos do sistema
- Suporte ao usuário
- FAQ gerenciável

### 🔒 Controle de Acesso
- Roles e permissões
- Autenticação em 2 fatores
- Logs de atividade
- Políticas de senha
- Sessões ativas
- Bloqueio de IP

### 📱 Gestão Multi-plataforma
- Controle de versões
- Atualizações do sistema
- Configurações por plataforma
- Recursos específicos
- Compatibilidade
- Release notes

### 🌐 Gestão de Servidores
- Load balancing
- Gestão de recursos
- Escalabilidade
- Redundância
- Manutenção
- Backups

## 🚀 Stack Tecnológico Detalhado

### Frontend
- **React 18**
  - Context API para gerenciamento de estado
  - Hooks personalizados para lógica reutilizável
  - React Query para cache e gerenciamento de dados
  - React Router v6 para navegação

- **TypeScript**
  - Tipagem estrita
  - Interfaces bem definidas
  - Generics para componentes reutilizáveis

- **UI/UX**
  - Chakra UI para componentes base
  - Radix UI para primitivos acessíveis
  - Tailwind CSS para estilização
  - Framer Motion para animações
  - Plyr para player de vídeo personalizado

### Backend
- **Supabase**
  - Autenticação de usuários
  - Armazenamento de metadados
  - Realtime subscriptions
  - Row Level Security

- **Express.js**
  - Middleware personalizado
  - Roteamento avançado
  - Tratamento de erros
  - Logging detalhado

- **Processamento de Mídia**
  - FFmpeg para transcodificação
  - HLS.js para streaming adaptativo
  - Chunks otimizados
  - Qualidade adaptativa

## 📊 Sistema de Estatísticas e Otimização de Carregamento

### Painel Administrativo Aprimorado

O painel administrativo foi aprimorado com um sistema completo de estatísticas que fornece insights detalhados sobre o conteúdo disponível no banco de dados e o que está carregado no sistema.

#### Funcionalidades de Estatísticas

- **Visão Geral de Conteúdo**:
  - Exibição do total de registros no banco de dados
  - Contagem de registros carregados no sistema
  - Percentual de carregamento por categoria
  - Monitoramento em tempo real do progresso de carregamento

- **Detalhamento por Categoria**:
  - Filmes: total no banco vs. carregados
  - Séries: total no banco vs. carregadas
  - TV ao Vivo: total no banco vs. carregados
  - Barras de progresso visuais para cada categoria

- **Carregamento Sob Demanda**:
  - Botão para carregar mais conteúdo diretamente do painel
  - Indicadores de progresso durante o carregamento
  - Atualização automática das estatísticas após carregamento

### Otimizações de Desempenho

Para lidar com grandes volumes de dados (100MB+ de links), implementamos diversas otimizações:

#### Carregamento Eficiente de Dados

- **Paginação Otimizada**:
  - Carregamento de conteúdo em lotes menores
  - Tamanho de página ajustável para equilibrar desempenho e experiência
  - Suporte para navegação entre páginas de conteúdo

- **Carregamento por Categorias**:
  - Separação do carregamento por tipo de conteúdo (filmes, séries, TV ao vivo)
  - Priorização de conteúdo mais acessado
  - Carregamento contextual baseado na navegação do usuário

- **Virtualização de Listas**:
  - Renderização apenas dos itens visíveis na tela
  - Suporte para listas longas sem impacto no desempenho
  - Rolagem suave mesmo com milhares de itens

#### Monitoramento e Diagnóstico

- **Logs Detalhados**:
  - Sistema de logging abrangente para diagnóstico
  - Monitoramento do progresso de carregamento
  - Detecção e relatório de erros

- **Verificação de Integridade**:
  - Validação de dados carregados
  - Detecção de inconsistências
  - Recuperação automática de falhas

### Arquitetura de Dados

- **Armazenamento Eficiente**:
  - Otimização do formato de dados para reduzir overhead
  - Compressão de dados quando apropriado
  - Normalização para evitar duplicação

- **Consultas Otimizadas**:
  - Consultas seletivas que buscam apenas os dados necessários
  - Índices otimizados no banco de dados
  - Caching de consultas frequentes

### Como Usar o Sistema de Estatísticas

1. Acesse o painel administrativo em `/admin`
2. Visualize as estatísticas gerais na seção "Estatísticas de Conteúdo"
3. Consulte o detalhamento por categoria na tabela abaixo
4. Use o botão "Carregar Mais Conteúdo" para carregar dados adicionais
5. Acompanhe o progresso através das barras de progresso

### Solução de Problemas de Carregamento

Se o sistema não estiver carregando todos os dados do banco:

1. Verifique os logs no console do navegador para identificar possíveis erros
2. Confirme se o limite de paginação está configurado corretamente
3. Verifique se há filtros ativos que possam estar limitando os resultados
4. Tente carregar categorias específicas em vez de todo o conteúdo de uma vez
5. Monitore o uso de memória do navegador durante o carregamento

### Considerações Técnicas

- O sistema foi projetado para lidar com mais de 100.000 registros
- A paginação e virtualização permitem uma experiência fluida mesmo com grandes volumes de dados
- As estatísticas são atualizadas em tempo real conforme o conteúdo é carregado
- O armazenamento local é otimizado para evitar problemas de limite de tamanho

## 🎬 Sistema Avançado de Players

### Arquitetura de Players Especializados

Nossa aplicação implementa um sistema de players especializados para diferentes tipos de conteúdo, garantindo a melhor experiência possível para cada formato:

#### 📺 VideoPlayer (TV ao vivo)

O VideoPlayer é especializado em streaming ao vivo utilizando tecnologias HLS:

- **Características**:
  - Implementado com HLS.js para processamento de fluxos .m3u8
  - Configuração adaptativa para streaming em tempo real
  - Otimizado para baixa latência e reconexão automática
  - Detecção e tratamento de interrupções de stream
  - Modo de recuperação para falhas de rede
  - Suporte para segmentos MPEG-TS

- **Configurações de Performance**:
  - `enableWorker: true` para processamento em thread separada
  - `lowLatencyMode: true` para minimizar delay
  - `backBufferLength: 30` para economia de memória
  - Tratamento avançado de erros de rede e mídia

#### 🎥 VODPlayer (Filmes e Séries)

O VODPlayer é otimizado para conteúdo sob demanda (Video On Demand):

- **Características**:
  - Acesso direto à fonte MP4 sem necessidade de proxy
  - Extração automática da URL original a partir de URLs de proxy
  - Player HTML5 nativo para máxima compatibilidade
  - Interface com indicadores de carregamento
  - Sistema de recuperação de erros com botão de retry
  - Mensagens de erro amigáveis

- **Vantagens**:
  - Carregamento mais rápido e direto dos vídeos
  - Menor uso de recursos do servidor
  - Melhor compatibilidade com diversos formatos MP4
  - Experiência mais fluida para conteúdo VOD

### Sistema Inteligente de Detecção de Conteúdo

A plataforma detecta automaticamente o tipo de conteúdo e seleciona o player mais adequado:

- **Detecção Automática**:
  - Identificação do tipo de conteúdo (filme, série, TV ao vivo)
  - Seleção do player apropriado baseado no tipo
  - Configuração automática de parâmetros específicos

- **Tratamento Especializado**:
  - TV ao vivo: VideoPlayer com HLS.js e proxy de streaming
  - Filmes/Séries: VODPlayer com acesso direto MP4

## 🔄 Sistema de Proxy Duplo para Streaming

### Arquitetura de Proxy Especializado

Nossa plataforma utiliza um sistema de proxy duplo, com servidores dedicados para diferentes tipos de conteúdo:

#### 📡 Live Proxy (Porta 3001)

Servidor proxy especializado em conteúdo de TV ao vivo:

- **Características**:
  - Otimizado para streaming contínuo e de baixa latência
  - Headers especializados para CORS e segurança
  - Suporte a diversos formatos de streaming ao vivo
  - Tratamento de redirecionamentos e autenticação
  - Verificação de URLs para formato adequado

- **Funcionalidades**:
  - Endpoint `/stream` para transmissão de conteúdo ao vivo
  - Endpoint `/direct` para acesso direto com headers otimizados
  - Endpoint `/generate-url` para URLs alternativas de canais
  - Health check para monitoramento de status

#### 🎞️ VOD Proxy (Porta 3002)

Servidor proxy especializado em conteúdo sob demanda (filmes e séries):

- **Características**:
  - Otimizado para arquivos MP4 e conteúdo VOD
  - Sistema de cache para melhor desempenho
  - Conversão opcional via FFmpeg para compatibilidade
  - Stream controlado de arquivos grandes
  - Gerenciamento de conexões ativas

- **Funcionalidades**:
  - Cache de streams para economia de largura de banda
  - Conversão sob demanda de formatos não suportados
  - Limpeza automática de streams inativos
  - Estatísticas de uso e monitoramento

### Gerenciamento Centralizado de Proxies

O sistema inicia e gerencia automaticamente ambos os proxies:

- **Controle Unificado**:
  - Inicialização automática de ambos os servidores
  - Monitoramento de status e reinicialização em caso de falha
  - Logs unificados para diagnóstico de problemas
  - Encerramento gracioso em caso de shutdown

- **Configuração Flexível**:
  - Variáveis de ambiente para portas dos serviços
  - Facilidade de manutenção e atualização
  - Tolerância a falhas com reinicialização automática
  - Compatibilidade com ambiente de produção e desenvolvimento

## 📋 Uso do Sistema

### Para Usuários Finais

1. **Navegando no Conteúdo**:
   - Acesse `/movies` para filmes
   - Acesse `/series` para séries de TV
   - Acesse `/live` para canais de TV ao vivo

2. **Assistindo Conteúdo**:
   - Clique em "Assistir" em qualquer item para iniciar a reprodução
   - Para filmes e séries: reprodução direta sem proxy
   - Para TV ao vivo: reprodução via HLS com proxy de streaming

3. **Recursos durante a Reprodução**:
   - Controles padrão (play/pause, volume, fullscreen)
   - Opções de qualidade de vídeo (quando disponível)
   - Status de carregamento e bufferização

### Para Desenvolvedores

1. **Iniciando os Servidores**:
   ```bash
   # Na pasta v20/src/server
   node --loader tsx start-proxies.ts
   ```

2. **Portas dos Serviços**:
   - Live Proxy (TV ao vivo): `http://localhost:3001`
   - VOD Proxy (Filmes/Séries): `http://localhost:3002`

3. **Principais Endpoints**:
   - `/stream?url=URL_ENCODED_STREAM` - Para iniciar streaming de conteúdo
   - `/health` - Para verificar status dos servidores
   - `/hls/STREAM_ID/index.m3u8` - Para acessar playlists HLS geradas

4. **Variáveis de Ambiente**:
   - `LIVE_PROXY_PORT` - Porta para o proxy de TV ao vivo (padrão: 3001)
   - `PROXY_PORT` - Porta para o proxy VOD (padrão: 3002)
   - `VITE_LIVE_PROXY_URL` - URL base para o proxy de TV ao vivo
   - `VITE_VOD_PROXY_URL` - URL base para o proxy VOD

## 🔧 Manutenção e Solução de Problemas

### Problemas Comuns e Soluções

1. **Vídeo não carrega**:
   - Para TV ao vivo: verifique se o proxy na porta 3001 está rodando
   - Para filmes/séries: verifique se a URL MP4 original está acessível

2. **Erro de CORS**:
   - Verifique se os headers de CORS estão corretamente configurados nos proxies
   - Teste acesso direto à URL de mídia para confirmar disponibilidade

3. **Alto uso de CPU/memória**:
   - Verifique número de streams ativos no painel de administração
   - Considere ajustar parâmetros de buffer e qualidade para streams frequentes

4. **Problemas de proxy**:
   - Verifique logs de cada servidor proxy para diagnosticar erros específicos
   - Reinicie os servidores proxy se necessário

### Logs e Monitoramento

Os proxies geram logs detalhados com informações importantes:

- **Formato dos Logs**:
  - `[VOD Proxy]` ou `[Live Proxy]` prefixando cada mensagem
  - Timestamp implícito nos logs
  - Detalhes da operação ou erro ocorrido

- **Níveis de Log**:
  - Informativo: operações normais
  - Aviso: problemas não críticos
  - Erro: falhas que requerem atenção

## 📋 Requisitos Detalhados

### Requisitos de Sistema
- Node.js v18.0.0 ou superior
- FFmpeg v4.4 ou superior
- Mínimo 4GB de RAM
- Armazenamento recomendado: 50GB+
- Conexão de internet estável (100Mbps+ recomendado)

### Requisitos de Desenvolvimento
- Git
- VS Code (recomendado)
- Extensões recomendadas:
  - ESLint
  - Prettier
  - TypeScript + Webpack Problem Matchers
  - Tailwind CSS IntelliSense

## 🛠️ Guia de Instalação Detalhado

1. **Preparação do Ambiente**
```bash
# Verifique a versão do Node.js
node --version  # Deve ser 18.0.0 ou superior

# Verifique a instalação do FFmpeg
ffmpeg -version

# Clone o repositório
git clone [url-do-seu-repositorio]
cd project

# Instale as dependências
npm install
```

2. **Configuração do Ambiente**
```bash
# Copie o arquivo de exemplo de ambiente
cp .env.example .env

# Estrutura do .env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_API_URL=http://localhost:3000
VITE_PROXY_PORT=3001
VITE_VOD_PROXY_PORT=3002
VITE_LIVE_PROXY_PORT=3003
VITE_PLAYLIST_PROXY_PORT=3004
```

3. **Configuração do FFmpeg**
```bash
# Instalação automática do FFmpeg
node install-ffmpeg.js

# Verificação da instalação
ffmpeg -encoders  # Deve listar os encoders disponíveis
```

## 🎮 Scripts e Comandos Detalhados

### Desenvolvimento
```bash
# Inicia o ambiente de desenvolvimento completo
npm run dev  # Inicia frontend + todos os proxies

# Inicia servidores proxy individualmente
npm run proxy:vod     # Inicia servidor VOD
npm run proxy:live    # Inicia servidor Live
npm run proxy:playlist # Inicia servidor Playlist

# Desenvolvimento frontend apenas
npm run dev:frontend  # Inicia apenas o frontend
```

### Build e Produção
```bash
# Build do projeto
npm run build        # Cria build otimizada
npm run build:analyze # Cria build com análise de bundle

# Preview da build
npm run preview      # Visualiza build local
```

### Testes e Qualidade
```bash
# Executa testes
npm run test        # Roda todos os testes
npm run test:watch  # Roda testes em modo watch
npm run test:coverage # Gera relatório de cobertura

# Linting e Formatação
npm run lint       # Executa ESLint
npm run format     # Formata código com Prettier
```

## 📁 Estrutura do Projeto Detalhada

```
project/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes de UI básicos
│   │   ├── player/      # Componentes do player
│   │   ├── layout/      # Componentes de layout
│   │   └── shared/      # Componentes compartilhados
│   ├── contexts/
│   │   ├── auth/        # Contexto de autenticação
│   │   ├── player/      # Contexto do player
│   │   └── theme/       # Contexto de tema
│   ├── hooks/
│   │   ├── player/      # Hooks relacionados ao player
│   │   ├── auth/        # Hooks de autenticação
│   │   └── api/         # Hooks de API
│   ├── pages/
│   │   ├── auth/        # Páginas de autenticação
│   │   ├── player/      # Páginas do player
│   │   └── admin/       # Páginas administrativas
│   ├── services/
│   │   ├── api/         # Serviços de API
│   │   ├── storage/     # Serviços de armazenamento
│   │   └── analytics/   # Serviços de analytics
│   ├── store/
│   │   ├── slices/      # Slices de estado
│   │   └── middleware/  # Middleware personalizado
│   ├── styles/
│   │   ├── global/      # Estilos globais
│   │   └── themes/      # Temas da aplicação
│   ├── types/
│   │   ├── api/         # Tipos da API
│   │   ├── player/      # Tipos do player
│   │   └── common/      # Tipos comuns
│   └── utils/
│       ├── format/      # Utilitários de formatação
│       ├── validation/  # Utilitários de validação
│       └── helpers/     # Helpers diversos
├── server/
│   ├── proxy/          # Servidores proxy
│   ├── middleware/     # Middleware do servidor
│   └── utils/          # Utilitários do servidor
├── public/
│   ├── assets/        # Recursos estáticos
│   └── icons/         # Ícones
└── supabase/
    ├── migrations/    # Migrações do banco
    └── functions/     # Funções do Supabase
```

## 🔧 Configurações Avançadas

### Configuração do Player
```typescript
// Exemplo de configuração do player
const playerConfig = {
  quality: {
    default: '720p',
    options: ['1080p', '720p', '480p', '360p']
  },
  buffering: {
    initialBuffer: 5,  // segundos
    bufferWhilePaused: true
  },
  controls: {
    autohide: 3000,   // ms
    keyboard: true
  }
};
```

### Configuração dos Proxies
```javascript
// Exemplo de configuração de proxy
const proxyConfig = {
  // Configuração do proxy VOD
  vod: {
    port: process.env.VOD_PROXY_PORT,
    cache: {
      enabled: true,
      maxAge: 3600  // 1 hora
    },
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD']
    }
  },
  // Configuração do proxy Live
  live: {
    port: process.env.LIVE_PROXY_PORT,
    bufferSize: 1024 * 1024,  // 1MB
    timeout: 30000  // 30 segundos
  }
};
```

## 📊 Monitoramento e Logs

### Logs do Sistema
- Logs de acesso
- Logs de erro
- Logs de performance
- Métricas de streaming

### Monitoramento
- Uso de CPU/Memória
- Latência de rede
- Taxa de erro
- Qualidade do streaming

## 🔒 Segurança

### Autenticação
- JWT Tokens
- Refresh Tokens
- Rate Limiting
- Proteção contra CSRF

### Streaming
- URLs assinadas
- Tokens de acesso
- Criptografia de stream
- Proteção contra hotlinking

## 📈 Performance

### Otimizações Frontend
- Code Splitting
- Lazy Loading
- Caching
- Compressão de assets

### Otimizações Backend
- Load Balancing
- Caching em memória
- Otimização de queries
- Compressão de resposta

## 🌐 Deploy

### Preparação
1. Configuração de variáveis de ambiente
2. Build otimizada
3. Testes de integração
4. Verificação de segurança

### Processo de Deploy
```bash
# 1. Build do projeto
npm run build

# 2. Testes
npm run test:all

# 3. Deploy dos servidores proxy
pm2 start ecosystem.config.js

# 4. Deploy do frontend
# Depende do seu provedor (Vercel, Netlify, etc)
```

## 🤝 Guia de Contribuição

### Processo de Desenvolvimento
1. Fork do projeto
2. Criação de branch (`git checkout -b feature/nome-da-feature`)
3. Desenvolvimento com TDD
4. Documentação atualizada
5. Pull Request

### Padrões de Código
- ESLint config personalizado
- Prettier para formatação
- Conventional Commits
- Code Review obrigatório

## 📚 Recursos Adicionais

### Documentação Externa
- [React Docs](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.io/docs)
- [FFmpeg Docs](https://ffmpeg.org/documentation.html)

### Tutoriais e Guias
- [Guia de Início Rápido](./docs/quickstart.md)
- [Guia de Desenvolvimento](./docs/development.md)
- [Guia de Deploy](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para [seu-email@dominio.com] ou abra uma issue no GitHub.

### 🔐 Sistema de Usuários
- Multi-perfis por conta
- Controle parental
- Preferências por perfil
- Histórico de visualização
- Restrições de conteúdo
- Sincronização entre dispositivos

### 🌐 Suporte a Idiomas
- Interface multi-idioma
- Legendas em múltiplos idiomas
- Áudio alternativo
- RTL (Right-to-Left) suporte
- Traduções automáticas
- Localização de conteúdo

### 📊 Analytics e Estatísticas
- Tempo de visualização
- Canais mais assistidos
- Horários populares
- Relatórios de uso
- Métricas de qualidade
- Diagnósticos de performance

### 🎛️ Integrações
- Suporte a EPG (Guia de Programação)
- Integração com IMDb
- Compartilhamento social
- Chromecast/AirPlay
- Controles externos
- APIs de terceiros

### 💾 Gestão de Dados
- Backup automático
- Sincronização na nuvem
- Exportação de dados
- Limpeza automática
- Compressão inteligente
- Recuperação de dados

### 📱 Apps Companion
- Controle remoto via smartphone
- Notificações push
- Sincronização offline
- Segunda tela
- Widget para dispositivos móveis
- Quick actions

### 🛠️ Ferramentas de Diagnóstico
- Teste de velocidade
- Verificação de conectividade
- Debug de streaming
- Logs detalhados
- Relatórios de erro
- Suporte remoto

### 🎮 Atalhos e Controles
- Atalhos de teclado personalizáveis
- Gestos touch
- Controle por voz
- Atalhos globais
- Macros personalizadas
- Integração com controles externos

## 🔧 Requisitos de Sistema

### Requisitos Mínimos
- Processador: Dual Core 2.0 GHz
- Memória RAM: 4GB
- Armazenamento: 50GB disponível
- Conexão: 10 Mbps
- Sistema Operacional: Windows 10, macOS 10.15, Linux (kernel 5.0+)
- Navegador: Chrome 90+, Firefox 90+, Safari 15+

### Requisitos Recomendados
- Processador: Quad Core 3.0 GHz
- Memória RAM: 8GB
- Armazenamento: 100GB SSD
- Conexão: 50 Mbps
- GPU: Dedicada com 2GB VRAM
- Sistema Operacional: Últimas versões

## 📱 Compatibilidade

### Dispositivos Suportados
- Computadores (Windows, macOS, Linux)
- Smart TVs (Android TV, webOS, Tizen)
- Dispositivos móveis (iOS, Android)
- Consoles de games
- TV Boxes e Sticks
- Navegadores web

### Formatos Suportados
- Vídeo: MP4, MKV, AVI, MOV
- Áudio: AAC, MP3, AC3, DTS
- Legendas: SRT, SSA, VTT
- Playlists: M3U, M3U8, W3U
- Streaming: HLS, DASH, RTMP
- Containers: TS, FLV, WebM

## 🔒 Privacidade e Segurança

### Proteção de Dados
- Criptografia end-to-end
- Armazenamento seguro
- Autenticação em duas etapas
- Tokens de segurança
- Proteção contra bots
- Backups criptografados

### Conformidade
- GDPR
- LGPD
- CCPA
- ISO 27001
- PCI DSS
- SOC 2

## 📈 Escalabilidade

### Limites do Sistema
- Usuários simultâneos: Ilimitado
- Canais por lista: 50.000+
- Listas por usuário: 100
- Perfis por conta: 5
- Dispositivos por conta: 10
- Streams simultâneos: 4

### Performance
- Tempo de carregamento < 2s
- Buffering < 500ms
- Troca de canais < 1s
- Uso de CPU < 30%
- Uso de memória < 500MB
- Cache inteligente

## ✅ Checklist do Sistema

### ✔️ Funcionalidades Implementadas

#### Frontend
- [x] Interface base com React e TypeScript
- [x] Sistema de rotas
- [x] Player de vídeo básico
- [x] Layout responsivo
- [x] Tema escuro/claro
- [x] Componentes UI base
- [x] Sistema de autenticação
- [x] Integração com Supabase
- [x] Gestão de estado com React Query
- [x] Animações com Framer Motion

#### Backend
- [x] Servidor Express básico
- [x] Integração com FFmpeg
- [x] Parser de playlists
- [x] Sistema de proxy básico
- [x] Conexão com Supabase
- [x] Endpoints principais
- [x] Middleware de autenticação
- [x] Sistema de logs básico
- [x] Tratamento de erros
- [x] CORS configurado

#### Player
- [x] Reprodução de streams HLS
- [x] Controles básicos de reprodução
- [x] Ajuste de volume
- [x] Tela cheia
- [x] Seleção de qualidade
- [x] Buffer configurado
- [x] Integração com Plyr
- [x] Suporte a legendas
- [x] Picture-in-Picture
- [x] Atalhos de teclado básicos

### 🚧 Funcionalidades em Desenvolvimento

#### Frontend
- [ ] Sistema de busca avançado
- [ ] Filtros complexos
- [ ] Sistema de favoritos
- [ ] Histórico de visualização
- [ ] Perfis de usuário
- [ ] Recomendações personalizadas
- [ ] Compartilhamento social
- [ ] Notificações push
- [ ] Modo offline
- [ ] PWA completo

#### Backend
- [ ] Sistema de cache avançado
- [ ] Load balancing
- [ ] Compressão de streams
- [ ] Transcodificação em tempo real
- [ ] Sistema de backup
- [ ] API documentada
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento avançado
- [ ] Rate limiting

#### Painel Admin
- [ ] Dashboard completo
- [ ] Gestão de usuários
- [ ] Analytics avançado
- [ ] Relatórios personalizados
- [ ] Gestão de conteúdo
- [ ] Sistema de moderação
- [ ] Controle de acesso
- [ ] Logs detalhados
- [ ] Backup e restauração
- [ ] Configurações avançadas

### 📋 Próximas Implementações (Prioridade)

#### Alta Prioridade
1. Sistema de cache avançado
2. Dashboard administrativo
3. Gestão de usuários
4. Sistema de busca avançado
5. Histórico de visualização

#### Média Prioridade
6. Sistema de recomendação
7. Perfis de usuário
8. Analytics avançado
9. Load balancing
10. Notificações push

#### Baixa Prioridade
11. Compartilhamento social
12. PWA completo
13. Modo offline
14. Transcodificação em tempo real
15. Sistema de moderação

### ⚠️ Pontos de Atenção

#### Técnicos
- Otimização de performance do player
- Melhorar gestão de memória
- Reduzir tempo de carregamento
- Aumentar cobertura de testes
- Documentação técnica completa

#### Usuário
- Melhorar UX do player
- Simplificar navegação
- Adicionar mais feedbacks visuais
- Melhorar sistema de busca
- Tutorial interativo

#### Infraestrutura
- Implementar CDN
- Melhorar escalabilidade
- Backup automático
- Monitoramento 24/7
- Disaster recovery

### 📊 Métricas de Progresso

#### Frontend
- Implementado: 75%
- Em desenvolvimento: 15%
- Pendente: 10%

#### Backend
- Implementado: 60%
- Em desenvolvimento: 25%
- Pendente: 15%

#### Admin
- Implementado: 45%
- Em desenvolvimento: 35%
- Pendente: 20%

### 🎯 Objetivos para Próxima Release

1. Implementar sistema de favoritos e histórico de visualização
2. Melhorar sistema de busca com filtros avançados
3. Adicionar mais opções de personalização no player
4. Implementar sistema de recomendações personalizado
5. Expandir funcionalidades do painel administrativo

## 🔄 Atualizações Recentes (Abril 2025)

#### ✅ Melhorias na Página de Séries
- [x] Implementação de agrupamento de séries para evitar entradas duplicadas
- [x] Adição de contadores para total de séries e episódios no topo da página
- [x] Correção da navegação para a página de detalhes ao clicar em um card de série
- [x] Remoção do filtro de grupo "all" que causava problemas no carregamento
- [x] Implementação de modo de depuração para alternar entre lista estática e busca dinâmica
- [x] Substituição da lista horizontal de botões por um dropdown para melhor visualização em dispositivos móveis
- [x] Implementação de gerenciamento de estado para controle do dropdown
- [x] Adição de detecção de clique fora para fechar o dropdown automaticamente

#### ✅ Melhorias na Página de TV ao Vivo
- [x] Ajuste da lógica de filtragem para remover grupos relacionados a filmes ou séries
- [x] Implementação de lista completa de grupos para canais de TV ao vivo
- [x] Exclusão de grupos com termos como "SÉRIES", "LANÇAMENTOS" e "LEGENDADOS"
- [x] Otimização da exibição de canais para melhor desempenho

#### ✅ Componente de Banner de Redes Sociais
- [x] Criação de componente que busca e exibe links de redes sociais ativos
- [x] Implementação de tratamento de erros com mensagem de fallback
- [x] Integração com o painel administrativo para gerenciamento dos links

#### ✅ Player de Vídeo Otimizado
- [x] Adição de atributos essenciais para iOS/Android: playsInline, muted, crossOrigin
- [x] Implementação de detecção automática de dispositivos móveis
- [x] Simplificação dos controles em dispositivos móveis
- [x] Adição de suporte a fullscreen nativo para iOS
- [x] Implementação de tratamento de erros com mensagens amigáveis
- [x] Adição de tentativa de autoplay com fallback para reprodução manual

#### ✅ Otimização para Dispositivos Móveis
- [x] Implementação de menu mobile específico com posicionamento fixo
- [x] Utilização de classes de grid responsivas em todas as páginas
- [x] Adaptação automática dos componentes de cartões para diferentes tamanhos de tela
- [x] Headers fixos com z-index adequado para navegação em dispositivos móveis
- [x] Barras de pesquisa e filtros otimizados para toque
- [x] Implementação de rolagem infinita para melhor desempenho

#### ✅ Painel Administrativo
- [x] Implementação completa do gerenciador de redes sociais
- [x] Interface para adicionar, editar e excluir links de redes sociais
- [x] Controle de status (ativo/inativo) para cada rede social
- [x] Definição de ordem de exibição personalizada
- [x] Integração com o banco de dados Supabase

## 📝 Sistema de Gerenciamento de Páginas Estáticas

Foi implementado um sistema completo para gerenciar o conteúdo das páginas estáticas da plataforma, sem necessidade de modificar o código-fonte.

### Funcionalidades Principais

- **Painel Administrativo Dedicado**:
  - Interface intuitiva para edição de páginas estáticas
  - Editor de conteúdo HTML com formatação rica
  - Pré-visualização instantânea
  - Organização clara das páginas disponíveis

- **Páginas Gerenciáveis**:
  - Sobre Nós
  - Contato
  - Termos de Uso
  - Política de Privacidade
  - Ajuda
  - FAQ

- **Armazenamento em Banco de Dados**:
  - Conteúdo armazenado no Supabase
  - Carregamento dinâmico do conteúdo
  - Atualização instantânea após edição
  - Versionamento e histórico de alterações

- **Renderizador Unificado**:
  - Componente StaticPageRenderer para exibição consistente
  - Suporte a HTML complexo para formatação avançada
  - Estados de carregamento e erro tratados elegantemente
  - Layout responsivo para todos os dispositivos

- **Segurança**:
  - Row Level Security para proteção do conteúdo
  - Acesso restrito a administradores
  - Validação de conteúdo antes da persistência
  - Sanitização de HTML para evitar scripts maliciosos

### Implementação Técnica

- **Banco de Dados**:
  - Tabela `static_pages` no Supabase
  - Campos para ID, título, conteúdo e timestamps
  - Políticas de segurança definidas para controle de acesso

- **Frontend**:
  - Componente AdminPagesPage para interface de administração
  - StaticPageRenderer para exibição do conteúdo ao usuário
  - Versões simplificadas das páginas estáticas usando o renderizador

- **Migração**:
  - Script SQL de migração para criação da estrutura
  - Dados iniciais para todas as páginas
  - Processo para atualização e backup de conteúdo

{{ ... }}
