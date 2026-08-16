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
