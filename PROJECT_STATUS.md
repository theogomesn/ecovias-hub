# Status do protótipo

## Escopo concluído nesta etapa

- Aplicação React/Vite funcional em estrutura white-label
- Tenant inicial: Ecovias Imigrantes
- Home utilitária
- Assistente Ecovias determinístico, com entrada por texto e voz quando suportada pelo navegador
- Assistente de Viagem com cenários controlados
- Cenário normal baseado no snapshot sem lentidão
- Cenário de lentidão baseado no snapshot documentado do km 61 ao 63
- Cenários demonstrativos para comboio e mudança 7x3
- Restrição de veículos pesados baseada na existência desse dado no conjunto analisado
- Pedágios e pagamento automático demonstrativos
- Histórico financeiro demonstrativo
- Apoio 24h com abertura de chamado demonstrativa
- Serviços próximos com filtros
- Conta/veículo/tag demonstrativos
- Painel de controle separado da interface do usuário para conduzir a apresentação
- PWA básico com manifest e service worker
- Configuração de build para Vite
- Configuração pronta para deploy estático
- Documentação de arquitetura, fontes e roteiro de apresentação

## Fora do escopo desta etapa

- Layout final da concessão
- Componentização visual definitiva no Figma
- Integrações reais com APIs da EcoRodovias
- LLM/RAG real
- Pagamento real, cartão, tag ou Free Flow
- Geolocalização real e geofencing
- Sistemas reais de atendimento/guincho
- CarPlay e Android Auto
- Backend multi-tenant de produção
- App nativo para App Store e Google Play
- Publicação no GitHub e deploy no Netlify

## Validações realizadas

- Sintaxe de todos os arquivos JS/JSX validada via transpile do TypeScript
- Regras do assistente testadas por linha de comando para os principais intents
- Distinção entre informação documental e conteúdo demonstrativo revisada
- Cenário normal e cenário de lentidão separados de acordo com os dois snapshots analisados

## Observação sobre o build nesta sessão

O ambiente de execução não conseguiu alcançar o registry do npm por falha de DNS/rede (`EAI_AGAIN`), portanto `npm install` e `npm run build` não puderam ser executados aqui. O código foi validado sintaticamente e os módulos de lógica que não dependem de React foram executados com sucesso.

No ambiente local ou no Netlify, rode:

```bash
npm install
npm run build
```
