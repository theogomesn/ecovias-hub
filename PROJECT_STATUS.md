# Ecovias Hub · status funcional

Rodada de usabilidade do Assistente de Viagem concluída para a versão de apresentação.

## Ajustes implementados

- Assistente Ecovias permanece diretamente na Home.
- Chips de perguntas rápidas adicionados na Home:
  - Onde tem banheiro mais próximo?
  - Qual posto mais próximo?
  - Como está a pista?
  - Quanto falta para o pedágio?
  - Preciso de ajuda
- Respostas do Assistente podem ser ouvidas por voz usando Speech Synthesis quando suportado pelo navegador.
- Card do Assistente de Viagem passou a ter estados Ativo e Inativo com comunicação explicativa.
- Estado Inativo direciona para uma tela de permissões com Localização, Notificações e Ativação nas concessões.
- Modo Viagem reorganizado para leitura rápida durante a condução.
- Condição de trânsito ganhou status visual verde, laranja e vermelho.
- Operação de faixas, Previsão de viagem e Pista voltaram como indicadores compactos.
- Condição por trecho passou a ser uma lista visual com código de cor.
- Próximos eventos na rota foram ordenados por distância.
- Eventos e alertas possuem ação "Ouvir alerta".
- Cenário de congestionamento adicionado ao painel interno para demonstrar o estado vermelho.
- Alertas continuam como tela separada e também oferecem leitura por voz.
- Contexto de viagem permanece unificado em São Paulo → Litoral/Santos.
- Pedágio mantém confirmação, valor processado e atualização do histórico.
- Apoio mantém a progressão Solicitação recebida → Equipe acionada → Equipe a caminho.
- Painel de demo permanece recolhido por padrão no mobile.
- Figma continua sendo tratado apenas como wireframe funcional nesta etapa.

## Dados

Os dados documentais e os dados simulados continuam separados no código. A experiência principal não exibe rótulos técnicos de proveniência. O painel de apresentação mantém essas informações para uso interno.

## Validação

- Testes de lógica do assistente: OK.
- Parse de todos os módulos JS/JSX com TypeScript transpile: OK.
- `npm install` não pôde ser concluído neste ambiente por timeout de acesso ao registry. Rode localmente `npm install`, `npm run test:logic` e `npm run build` antes de publicar.


## Assets por concessão

Os assets visuais ficam dentro do tenant. Para a Ecovias Imigrantes, a logo está em `src/tenants/ecorodovias/images/ecovias-imigrantes/logo-horizontal.svg`. Novas concessões devem ganhar uma subpasta própria dentro de `images`, e o `config.js` do tenant escolhe qual asset o core renderiza.

A síntese de voz usa a API nativa do navegador e prioriza vozes `pt-BR` com nomes femininos conhecidos quando disponíveis. Como o conjunto de vozes depende do sistema operacional e do navegador, existe fallback automático para outra voz brasileira.

- Home refinada: sem status bar fictícia, maior respiro do agente IA e chips de sugestões posicionados após o campo de pergunta.

## Atualização visual V6 · Figma

- Tela principal renomeada conceitualmente para Assistente.
- Home ativa e inativa sincronizadas com os frames Figma 313:2599 e 308:51.
- Estado de resposta da IA sincronizado com o frame 308:99, usando modal com overlay, leitura por voz e fechamento.
- Navegação inferior alterada para Assistente, Alertas, Apoio, Serviços e Pedágio, seguindo o componente 316:3468.
- Conta passa a ser acessada pelo botão de perfil no header.
- Nova animação do agente aplicada a partir do GIF fornecido para Ecovias Imigrantes.
- Logo e animação ficam isoladas em `src/tenants/ecorodovias/images/ecovias-imigrantes/` para facilitar white-label.
- Fluxos funcionais existentes de viagem, pedágio, apoio, serviços e modo demo foram preservados.

### Observação sobre ícones do Figma
Os ícones exatos do layout são usados por URLs de exportação do Figma com fallback para `lucide-react`. As URLs do MCP são temporárias e devem ser localizadas antes de uma versão de produção de longo prazo. Para a demo imediata, o visual permanece fiel enquanto os assets estiverem válidos.

## V7 · Correções de interface do Assistente
- Corrigida duplicação visual de ícones causada por fallbacks renderizados junto aos assets do Figma.
- Navegação inferior agora usa SVGs locais extraídos dos componentes do Figma.
- Microfone, envio, volume e fechar usam assets SVG locais.
- Modal da IA passou a ter altura adaptável e botão fechar fora do card, sem posicionamento fixo.
- "Preciso de ajuda" agora é um fluxo de ação com CTA para Apoio 24h.
- Respostas de banheiro, posto, pista e pedágio foram encurtadas para leitura rápida.
- Adicionadas ações contextuais para Serviços, Pedágios e Modo Viagem.

## V8 · Agente reativo por voz

- O GIF do agente continua como núcleo visual.
- O halo externo fica invisível em repouso.
- Ao ativar o microfone, o halo entra no estado de escuta.
- Durante a fala, Web Audio API + AnalyserNode medem a amplitude real e controlam escala, opacidade e glow do halo.
- Após o fim da fala, o agente entra brevemente em estado de processamento.
- Durante `speechSynthesis`, o halo usa uma pulsação de resposta enquanto a voz pt-BR estiver ativa.
- O input muda temporariamente para `Estou ouvindo...` durante a captura de voz.
- Se o navegador não permitir análise de amplitude, o reconhecimento de fala continua funcionando e o estado de escuta permanece como fallback visual.
