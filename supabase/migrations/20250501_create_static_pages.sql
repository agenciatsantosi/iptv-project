-- Create static_pages table
CREATE TABLE IF NOT EXISTS public.static_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to all users"
    ON public.static_pages
    FOR SELECT
    USING (true);

-- Allow write access to authenticated users with admin role
CREATE POLICY "Allow write access to admin users"
    ON public.static_pages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.static_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial data
INSERT INTO public.static_pages (id, title, content) VALUES
('about', 'Sobre Nós', '<div class="bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-center md:text-left text-white mb-4">Redefinindo a Experiência de Streaming</h2>
  <p class="text-gray-300">
    Lançada em 2023, nossa plataforma nasceu da paixão por criar uma experiência de entretenimento verdadeiramente personalizada. Combinamos tecnologia avançada com curadoria de conteúdo excepcional para oferecer streaming de alta qualidade para todos os públicos.
  </p>
</div>

<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-white mb-6">Nossa Missão</h2>
  <p class="text-gray-300 mb-4">
    Nossa missão é democratizar o acesso ao entretenimento de qualidade, oferecendo uma plataforma intuitiva e acessível para todos. Acreditamos que o bom conteúdo deve estar disponível para qualquer pessoa, em qualquer lugar.
  </p>
</div>

<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-white mb-6">Nossa História</h2>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-white">O Início</h3>
      <p class="text-gray-300">
        Em 2023, um grupo de entusiastas de tecnologia e amantes de cinema se uniram com a visão de criar uma plataforma de streaming diferente de tudo que existia até então. Com um investimento inicial modesto, começamos a desenvolver o que se tornaria nossa plataforma.
      </p>
    </div>
    <div>
      <h3 class="text-lg font-semibold text-white">Expansão</h3>
      <p class="text-gray-300">
        Após um lançamento bem-sucedido, rapidamente expandimos nosso catálogo e recursos. Nosso foco em uma interface intuitiva e recomendações personalizadas nos diferenciou da concorrência. Em poucos meses, alcançamos mais de 100.000 usuários ativos.
      </p>
    </div>
    <div>
      <h3 class="text-lg font-semibold text-white">Hoje</h3>
      <p class="text-gray-300">
        Atualmente, somos uma referência em streaming de qualidade, com milhões de usuários em todo o mundo. Continuamos a inovar e melhorar nossa plataforma, mantendo sempre nossos valores originais: qualidade, acessibilidade e foco no usuário.
      </p>
    </div>
  </div>
</div>'),

('contact', 'Contato', '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <!-- Informações de Contato -->
  <div class="md:col-span-1">
    <div class="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm h-full">
      <h2 class="text-xl font-bold text-white mb-6">Informações de Contato</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-white">Email</h3>
          <p class="text-gray-300">contato@exemplo.com</p>
          <p class="text-gray-300">suporte@exemplo.com</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-white">Telefone</h3>
          <p class="text-gray-300">(11) 2345-6789</p>
          <p class="text-gray-300">(11) 98765-4321</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-white">Endereço</h3>
          <p class="text-gray-300">
            Av. Paulista, 1000 - Bela Vista
            <br>
            São Paulo - SP, 01310-100
            <br>
            Brasil
          </p>
        </div>
      </div>
      
      <div class="mt-8 pt-6 border-t border-zinc-700">
        <h3 class="text-lg font-semibold text-white mb-4">Horário de Atendimento</h3>
        <div class="space-y-2 text-gray-300">
          <div class="flex justify-between">
            <span>Segunda - Sexta:</span>
            <span>9h às 18h</span>
          </div>
          <div class="flex justify-between">
            <span>Sábado:</span>
            <span>10h às 14h</span>
          </div>
          <div class="flex justify-between">
            <span>Domingo:</span>
            <span>Fechado</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Formulário de Contato -->
  <div class="md:col-span-2">
    <div class="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h2 class="text-xl font-bold text-white mb-6">Envie sua Mensagem</h2>
      
      <form class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-300 mb-1">
              Nome Completo <span class="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              class="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-1">
              Email <span class="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              class="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="seu.email@exemplo.com"
            />
          </div>
        </div>
        
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-300 mb-1">
            Assunto
          </label>
          <select
            id="subject"
            name="subject"
            class="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Selecione um assunto</option>
            <option value="suporte">Suporte Técnico</option>
            <option value="conta">Informações sobre Conta</option>
            <option value="conteudo">Sugestão de Conteúdo</option>
            <option value="feedback">Feedback</option>
            <option value="outros">Outros</option>
          </select>
        </div>
        
        <div>
          <label for="message" class="block text-sm font-medium text-gray-300 mb-1">
            Mensagem <span class="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows="6"
            class="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Digite sua mensagem aqui..."
          ></textarea>
        </div>
        
        <div class="pt-2">
          <button
            type="submit"
            class="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition"
          >
            Enviar Mensagem
          </button>
        </div>
      </form>
    </div>
  </div>
</div>'),

('terms', 'Termos de Uso', '<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm">
  <div class="space-y-6 text-gray-300">
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">1. Aceitação dos Termos</h2>
      <p>
        Ao acessar ou usar nosso serviço de streaming ("Serviço"), você concorda em estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o Serviço.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">2. Alterações nos Termos</h2>
      <p>
        Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Notificaremos sobre mudanças materiais com pelo menos 30 dias de antecedência. O uso contínuo do Serviço após tais alterações constitui aceitação dos novos Termos.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">3. Contas</h2>
      <p>
        Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta. Reservamo-nos o direito de recusar o serviço, encerrar contas ou remover conteúdo a nosso critério.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">4. Assinaturas e Pagamentos</h2>
      <p>
        O acesso ao conteúdo requer uma assinatura paga. Os termos específicos de pagamento, renovação e cancelamento estão descritos durante o processo de inscrição. Reservamo-nos o direito de alterar os preços das assinaturas com aviso prévio.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">5. Uso Aceitável</h2>
      <p>
        Você concorda em usar o Serviço apenas para fins legais e de acordo com estes Termos. Você não deve:
      </p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Violar leis ou regulamentos aplicáveis</li>
        <li>Infringir direitos de propriedade intelectual</li>
        <li>Tentar obter acesso não autorizado ao Serviço</li>
        <li>Compartilhar sua conta ou senha com terceiros</li>
        <li>Usar o Serviço para distribuir malware ou realizar ataques</li>
        <li>Reproduzir, duplicar, copiar ou revender qualquer parte do Serviço</li>
      </ul>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">6. Conteúdo e Direitos Autorais</h2>
      <p>
        Todo o conteúdo disponível através do Serviço, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e software, é propriedade da nossa empresa ou de nossos licenciadores e está protegido por leis de direitos autorais.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">7. Limitação de Responsabilidade</h2>
      <p>
        Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, receitas, dados, uso, boa vontade ou outras perdas intangíveis.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">8. Isenção de Garantias</h2>
      <p>
        O Serviço é fornecido "como está" e "conforme disponível", sem qualquer garantia de qualquer tipo, expressa ou implícita. Não garantimos que o Serviço será ininterrupto, oportuno, seguro ou livre de erros.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">9. Lei Aplicável</h2>
      <p>
        Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem consideração a conflitos de disposições legais.
      </p>
    </section>
    
    <section class="space-y-3">
      <h2 class="text-xl font-bold text-white">10. Contato</h2>
      <p>
        Perguntas sobre os Termos de Uso devem ser enviadas para termos@exemplo.com.
      </p>
    </section>
  </div>
</div>'),

('privacy', 'Política de Privacidade', '<div class="space-y-6 text-gray-300">
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">1. Introdução</h2>
    <p>
      Esta Política de Privacidade descreve como coletamos, usamos, processamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de streaming. Ao usar nosso serviço, você concorda com a coleta e uso de informações de acordo com esta política.
    </p>
  </section>
  
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">2. Informações que Coletamos</h2>
    <p>
      Coletamos diferentes tipos de informações para fornecer e melhorar nosso serviço:
    </p>
    <h3 class="text-lg font-semibold text-white/90 mt-4">2.1. Informações Pessoais</h3>
    <p>
      Para criar uma conta e utilizar nosso serviço, podemos coletar:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Nome completo</li>
      <li>Endereço de e-mail</li>
      <li>Informações de pagamento</li>
      <li>Endereço</li>
      <li>Número de telefone</li>
    </ul>
    
    <h3 class="text-lg font-semibold text-white/90 mt-4">2.2. Dados de Uso</h3>
    <p>
      Coletamos informações sobre como você interage com nosso serviço:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Histórico de visualização</li>
      <li>Conteúdo assistido e duração</li>
      <li>Preferências e favoritos</li>
      <li>Avaliações e feedback</li>
      <li>Interações com a interface</li>
    </ul>
    
    <h3 class="text-lg font-semibold text-white/90 mt-4">2.3. Informações do Dispositivo</h3>
    <p>
      Coletamos informações sobre os dispositivos que você usa para acessar nosso serviço:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Tipo de dispositivo</li>
      <li>Sistema operacional</li>
      <li>Navegador web</li>
      <li>Endereço IP</li>
      <li>Identificadores únicos de dispositivo</li>
      <li>Informações de conexão de rede</li>
    </ul>
  </section>
  
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">3. Como Usamos Suas Informações</h2>
    <p>
      Utilizamos as informações coletadas para:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Fornecer, manter e melhorar nosso serviço</li>
      <li>Processar pagamentos e gerenciar assinaturas</li>
      <li>Personalizar sua experiência e recomendações de conteúdo</li>
      <li>Comunicar-nos com você sobre atualizações, novos conteúdos e promoções</li>
      <li>Detectar, prevenir e solucionar problemas técnicos e de segurança</li>
      <li>Cumprir obrigações legais</li>
      <li>Analisar padrões de uso para melhorar o serviço</li>
    </ul>
  </section>
  
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">4. Compartilhamento de Informações</h2>
    <p>
      Não vendemos seus dados pessoais a terceiros. Podemos compartilhar suas informações nas seguintes circunstâncias:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Com provedores de serviços que trabalham em nosso nome para facilitar o serviço</li>
      <li>Com parceiros de análise para melhorar nosso serviço</li>
      <li>Para cumprir obrigações legais, como responder a intimações ou ordens judiciais</li>
      <li>Em caso de fusão, venda ou aquisição de todos ou parte de nossos ativos</li>
      <li>Com seu consentimento ou mediante sua solicitação</li>
    </ul>
  </section>
  
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">5. Segurança dos Dados</h2>
    <p>
      Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Criptografia de dados em trânsito e em repouso</li>
      <li>Controles de acesso rigorosos</li>
      <li>Monitoramento contínuo de segurança</li>
      <li>Backups regulares</li>
      <li>Revisões periódicas de segurança e testes de penetração</li>
    </ul>
  </section>
  
  <section class="space-y-3">
    <h2 class="text-xl font-bold text-white">6. Seus Direitos de Privacidade</h2>
    <p>
      Dependendo da sua localização, você pode ter direitos específicos relacionados aos seus dados pessoais:
    </p>
    <ul class="list-disc list-inside space-y-1 ml-4">
      <li>Direito de acesso às suas informações pessoais</li>
      <li>Direito de retificação de dados imprecisos</li>
      <li>Direito de exclusão (ou "direito ao esquecimento")</li>
      <li>Direito de restringir o processamento</li>
      <li>Direito à portabilidade de dados</li>
      <li>Direito de oposição ao processamento</li>
    </ul>
    <p>
      Para exercer esses direitos, entre em contato conosco através dos detalhes fornecidos no final desta política.
    </p>
  </section>
</div>'),

('help', 'Ajuda', '<div class="max-w-4xl mx-auto">
  <!-- Categorias -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <div class="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-xl font-bold text-white mb-4">Streaming</h3>
      <ul class="space-y-2 text-gray-300">
        <li class="hover:text-white transition">
          <a href="#quality">Problemas de qualidade</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#buffering">Buffering e carregamento</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#formats">Formatos suportados</a>
        </li>
      </ul>
    </div>

    <div class="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-xl font-bold text-white mb-4">Configurações</h3>
      <ul class="space-y-2 text-gray-300">
        <li class="hover:text-white transition">
          <a href="#account">Gerenciamento de conta</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#subscription">Assinaturas e planos</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#preferences">Preferências de usuário</a>
        </li>
      </ul>
    </div>

    <div class="bg-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-xl font-bold text-white mb-4">Conteúdo</h3>
      <ul class="space-y-2 text-gray-300">
        <li class="hover:text-white transition">
          <a href="#availability">Disponibilidade por região</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#schedule">Programação de lançamentos</a>
        </li>
        <li class="hover:text-white transition">
          <a href="#suggestions">Sugestões de conteúdo</a>
        </li>
      </ul>
    </div>
  </div>

  <!-- Tópicos populares -->
  <div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
    <h2 class="text-2xl font-bold text-white mb-6">Tópicos Populares</h2>
    <div class="space-y-6">
      <div id="quality">
        <h3 class="text-lg font-semibold text-white mb-2">Como melhorar a qualidade de streaming?</h3>
        <p class="text-gray-300 mb-2">
          Para obter a melhor qualidade de streaming, recomendamos uma conexão de internet estável com pelo menos 5 Mbps para conteúdo HD e 25 Mbps para conteúdo 4K. Você também pode ajustar manualmente a qualidade nos controles do player de vídeo.
        </p>
      </div>

      <div id="subscription">
        <h3 class="text-lg font-semibold text-white mb-2">Como gerenciar minha assinatura?</h3>
        <p class="text-gray-300 mb-2">
          Você pode gerenciar sua assinatura a qualquer momento através das configurações da sua conta. Lá você pode alterar seu plano, método de pagamento ou cancelar a assinatura.
        </p>
      </div>

      <div id="devices">
        <h3 class="text-lg font-semibold text-white mb-2">O serviço não funciona em meu dispositivo</h3>
        <p class="text-gray-300 mb-2">
          Nossa plataforma é compatível com a maioria dos navegadores modernos, smart TVs, smartphones e tablets. Verifique se seu dispositivo está atualizado e se você está usando um navegador ou aplicativo compatível.
        </p>
      </div>
    </div>
  </div>
</div>'),

('faq', 'Perguntas Frequentes', '<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-white mb-6">Conta e Assinatura</h2>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Como criar uma conta?</h3>
      <p class="text-gray-300">
        Para criar uma conta, clique no botão "Entrar" no canto superior direito da página e selecione "Criar conta". Preencha o formulário com seu email, nome e senha. Você receberá um email de confirmação para ativar sua conta.
      </p>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Quais são os planos de assinatura disponíveis?</h3>
      <p class="text-gray-300">
        Oferecemos três planos principais:<br><br>
        <strong>Básico:</strong> Acesso a conteúdo em resolução SD, em 1 dispositivo.<br>
        <strong>Padrão:</strong> Acesso a conteúdo em HD, em até 2 dispositivos simultâneos.<br>
        <strong>Premium:</strong> Acesso a conteúdo em 4K, em até 4 dispositivos simultâneos.
      </p>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Como posso cancelar minha assinatura?</h3>
      <p class="text-gray-300">
        Para cancelar sua assinatura, acesse "Minha Conta" > "Configurações" > "Gerenciar Assinatura" e selecione "Cancelar Assinatura". Você continuará tendo acesso aos serviços até o final do período de cobrança atual.
      </p>
    </div>
  </div>
</div>

<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-white mb-6">Streaming e Reprodução</h2>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Por que o vídeo está com baixa qualidade ou travando?</h3>
      <p class="text-gray-300">
        A qualidade do streaming depende principalmente da sua conexão com a internet. Recomendamos uma velocidade mínima de 5 Mbps para conteúdo HD e 25 Mbps para conteúdo 4K. Verifique sua conexão ou tente reduzir a qualidade do vídeo nas configurações do player.
      </p>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Quais dispositivos são compatíveis com o serviço?</h3>
      <p class="text-gray-300">
        Nossa plataforma é compatível com praticamente todos os dispositivos modernos, incluindo:<br><br>
        - Navegadores web (Chrome, Firefox, Safari, Edge)<br>
        - Smartphones e tablets (iOS e Android)<br>
        - Smart TVs (Samsung, LG, Sony, etc.)<br>
        - Dispositivos de streaming (Roku, Apple TV, Chromecast, Fire TV)<br>
        - Consoles de games (PlayStation, Xbox)
      </p>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Posso assistir ao conteúdo offline?</h3>
      <p class="text-gray-300">
        Sim, você pode baixar conteúdo para assistir offline nos aplicativos móveis para iOS e Android. Basta procurar o ícone de download ao lado do título que deseja salvar. Os downloads ficam disponíveis por 30 dias.
      </p>
    </div>
  </div>
</div>

<div class="bg-zinc-800/50 rounded-xl p-8 backdrop-blur-sm mb-8">
  <h2 class="text-2xl font-bold text-white mb-6">Conteúdo e Programação</h2>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Com que frequência novos conteúdos são adicionados?</h3>
      <p class="text-gray-300">
        Adicionamos novos filmes, séries e programas semanalmente. Lançamentos exclusivos geralmente são adicionados mensalmente. Você pode verificar a seção "Recém-adicionados" na página inicial para ver as novidades.
      </p>
    </div>
    
    <div>
      <h3 class="text-lg font-semibold text-white mb-2">Por que alguns conteúdos não estão disponíveis na minha região?</h3>
      <p class="text-gray-300">
        Os direitos de distribuição variam por região devido a acordos de licenciamento. Trabalhamos constantemente para expandir nosso catálogo em todas as regiões, mas algumas restrições geográficas podem se aplicar a certos títulos.
      </p>
    </div>
  </div>
</div>

<div class="bg-gradient-to-br from-purple-900/50 to-red-900/50 rounded-xl p-6 backdrop-blur-sm mt-10">
  <h2 class="text-xl font-bold text-white mb-3">Ainda tem dúvidas?</h2>
  <p class="text-gray-300 mb-4">
    Se não encontrou a resposta que procurava, nossa equipe de suporte está pronta para ajudar.
  </p>
  <a href="/contact" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition">
    Entrar em contato
  </a>
</div>'); 