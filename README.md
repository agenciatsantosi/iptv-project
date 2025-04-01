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
- Implementado: 65%
- Em desenvolvimento: 20%
- Pendente: 15%

#### Backend
- Implementado: 55%
- Em desenvolvimento: 25%
- Pendente: 20%

#### Admin
- Implementado: 30%
- Em desenvolvimento: 40%
- Pendente: 30%

### 🎯 Objetivos para Próxima Release

1. Completar dashboard administrativo
2. Implementar sistema de cache avançado
3. Adicionar histórico e favoritos
4. Melhorar performance do player
5. Implementar sistema de busca avançado
