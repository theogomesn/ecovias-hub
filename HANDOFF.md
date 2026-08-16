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
2. Digitar "Onde tem banheiro mais próximo?" direto na Home e confirmar a resposta sem trocar de tela.
3. Clicar em Assistente de viagem. Se a demo estiver em "Antes da viagem", o cenário deve mudar para São Paulo → Litoral e abrir a tela de viagem ativa.
4. Abrir Alertas e confirmar que os alertas refletem o cenário selecionado.
5. No painel de demo, selecionar o cenário com lentidão e validar km 61 a 63.
6. Simular pedágio e validar toast, confirmação na tela de Pedágios e atualização do histórico.
7. Em Apoio 24h, solicitar atendimento e acompanhar os três estados automáticos.
8. Testar Serviços e Conta.
9. Conferir instalação PWA e ícone do app em um navegador compatível.

## Observação de produto

O Figma continua sendo tratado como wireframe funcional. A camada visual final será aplicada futuramente por tenant/concessão sem alterar o core funcional.
