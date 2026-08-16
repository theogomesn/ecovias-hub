# Ecovias Hub · status funcional

Atualização de usabilidade concluída para a versão de apresentação.

## Ajustes implementados

- Assistente Ecovias incorporado diretamente à Home.
- Animação de agente/voz na Home usando o GIF de referência fornecido.
- Campo principal com texto, microfone e envio na mesma linha.
- Acesso rápido reduzido a Assistente de viagem, Alertas e Serviços.
- Tela única de Alertas adicionada.
- Pedágios e Apoio permanecem no menu inferior.
- Tipografia e textos auxiliares ampliados para melhorar legibilidade.
- Selo "AO VIVO" removido da tela de viagem e substituído por "EM VIAGEM".
- Linguagem de bastidor removida da experiência principal.
- Contexto de demonstração unificado em São Paulo → Litoral/Santos.
- Abrir modo viagem inicia automaticamente o cenário normal quando ainda não existe viagem ativa.
- Simulação de pedágio gera confirmação visual, valor e atualização do histórico.
- Apoio evolui automaticamente por Solicitação recebida, Equipe acionada e Equipe a caminho.
- Painel de demo inicia fechado em telas mobile e aberto em desktop.
- Manifest PWA completado com ícones 192 e 512 px e apple-touch-icon.

## Dados

Os dados documentais e os dados simulados continuam separados no código. A experiência principal não exibe rótulos técnicos de proveniência. O painel de apresentação mantém essas informações para uso interno.

## Validação

- Testes de lógica do assistente: OK.
- Validação de sintaxe dos módulos JavaScript: OK.
- `npm install` não pôde ser concluído neste ambiente por timeout de acesso ao registry. Rode localmente `npm install`, `npm run test:logic` e `npm run build` antes de publicar.
