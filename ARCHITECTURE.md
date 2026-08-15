# Arquitetura conceitual

## Core compartilhado

- Assistant
- Journey
- Payments
- Support
- Services
- Account
- Demo / apresentação

## Tenant

Cada concessionária pode fornecer:

- naming
- identidade visual
- concessões e rodovias
- endpoints/APIs
- regras operacionais
- serviços
- integrações comerciais
- regras de pagamento
- textos e tom de voz

## Nesta versão

Somente `ecorodovias` está configurado.

O objetivo não é provar uma arquitetura backend multi-tenant de produção, mas demonstrar que o produto front-end e o modelo de dados não precisam nascer acoplados a uma única concessionária.
