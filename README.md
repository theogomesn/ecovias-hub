# Sirius Mobility Platform · Ecovias Demo

Protótipo funcional em React da **Sirius Mobility Platform**, usando a Ecovias Imigrantes como primeira implementação white-label.

A proposta é validar uma plataforma digital para concessionárias rodoviárias que combine assistência por IA, contexto de viagem, informações operacionais, serviços, apoio e pagamentos em uma experiência única e reaproveitável para diferentes operadores.

**Demo publicada:** https://ecovias.netlify.app

## Status atual · V10

Esta versão demonstra:

- **Assistente Ecovias como interface principal do app**, com entrada por texto e voz.
- Perguntas rápidas para banheiro, posto, condição da pista, pedágio e apoio.
- Respostas determinísticas e contextualizadas com ações relacionadas ao contexto.
- **Agente visual animado**, com GIF próprio da Ecovias e halo verde reativo aos estados de voz.
- Estados visuais do agente: `idle`, `listening`, `speaking`, `processing` e `responding`.
- **Assistente de Viagem** com estados Ativo e Inativo.
- Fluxo de permissões para localização, notificações e ativação automática nas concessões.
- **Modo Viagem / Rodovia ativa** com:
  - condição de trânsito por código de cor;
  - operação de faixas;
  - previsão de viagem;
  - condição da pista;
  - condição por trecho;
  - próximos eventos na rota;
  - leitura de condições e alertas por voz.
- Cenários demonstráveis de tráfego normal, lentidão e congestionamento.
- **Alertas** como central separada, com redundância contextual em relação ao Modo Viagem.
- **Pedágios** com pagamento automático, confirmação e histórico simulados.
- **Apoio 24h** com abertura de atendimento e progressão de status.
- **Serviços próximos** como posto, banheiro, alimentação e apoio.
- **Minha Ecovias** com veículo, tag, forma de pagamento e preferências simulados.
- **Modo Apresentação** separado da experiência principal para controlar os cenários da demo.
- PWA preparada para instalação em navegadores compatíveis.
- Arquitetura preparada para múltiplos tenants e concessionárias.

## Arquitetura white-label

O app não é estruturado como um produto exclusivo da EcoRodovias. A implementação atual utiliza a Ecovias Imigrantes como tenant de demonstração, mantendo o core separado da identidade e dos dados da concessionária.

```text
src/
  components/            # componentes compartilhados de interface
  core/                  # lógica comum da plataforma
  demo/                  # cenários controlados para apresentação
  tenants/
    ecorodovias/
      config.js           # configuração do tenant
      data.js             # dados estruturados
      icons/              # ícones específicos da interface
      images/
        ecovias-imigrantes/
```

A evolução pode incluir, por exemplo:

```text
tenants/
  ecorodovias/
  epr/
  arteris/
```

sem duplicar as capacidades do core.

## Figma e camada visual

O Figma passa a ser a **fonte de referência visual para as telas que já receberam layout final**.

A tela principal **Assistente** já foi implementada com base no layout de 390 × 844 px, incluindo:

- header com perfil, marca da concessão e menu;
- agente de IA;
- campo de pergunta;
- microfone e envio;
- chips de sugestões;
- estados Ativo e Inativo do Assistente de Viagem;
- modal de resposta da IA;
- navegação inferior.

Referências utilizadas:

```text
313:2599 · Assistente ativo
308:51   · Assistente inativo
308:99   · Resposta da IA
316:3468 · Navegação inferior
```

As demais telas mantêm a interface funcional existente e podem receber progressivamente a nova camada visual à medida que os layouts forem atualizados no Figma.

## Navegação principal

A navegação inferior contém cinco áreas:

```text
Assistente
Alertas
Apoio
Serviços
Pedágio
```

**Minha Ecovias** é acessada pelo botão de perfil no header e mantém a navegação inferior visível para que o usuário consiga retornar às áreas principais do produto.

No mobile, apenas o conteúdo das telas rola. A navegação inferior permanece fora da área de scroll para evitar deslocamentos causados pela viewport dinâmica dos navegadores móveis.

## Assistente Ecovias

O Assistente funciona como camada de acesso às capacidades do produto.

Exemplos de perguntas:

```text
Onde tem banheiro mais próximo?
Qual posto mais próximo?
Como está a pista?
Quanto falta para o pedágio?
Preciso de ajuda
```

As respostas foram desenhadas para leitura rápida, com headline curta, contexto complementar e ação quando necessário.

Exemplos de ações contextuais:

- banheiro ou posto → Serviços;
- condição da pista → Modo Viagem;
- pedágio → Pedágios;
- pedido de ajuda → Apoio 24h.

`Preciso de ajuda` é tratado como fluxo de ação, e não apenas como resposta informativa.

## Voz e agente reativo

A experiência de voz utiliza APIs nativas do navegador quando disponíveis.

### Entrada de voz

O reconhecimento utiliza:

```text
SpeechRecognition
webkitSpeechRecognition
```

com idioma configurado para `pt-BR`.

### Agente visual

O GIF da esfera continua como núcleo visual. Um halo independente comunica o estado do Assistente:

```text
idle        → halo invisível
listening   → pulsação suave
speaking    → reação à fala
processing  → pulsação de processamento
responding  → pulsação durante a resposta falada
```

Em desktop, a **Web Audio API + AnalyserNode** pode medir a amplitude real do microfone e controlar escala, opacidade e glow do halo.

Em navegadores móveis, especialmente Chrome no Android, o app prioriza o `SpeechRecognition` para evitar que uma segunda captura via `getUserMedia` interrompa o reconhecimento. Nesses casos, o halo reage aos eventos nativos de início e fim da fala.

### Saída de voz

As respostas utilizam `speechSynthesis`.

O app prioriza vozes femininas `pt-BR` conhecidas quando disponíveis e utiliza outra voz brasileira como fallback. A voz exata depende do sistema operacional e do navegador.

## Dados e proveniência

O protótipo separa dois tipos de informação:

- `document`: informação suportada pelos documentos e materiais do projeto;
- `prototype`: informação criada para demonstrar fluxos que dependem de APIs, integrações ou cadastros ainda não conectados.

A interface do usuário não exibe rótulos técnicos de proveniência. Essas informações ficam disponíveis no Modo Apresentação para uso interno.

O Assistente **não cria condições operacionais da rodovia**. As respostas consultam o contexto estruturado disponível no protótipo.

## Contexto da demonstração

A jornada principal foi unificada no sentido **São Paulo → Litoral**, usando Ecovias Imigrantes / Anchieta como contexto de demonstração.

O Modo Apresentação permite alterar cenários e controlar estados como:

- situação do tráfego;
- Assistente de Viagem ativo ou inativo;
- pagamento automático;
- passagem por pedágio;
- estado do atendimento de apoio.

No mobile, o controle permanece recolhido por padrão e foi posicionado acima da navegação inferior para não interferir no header ou no botão de menu.

## Assets por concessão

Os assets de marca ficam isolados dentro do tenant.

Para a Ecovias Imigrantes:

```text
src/tenants/ecorodovias/images/ecovias-imigrantes/
  logo-horizontal.svg
  ai-agent.gif
```

Os ícones extraídos do layout ficam em:

```text
src/tenants/ecorodovias/icons/
```

A navegação inferior, microfone, envio, volume e fechamento utilizam SVGs locais para evitar dependência de URLs temporárias do Figma e duplicação de ícones.

## Rodar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível pelo servidor local do Vite.

## Testes e build

Teste da lógica do Assistente:

```bash
npm run test:logic
```

Build de produção:

```bash
npm run build
npm run preview
```

Antes de publicar uma nova versão, recomenda-se executar:

```bash
npm run test:logic
npm run build
```

## Deploy

O projeto utiliza Vite e inclui configuração para Netlify.

A demo atual está publicada em:

```text
https://ecovias.netlify.app
```

O fluxo de publicação utilizado é:

```text
Projeto React
→ GitHub
→ Netlify
```

## Stack

```text
React
Vite
JavaScript / JSX
CSS
Lucide React
Web Speech API
Web Audio API
PWA
```

## Limites atuais do protótipo

Esta versão ainda não representa uma integração de produção.

Ainda dependem de integrações reais, entre outros pontos:

- APIs operacionais das concessionárias;
- localização e geofencing de produção;
- autenticação;
- dados de tráfego em tempo real;
- meios de pagamento e tags;
- serviços de atendimento e CCO;
- push notifications;
- políticas de privacidade e consentimento;
- backend e persistência;
- eventual LLM/RAG para evolução da camada de IA.

O objetivo atual é demonstrar **produto, experiência, arquitetura e oportunidade comercial**, mantendo claramente separados os dados reais disponíveis e os cenários simulados.

## Próximas evoluções

Entre os próximos passos possíveis:

- aplicar o novo visual do Figma às demais telas;
- conectar APIs reais de operação;
- evoluir o Assistente para uma camada de IA com RAG sobre dados oficiais;
- implementar geofencing e ativação automática por concessão;
- integrar pagamentos e tags reais;
- evoluir notificações contextuais;
- aprofundar o Design System white-label;
- desenvolver a experiência específica para CarPlay e Android Auto;
- criar tenants adicionais para EPR, Arteris e outros operadores.

## Documentação complementar

Consulte:

```text
PROJECT_STATUS.md
HANDOFF.md
DEMO_SCRIPT.md
DATA_SOURCES.md
ARCHITECTURE.md
```

para status funcional, QA, roteiro de apresentação, fontes de dados e decisões de arquitetura.
