# Handoff · Ecovias Hub

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar antes de publicar

```bash
npm run test:logic
npm run build
```

## Roteiro de QA rápido

1. Abrir a Home no mobile e confirmar que o painel de demo está recolhido.
2. Testar os cinco chips de perguntas rápidas e confirmar que a resposta aparece na própria Home.
3. Testar o microfone e a ação "Ouvir resposta" em navegador compatível.
4. Confirmar o card do Assistente de Viagem no estado Ativo.
5. No painel de demo, desativar o assistente e confirmar o card Inativo.
6. Clicar em "Ativar assistente", revisar a tela de permissões e confirmar as três chaves.
7. Abrir o Modo Viagem e validar a ordem:
   - Condição de trânsito
   - Operação de faixas / Previsão de viagem / Pista
   - Condição por trecho
   - Próximos eventos na sua rota
8. Trocar entre os cenários Normal, Lentidão e Congestionamento e validar verde, laranja e vermelho.
9. Testar "Ouvir condição" e "Ouvir alerta".
10. Abrir Alertas e conferir redundância contextual com o Modo Viagem.
11. Simular pedágio e validar toast, confirmação na tela de Pedágios e atualização do histórico.
12. Em Apoio 24h, solicitar atendimento e acompanhar os três estados automáticos.
13. Testar Serviços e Conta.
14. Conferir instalação PWA e ícone do app em navegador compatível.

## Observação de produto

O Figma continua sendo tratado como wireframe funcional. A camada visual final será aplicada futuramente por tenant/concessão sem alterar o core funcional.


## Assets por concessão

Os assets visuais ficam dentro do tenant. Para a Ecovias Imigrantes, a logo está em `src/tenants/ecorodovias/images/ecovias-imigrantes/logo-horizontal.svg`. Novas concessões devem ganhar uma subpasta própria dentro de `images`, e o `config.js` do tenant escolhe qual asset o core renderiza.

A síntese de voz usa a API nativa do navegador e prioriza vozes `pt-BR` com nomes femininos conhecidos quando disponíveis. Como o conjunto de vozes depende do sistema operacional e do navegador, existe fallback automático para outra voz brasileira.

- Home refinada: sem status bar fictícia, maior respiro do agente IA e chips de sugestões posicionados após o campo de pergunta.
