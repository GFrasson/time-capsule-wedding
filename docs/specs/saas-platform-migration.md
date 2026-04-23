# Spec: Migração para Micro-SaaS de sites de casamento

## Status
Draft para revisão. Esta especificação não autoriza implementação ainda.

## Assumptions
1. A aplicação continuará sendo web, baseada em Next.js App Router, React, TypeScript, Prisma e PostgreSQL.
2. O produto alvo será um Micro-Saas multi-tenant onde cada cliente pode criar e administrar um ou mais casamentos.
3. A "cápsula do tempo" atual deixará de ser o produto inteiro e passará a ser um módulo dentro de um site de casamento.
4. O público principal pagante será o casal, assessor ou responsável pelo casamento. Convidados poderão interagir sem precisar criar conta, salvo quando uma funcionalidade exigir identificação.
5. O app ainda não está em produção, então renomeações, migrações estruturais e mudanças de rotas podem ser feitas com mais liberdade, desde que preservem os dados locais existentes.
6. Pagamentos, autenticação e envio de e-mails podem exigir novas dependências ou serviços externos, que devem ser escolhidos antes da implementação.
7. O mercado inicial parece ser Brasil/português, mas a arquitetura deve permitir internacionalização futura.

## Objective
Transformar o projeto de uma aplicação isolada de cápsula do tempo em uma plataforma Micro-Saas completa para criação, administração e publicação de sites de casamento.

O produto deve permitir que um cliente:
- crie uma conta;
- contrate ou teste um plano;
- crie um casamento;
- publique um site público do casamento;
- administre módulos como cápsula do tempo, galeria, RSVP, convidados, agenda, locais e presentes;
- compartilhe links ou QR codes com convidados;
- acompanhe uso, limites e pagamentos em uma área administrativa.

O sucesso da migração significa que a base do projeto passa a ter um domínio claro de Micro-Saas, com autenticação, isolamento por casamento, planos/entitlements, área administrativa e uma arquitetura preparada para novos módulos sem transformar a cápsula atual em gargalo de nomenclatura.

## Current State
Hoje o domínio principal é:
- `Capsule`: container de mensagens com título, descrição, capa e data de desbloqueio.
- `Message`: envio de convidado vinculado a uma cápsula.
- `MessageAsset`: mídia enviada em uma mensagem.
- rotas públicas em `/capsules/[capsuleId]`, `/capsules/[capsuleId]/upload` e `/capsules/[capsuleId]/share`.
- proteção opcional por token global via query/cookie para todas as rotas `/capsules/*`.

Limitações atuais para Micro-Saas:
- não existe `User`, `Account`, `Wedding`, `Membership`, `Plan`, `Subscription` ou `Tenant`;
- a página inicial lista cápsulas, em vez de funcionar como marketing ou entrada do produto;
- não há área administrativa para criação e edição de casamentos;
- não há autenticação nem autorização por papel;
- o token de acesso é global, não por casamento ou convite;
- não há limite de plano, quota de storage, billing, trial, checkout ou portal do cliente;
- o domínio "capsule" está ocupando o lugar que futuramente deve pertencer a "wedding";
- não há distinção clara entre módulos públicos, admin do cliente e operação interna da plataforma.

## Product Scope
### Micro-SaaS Core
O núcleo Micro-Saas deve incluir:
- autenticação de usuários;
- onboarding para criação do primeiro casamento;
- dashboard administrativo;
- multi-tenancy por casamento;
- papéis e permissões;
- planos, trial e assinatura/compra;
- entitlements por plano;
- controle de uso e quotas;
- área de billing;
- configurações de conta e equipe;
- trilha básica de auditoria para ações administrativas sensíveis.

### Wedding Site
Cada casamento deve poder ter um site público com:
- URL pública estável por slug, por exemplo `/w/[weddingSlug]`;
- tema visual configurável;
- nomes do casal;
- data, horário e local;
- seções públicas ativáveis por módulo;
- proteção opcional por senha, token de convite ou lista de convidados;
- status de publicação: draft, published, archived.

### Feature Modules
Módulos esperados no produto:
- cápsula do tempo;
- mural de mensagens;
- galeria de fotos e vídeos;
- RSVP;
- lista de convidados;
- agenda do evento;
- locais e mapas;
- lista de presentes ou links externos;
- página de história do casal;
- perguntas frequentes;
- QR codes e links de compartilhamento;
- analytics simples de visitas, uploads e confirmações.

O MVP da migração deve priorizar a estrutura Micro-Saas e manter a cápsula do tempo funcionando como primeiro módulo migrado.

## Personas
### Couple Owner
Usuário pagante principal. Pode contratar plano, criar casamento, configurar site, gerenciar módulos, convidar colaboradores e acessar billing.

### Wedding Collaborator
Usuário convidado pelo dono do casamento. Pode editar conteúdo conforme permissões, mas não deve conseguir alterar billing ou excluir o casamento sem autorização.

### Guest
Convidado do casamento. Acessa o site público, envia memórias, confirma presença e interage com módulos públicos. Não precisa ter conta por padrão.

### Platform Admin
Usuário interno da plataforma. Pode dar suporte, analisar uso, revisar conteúdo denunciado e administrar contas com cuidado auditável.

## Target Domain Model
### Primary Entities
`User`
Representa uma pessoa autenticada no Micro-Saas.

`Wedding`
Representa o tenant principal e o projeto administrável do cliente.

`WeddingMembership`
Liga usuários a casamentos com papel e permissões.

`WeddingSite`
Configuração pública do site do casamento, incluindo slug, publicação, tema e SEO.

`Plan`
Catálogo dos planos disponíveis.

`Subscription`
Estado comercial do cliente, plano atual, período, trial, cancelamento e provider externo.

`Entitlement`
Capacidade liberada por plano, como storage máximo, módulos disponíveis, limite de convidados, custom domain e número de administradores.

`UsageMetric`
Uso mensurável por casamento, como bytes armazenados, número de convidados, uploads e visualizações.

`Guest`
Convidado registrado no contexto de um casamento.

`Invite`
Convite, link, senha ou token de acesso por casamento ou por convidado.

### Feature Entities
`MemoryCapsule`
Renomeação alvo de `Capsule`. Representa o módulo de cápsula do tempo dentro de um casamento.

`Memory`
Renomeação alvo de `Message`. Representa uma contribuição de convidado.

`MemoryAsset`
Renomeação alvo de `MessageAsset`. Representa mídia vinculada a uma memória.

`RsvpResponse`
Confirmação de presença de um convidado.

`WeddingPage`
Página configurável do site público, caso o produto evolua para um builder.

`WeddingSection`
Seção ativável/configurável dentro de uma página pública.

## Naming Decisions
Renomeações recomendadas:
- `Capsule` -> `MemoryCapsule`
- `Message` -> `Memory`
- `MessageAsset` -> `MemoryAsset`
- `capsuleId` -> `memoryCapsuleId` em APIs internas do módulo
- `/capsules/[capsuleId]` -> `/w/[weddingSlug]/capsule/[capsuleSlug]` ou `/w/[weddingSlug]/time-capsule`
- `src/components/upload-form.tsx` -> componente dentro de `src/features/memories` quando a estrutura por feature for criada

Vocabulário de produto:
- "Wedding" é o tenant/projeto.
- "Wedding Site" é a presença pública configurável.
- "Memory Capsule" é um módulo do site.
- "Memory" é uma contribuição de convidado.
- "Admin" ou "Dashboard" é a área autenticada do cliente.

Evitar:
- usar "capsule" para representar casamento inteiro;
- colocar regras de billing dentro de componentes de UI;
- usar `User` para representar convidado anônimo;
- manter token global compartilhado entre todos os casamentos.

## Target Routes
### Marketing
`/`
Landing page pública do Micro-Saas.

`/pricing`
Planos e comparação.

`/login`
Entrada de usuários autenticados.

`/signup`
Criação de conta.

### Authenticated App
`/app`
Dashboard geral do usuário autenticado.

`/app/weddings`
Lista de casamentos do usuário.

`/app/weddings/new`
Onboarding de novo casamento.

`/app/weddings/[weddingId]`
Painel administrativo de um casamento.

`/app/weddings/[weddingId]/site`
Configuração do site público.

`/app/weddings/[weddingId]/capsule`
Administração do módulo de cápsula do tempo.

`/app/weddings/[weddingId]/guests`
Convidados e convites.

`/app/weddings/[weddingId]/rsvp`
Confirmações de presença.

`/app/weddings/[weddingId]/billing`
Plano, uso e cobrança quando o usuário tiver permissão.

`/app/settings`
Conta do usuário.

### Public Wedding Site
`/w/[weddingSlug]`
Home pública do casamento.

`/w/[weddingSlug]/time-capsule`
Linha do tempo da cápsula.

`/w/[weddingSlug]/time-capsule/upload`
Envio de memória por convidado.

`/w/[weddingSlug]/rsvp`
Confirmação de presença.

`/w/[weddingSlug]/gallery`
Galeria pública.

### Platform Admin
`/admin`
Área interna da plataforma, separada do dashboard do cliente e protegida por papel específico.

## Tech Stack
Base atual:
- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Vitest
- Backblaze B2 via provider compatível com S3
- Tailwind CSS e componentes de UI locais

Novas decisões necessárias:
- provedor de autenticação: Auth.js, Better Auth, Clerk, Supabase Auth, WorkOS ou solução própria;
- provedor de billing: Stripe, Clerk, Mercado Pago ou outro;
- provedor de e-mail transacional: Resend, Postmark, SES ou outro;
- e2e browser tests: Playwright ou alternativa;
- observabilidade: Sentry, Logtail, Axiom, OpenTelemetry ou logs estruturados do provider de hospedagem.

Recomendação inicial para MVP:
- manter PostgreSQL e Prisma;
- usar autenticação com sessões seguras via cookie;
- isolar autorização em helpers server-side;
- integrar billing por provider externo com webhooks;
- manter storage provider abstraction em `src/lib/storage`;
- adicionar e-mail transacional apenas quando houver convite, verificação de e-mail ou reset de senha.

## Commands
Comandos atuais:
- Dev: `npm run dev`
- Testes: `npm run test`
- Testes em watch: `npm run test:watch`
- Lint: `npm run lint`
- Build: `npm run build`
- Migração local: `npx prisma migrate dev --name <change>`
- Deploy de migração: `npx prisma migrate deploy`
- Prisma generate: `npx prisma generate`

Comandos esperados após evolução da suíte:
- E2E: `npm run test:e2e`
- Typecheck dedicado: `npm run typecheck`
- Verificação completa: `npm run verify`

Esses scripts futuros devem ser adicionados apenas quando as ferramentas correspondentes forem adotadas.

## Project Structure
Estrutura alvo recomendada:

```text
docs/
  specs/                  Especificações vivas
  adrs/                   Decisões arquiteturais relevantes
prisma/
  schema.prisma           Modelagem persistente
src/
  app/
    (marketing)/          Landing, pricing, signup/login públicos
    (app)/                Dashboard autenticado do cliente
    (wedding-site)/       Site público de cada casamento
    admin/                Operação interna da plataforma
    api/                  APIs quando route handlers forem necessários
  components/
    ui/                   Primitivos reutilizáveis sem regra de negócio
  features/
    auth/                 Fluxos e helpers de autenticação
    billing/              Planos, assinatura, webhooks e entitlements
    weddings/             Criação, edição e settings de casamento
    wedding-site/         Publicação, temas e páginas públicas
    memories/             Cápsula do tempo, memórias e assets
    guests/               Convidados, convites e RSVP
  lib/
    prisma.ts             Cliente Prisma
    storage/              Provider de arquivos
    security/             Rate limiting, tokens, hashing e helpers seguros
    tenancy/              Escopo por casamento e autorização
    validation/           Schemas compartilhados
  test/
    setup.ts              Setup global de testes
```

Regras de organização:
- componentes genéricos ficam em `src/components/ui`;
- componentes com regra de negócio ficam em `src/features/[feature]`;
- acesso a dados e autorização devem ficar próximos da feature ou em `src/lib/tenancy`;
- rotas públicas e autenticadas devem ser separadas por route groups;
- APIs públicas de convidado devem ser explicitamente marcadas e testadas como superfície não autenticada.

## Code Style
Seguir TypeScript, componentes funcionais, validação server-side e escopo explícito de tenant.

Exemplo de estilo alvo:

```ts
type WeddingRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'

export async function requireWeddingMembership(
  userId: string,
  weddingId: string,
  allowedRoles: WeddingRole[]
) {
  const membership = await prisma.weddingMembership.findUnique({
    where: {
      weddingId_userId: {
        weddingId,
        userId,
      },
    },
  })

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new Error('Unauthorized wedding access')
  }

  return membership
}
```

Convenções:
- nomes de entidades do domínio em inglês no código;
- texto da interface em português enquanto o produto for focado no Brasil;
- validação de entrada com schemas compartilhados quando fizer sentido;
- IDs internos podem continuar usando `cuid`;
- slugs públicos devem ser únicos, legíveis e não revelar IDs sequenciais;
- funções server-side que leem dados de tenant devem receber `weddingId` explicitamente;
- não misturar lógica de plano, billing ou autorização dentro de componentes visuais.

## Authentication And Authorization
### Authentication
Usuários administrativos devem autenticar com e-mail e senha, magic link ou provedor social, conforme decisão de produto.

Requisitos:
- sessões seguras por cookie;
- proteção de rotas `/app/*` e `/admin/*`;
- logout;
- recuperação de acesso;
- verificação de e-mail se houver envio transacional;
- suporte futuro a MFA para contas sensíveis.

### Authorization
Autorização deve ser baseada em membership por casamento.

Papéis iniciais:
- `OWNER`: controle total, incluindo billing e exclusão;
- `ADMIN`: gerencia conteúdo, convidados e configurações, sem billing crítico por padrão;
- `EDITOR`: edita conteúdo e módulos permitidos;
- `VIEWER`: visualiza dashboard e relatórios;
- `PLATFORM_ADMIN`: papel interno fora do escopo de membership do casamento.

Requisitos:
- toda rota admin de casamento deve validar sessão e membership;
- toda query admin deve ser filtrada por `weddingId`;
- ações destrutivas devem exigir papel elevado;
- acesso de convidado deve usar invite, token, senha ou regra pública por casamento;
- `PLATFORM_ADMIN` deve ter logs/auditoria por ser acesso sensível.

## Multi-Tenancy
O tenant primário é `Wedding`.

Regras:
- todas as entidades de feature devem pertencer direta ou indiretamente a um `Wedding`;
- dados de um casamento nunca podem ser carregados apenas por ID de recurso filho sem validar o `weddingId`;
- rotas públicas devem resolver o `Wedding` por `slug` ou domínio customizado;
- rotas administrativas podem usar `weddingId`, desde que validem membership;
- tokens de acesso devem ser por casamento, por módulo ou por convidado, nunca globais;
- queries compartilhadas devem ter helpers para reduzir risco de vazamento entre tenants.

Estratégia de isolamento:
- MVP: isolamento por aplicação com Prisma e filtros obrigatórios por `weddingId`;
- futuro: avaliar Row Level Security no PostgreSQL se o risco, escala ou compliance exigirem.

## Billing And Plans
### Billing Model
Há uma decisão de produto importante: casamento é um evento com ciclo finito. O produto pode usar assinatura recorrente, pacote único por evento ou modelo híbrido.

Modelo recomendado para MVP:
- trial curto ou plano gratuito limitado;
- pacote pago por casamento com validade até uma data pós-evento;
- upgrades de plano para liberar storage, vídeos, convidados, custom domain e módulos avançados;
- renovação/arquivamento após o evento para manter memórias online.

### Plan Examples
`Free` ou `Trial`
Permite testar o editor e publicar com limites baixos.

`Essential`
Site público, cápsula do tempo básica, RSVP básico, limite moderado de convidados e storage.

`Premium`
Mais storage, vídeos, galeria, RSVP avançado, múltiplos administradores, temas premium e analytics.

`Pro` ou `Planner`
Voltado para assessorias, com múltiplos casamentos ativos, white label opcional e permissões avançadas.

### Entitlements
Entitlements devem ser checados por servidor.

Exemplos:
- `maxWeddings`;
- `maxGuests`;
- `maxAdmins`;
- `maxStorageBytes`;
- `maxVideoUploadBytes`;
- `enabledModules`;
- `customDomain`;
- `removeBranding`;
- `advancedAnalytics`;
- `prioritySupport`.

### Billing States
Estados necessários:
- trialing;
- active;
- past_due;
- canceled;
- expired;
- incomplete;
- refunded, se o provider suportar.

Regras:
- webhooks do provider devem ser idempotentes;
- o app não deve confiar apenas no retorno do checkout;
- features pagas devem consultar entitlements no servidor;
- upload deve bloquear ou degradar com mensagem clara quando exceder quota.

## Admin Experience
O dashboard autenticado deve cobrir:
- visão geral do casamento;
- checklist de configuração;
- preview do site público;
- edição de dados do casal e evento;
- configuração de tema;
- ativação/desativação de módulos;
- gestão da cápsula do tempo;
- moderação de memórias enviadas;
- convidados e convites;
- RSVP;
- QR codes;
- uso de storage e limites do plano;
- billing e upgrade;
- membros da equipe;
- configurações de privacidade e publicação.

Critérios de UX:
- onboarding deve levar o cliente ao primeiro site publicado rapidamente;
- cada módulo deve explicar se está público, privado ou em rascunho;
- ações que afetam convidados devem ter confirmação clara;
- limites de plano devem ser visíveis antes de bloquear o usuário.

## Public Guest Experience
Convidados devem conseguir:
- acessar o site pelo link/QR code;
- ver informações do casamento;
- enviar memórias na cápsula quando o módulo estiver ativo;
- confirmar presença quando RSVP estiver ativo;
- ver instruções, agenda, locais e links;
- interagir com o mínimo de fricção possível.

Requisitos:
- experiência mobile-first;
- upload resiliente e com feedback;
- mensagens de erro amigáveis;
- proteção contra spam;
- privacidade clara para conteúdos enviados.

## Security And Privacy
Requisitos mínimos:
- secrets apenas em `.env` e providers seguros;
- cookies `httpOnly`, `secure` em produção e `sameSite` apropriado;
- validação server-side em todas as entradas;
- rate limiting para login, uploads, RSVP e formulários públicos;
- CSRF protection quando aplicável;
- limites de tamanho e tipo de arquivo no cliente e servidor;
- quotas por plano antes de gerar signed URLs;
- paths de storage com prefixo por casamento ou tenant;
- sanitização de conteúdo textual exibido;
- política de remoção de conteúdo e exclusão de conta;
- consentimento e privacidade compatíveis com LGPD quando houver dados de convidados.

Conteúdo de mídia:
- manter upload direto por signed URL quando possível;
- gerar paths não adivinháveis;
- evitar URLs públicas permanentes se o casamento for privado;
- avaliar moderação manual ou automática para conteúdo ofensivo;
- registrar metadados suficientes para suporte sem armazenar dados sensíveis desnecessários.

## Data Migration Strategy
Como a aplicação ainda não foi para produção, a migração pode priorizar clareza.

Estratégia recomendada:
- criar um `Wedding` padrão para absorver dados existentes;
- vincular todas as `MemoryCapsule` existentes ao `Wedding` padrão;
- renomear entidades em etapas para reduzir risco;
- manter adapters temporários entre nomes antigos e novos durante a transição;
- criar redirects das rotas antigas para as novas rotas públicas;
- remover nomenclatura antiga somente quando testes e fluxos estiverem migrados.

Ordem conceitual sugerida:
- introduzir `Wedding` e membership sem alterar experiência pública;
- migrar `Capsule` para `MemoryCapsule` vinculada a `Wedding`;
- introduzir autenticação e dashboard mínimo;
- mover criação/edição de cápsulas para dashboard;
- trocar home atual por marketing ou entrada do produto;
- migrar rotas públicas para `/w/[weddingSlug]`;
- adicionar billing e entitlements;
- expandir módulos além da cápsula.

## API And Interface Boundaries
APIs administrativas:
- exigem sessão;
- exigem membership;
- validam role;
- validam plano quando a ação consome entitlement;
- retornam erros previsíveis e sem vazar dados de outros tenants.

APIs públicas de convidado:
- resolvem casamento por slug, domínio ou token;
- respeitam status de publicação;
- respeitam privacidade do módulo;
- aplicam rate limiting;
- não expõem IDs internos desnecessários;
- aceitam apenas campos necessários.

Uploads:
- `init upload` deve validar acesso ao casamento, módulo ativo e quota antes de assinar URL;
- `finalize upload` deve persistir assets apenas se o envio pertence ao wedding/módulo correto;
- storage path deve incluir escopo lógico, por exemplo `weddings/{weddingId}/memories/{memoryId}/...`;
- limites de plano devem ser aplicados antes e depois do upload, considerando concorrência.

## Testing Strategy
Continuar usando Vitest para unidade e integração leve.

Adicionar cobertura para:
- helpers de autorização e membership;
- validação de entitlements;
- resolução de wedding por slug/domínio;
- upload público com quota;
- rotas administrativas protegidas;
- webhooks de billing idempotentes;
- migração dos dados atuais para `Wedding` e `MemoryCapsule`;
- fluxos de RSVP e convidados quando forem implementados.

Quando houver browser testing:
- adicionar testes e2e para signup, onboarding, criação do casamento, publicação do site, upload de memória e upgrade de plano;
- validar navegação mobile em rotas públicas;
- validar que usuários sem membership não acessam casamentos alheios.

Barra mínima antes de merge:
- `npm run test`
- `npm run lint`
- `npm run build`
- verificação manual do fluxo público afetado quando envolver upload, RSVP, publicação ou billing.

## Boundaries
Always:
- manter isolamento explícito por `weddingId`;
- validar autenticação e autorização no servidor;
- tratar billing e entitlements como regras server-side;
- preservar a cápsula do tempo como módulo funcional durante a migração;
- documentar decisões de arquitetura relevantes;
- criar migrações Prisma revisáveis para mudanças de schema;
- manter experiência pública mobile-first.

Ask first:
- escolher provedor de autenticação;
- escolher provedor de pagamento;
- escolher modelo de cobrança recorrente ou pacote por evento;
- adicionar dependências grandes;
- alterar estratégia de deploy/hosting;
- adotar subdomínios ou domínios customizados;
- exigir conta para convidados;
- apagar dados legados em vez de migrar.

Never:
- usar um token global para todos os casamentos em produção;
- permitir query sem escopo de tenant em dados administrativos;
- confiar em dados do cliente para role, plano ou quota;
- expor secrets no frontend;
- implementar billing sem webhooks idempotentes;
- bloquear acesso do dono ao próprio conteúdo sem plano de recuperação;
- remover funcionalidade existente sem rota de migração ou redirect planejado.

## Success Criteria
### Product Success
1. Um usuário consegue criar conta, criar casamento e acessar dashboard.
2. Um casamento tem site público próprio, identificado por slug ou domínio.
3. A cápsula do tempo atual funciona como módulo dentro de um casamento.
4. O dashboard permite configurar pelo menos dados básicos do casamento e cápsula.
5. Convidados conseguem acessar e enviar memórias sem criar conta, se o casamento permitir.
6. O produto suporta pelo menos dois planos com limites diferentes aplicados no servidor.
7. O app registra e exibe uso relevante, como storage e número de convidados ou memórias.

### Technical Success
1. Todas as entidades de feature ficam direta ou indiretamente vinculadas a `Wedding`.
2. Rotas administrativas exigem sessão e membership.
3. Rotas públicas respeitam publicação, privacidade e acesso do casamento.
4. Não existe dependência de token global para proteger todos os casamentos.
5. O schema usa nomes consistentes com o domínio alvo.
6. Testes cobrem autorização, tenancy e entitlements críticos.
7. Build, lint e testes passam antes de qualquer implementação ser considerada pronta.

### Migration Success
1. Dados atuais podem ser migrados para um casamento padrão.
2. URLs antigas de cápsula têm redirect ou estratégia explícita de descontinuação.
3. A nomenclatura antiga é removida ou isolada em adapters temporários.
4. A página inicial deixa de depender da listagem global de cápsulas.
5. Novos módulos podem ser adicionados sem alterar o núcleo de autenticação, billing e tenancy.

## Non-Goals For First Migration
Não fazem parte do primeiro corte, salvo decisão explícita:
- marketplace de fornecedores;
- app mobile nativo;
- builder visual complexo no estilo CMS completo;
- white label avançado;
- múltiplos idiomas completos;
- automação de WhatsApp;
- moderação automática com IA;
- split de pagamentos para assessorias ou parceiros;
- Row Level Security no banco se o isolamento por aplicação for suficiente no MVP.

## Open Questions
1. O modelo comercial será assinatura mensal/anual, pacote único por casamento ou híbrido?
2. O mercado inicial será Brasil, internacional ou ambos?
3. O provider de pagamento preferido deve ser Stripe, Mercado Pago, Pagar.me ou outro?
4. A autenticação deve ser própria, Auth.js/Better Auth, Clerk, Supabase Auth ou outro provider gerenciado?
5. Cada conta poderá ter múltiplos casamentos ou isso será reservado para plano de assessoria?
6. O site público usará slug em rota, subdomínio, domínio customizado ou combinação dessas opções?
7. Convidados serão sempre anônimos/tokenizados ou alguns fluxos exigirão login?
8. A cápsula do tempo terá uma única instância por casamento ou múltiplas cápsulas por casamento?
9. Conteúdos enviados por convidados devem entrar publicados automaticamente ou passar por moderação?
10. Quais módulos entram no MVP além da cápsula: RSVP, convidados, agenda, presentes, galeria ou páginas customizadas?
11. Qual política de retenção deve existir após o casamento ou cancelamento do plano?
12. O produto precisa nascer com LGPD/termos/privacidade públicos antes do lançamento?

## Review Checklist
- [ ] As premissas estão corretas.
- [ ] O modelo de cobrança está decidido ou reduzido a duas opções.
- [ ] O provider de autenticação está escolhido.
- [ ] O provider de pagamento está escolhido.
- [ ] O tenant principal como `Wedding` está aprovado.
- [ ] As renomeações `Capsule` -> `MemoryCapsule`, `Message` -> `Memory` e `MessageAsset` -> `MemoryAsset` estão aprovadas.
- [ ] As rotas alvo estão aprovadas.
- [ ] O MVP inicial está limitado o suficiente para implementação incremental.
