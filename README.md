# Sirius Mobility Platform · Ecovias Demo

Protótipo funcional em React para apresentação interna à Sírius. O objetivo desta versão é validar produto, jornadas e arquitetura white-label antes da definição do layout final.

## O que esta versão demonstra

- Home utilitária
- Assistente Ecovias com respostas determinísticas e contextualizadas, por texto e voz quando suportado pelo navegador
- Assistente de Viagem / Rodovia ativa
- Operação de faixas e condições por trecho
- Cenários de lentidão, comboio e restrição para veículos pesados
- Pedágios com pagamento automático e histórico simulados
- Apoio 24h com abertura e acompanhamento de chamado simulado
- Serviços próximos
- Conta, veículo e tag simulados
- Modo apresentação separado da UI do usuário
- Estrutura preparada para múltiplos tenants/concessionárias

## Princípio do protótipo

O Figma atual é tratado como wireframe. A implementação desta etapa prioriza clareza funcional, arquitetura e fluxo demonstrável. A camada visual final será aplicada depois da publicação e da validação do app funcionando.

## Dados

O projeto distingue explicitamente:

- `document`: informação suportada pelos documentos do projeto
- `prototype`: informação criada apenas para demonstrar um fluxo que depende de API, cadastro ou integração ainda não fornecidos

A IA não inventa condições de rodovia. Ela consulta apenas o contexto estruturado do protótipo.

## Rodar localmente

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Publicação

A publicação não faz parte desta entrega. O projeto inclui `netlify.toml` apenas para facilitar o deploy quando você decidir subir o repositório.

## Estrutura

```text
src/
  core/                  # capacidades compartilhadas
  demo/                  # cenários de apresentação
  tenants/
    ecorodovias/         # configuração e dados do tenant
  components/            # componentes comuns
```

A evolução futura pode incluir `tenants/epr`, `tenants/arteris` etc. sem duplicar o core.

## Status e handoff

Consulte `PROJECT_STATUS.md` para o escopo concluído e `HANDOFF.md` para o checklist de teste e apresentação.


## Atualização de usabilidade

A Home agora incorpora o Assistente Ecovias diretamente, com entrada por texto/voz, Assistente de viagem, Alertas e Serviços como acessos rápidos. O contexto da demo foi unificado em São Paulo → Litoral. Pedágios e Apoio possuem estados demonstráveis e o PWA inclui ícones de instalação. Consulte `HANDOFF.md` e `DEMO_SCRIPT.md`.


## Atualização do Modo Viagem

A Home agora oferece chips de perguntas rápidas e o Assistente de Viagem possui estados Ativo/Inativo com fluxo de permissões. O Modo Viagem prioriza condição de trânsito por cor, operação de faixas, previsão de viagem, pista, condição por trecho e próximos eventos com leitura por voz.


## Assets por concessão

Os assets visuais ficam dentro do tenant. Para a Ecovias Imigrantes, a logo está em `src/tenants/ecorodovias/images/ecovias-imigrantes/logo-horizontal.svg`. Novas concessões devem ganhar uma subpasta própria dentro de `images`, e o `config.js` do tenant escolhe qual asset o core renderiza.

A síntese de voz usa a API nativa do navegador e prioriza vozes `pt-BR` com nomes femininos conhecidos quando disponíveis. Como o conjunto de vozes depende do sistema operacional e do navegador, existe fallback automático para outra voz brasileira.

- Home refinada: sem status bar fictícia, maior respiro do agente IA e chips de sugestões posicionados após o campo de pergunta.

## Visual V6

A tela Assistente foi atualizada para refletir o layout do Figma em 390 × 844 px, incluindo estados ativo/inativo, modal de resposta da IA, animação do agente, header e navegação inferior de cinco itens.

A lógica funcional anterior permanece ativa. As demais telas continuam usando o layout funcional anterior até receberem seus layouts finais no Figma, mas já utilizam a nova navegação global.
