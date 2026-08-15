# Fontes e limites dos dados

## Fontes utilizadas

### `briefing_ecovias_imigrantes.md`
Base conceitual do novo ecossistema digital. Suporta, entre outros pontos:

- uso do endpoint `/api/playful-map`
- condição de tráfego, rodovia, sentido e quilometragem
- operação de faixas
- comboio
- restrição de veículos pesados
- câmeras e clima
- bases operacionais, balanças, pátios de descanso e policiamento
- estabelecimentos e serviços
- IA como camada de interpretação, não como fonte da informação
- mínima interação visual durante a condução

### `analise-dados-mapa-ecovias.md`
Análise de dois snapshots do endpoint. Suporta:

- 16 alternativas no trajeto São Paulo → Santos
- referência de 42 a 72 minutos entre melhor e pior alternativa
- os tempos não variaram entre as coletas e não devem ser tratados como tempo real
- Anchieta, sentido São Paulo: km 9,7–61 normal; km 61–63 lento por excesso de veículos; km 63–65 normal
- operação 5x5 observada nos dois snapshots
- existência de estrutura para 7x3 e 8x2 como configurações operacionais possíveis
- bloco de comboio, inativo nos snapshots
- restrição para veículos pesados existente no conjunto de dados
- campos de guia de serviços majoritariamente vazios
- ausência de histórico e de coordenadas geográficas nas condições de tráfego

### Brand book EcoVias, janeiro de 2025
Usado somente como referência de naming e marca. O layout final do app não está sendo fechado nesta etapa.

## Dados simulados nesta versão

Os seguintes elementos existem apenas para demonstrar fluxo:

- coordenadas/localização exata do usuário
- base de apoio km 59 e distância até ela
- posto e alimentação com distâncias
- valores de pedágio e histórico financeiro
- tag/cartão cadastrados
- tempo estimado de chegada de equipe de apoio
- mudança da operação para 7x3 em cenário de comboio

Esses itens estão marcados como `source: prototype` no código.
