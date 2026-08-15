# Handoff

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite.

## Testar build de produção

```bash
npm run build
npm run preview
```

## Fluxo recomendado para a apresentação

1. Comece em **Fora da concessão**.
2. Mude para **Viagem normal** e abra o Assistente de Viagem.
3. Mude para **Lentidão Anchieta** para mostrar o dado documental do km 61 ao 63.
4. Abra o Assistente e teste perguntas como:
   - Como está a pista?
   - Onde tem banheiro mais próximo?
   - Qual posto mais próximo?
   - Quanto falta para o pedágio?
   - Quanto gastei em pedágio?
   - Preciso de ajuda
5. Abra Pedágios e use **Simular pedágio** no painel de apresentação.
6. Abra Apoio, escolha uma ocorrência e solicite atendimento.
7. Feche mostrando a arquitetura white-label: o tenant Ecovias está separado do core.

## Antes de publicar

Confirme localmente:

- `npm install` conclui sem erro
- `npm run build` gera a pasta `dist`
- cenário normal não mostra lentidão
- cenário Lentidão Anchieta mostra km 61–63 por excesso de veículos
- perguntas do Assistente retornam respostas coerentes
- Simular pedágio adiciona registro ao histórico
- solicitação de apoio muda para estado de acompanhamento
- navegação inferior funciona em todas as telas

## Fase futura

Depois da validação com o board, o Figma pode evoluir de wireframe para um Design System visual configurável por tenant. A implementação atual foi propositalmente construída para aceitar essa camada depois, sem reescrever as jornadas.
