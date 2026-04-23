# Spec: Multi-media upload por mensagem

## Assumptions
1. O app continua sendo web com Next.js App Router, React 19, Prisma e PostgreSQL.
2. O fluxo de signed URL atual será mantido por arquivo: o cliente chama `POST /api/capsules/[capsuleId]/upload/init` para cada arquivo selecionado e faz o `PUT` direto ao storage quando disponível.
3. Uma mensagem pode ter `1..10` imagens ou `1` vídeo. Misturar imagem e vídeo no mesmo envio não faz parte deste escopo.
4. O carrossel da listagem não precisa de lightbox nem thumbnails; setas e indicadores são suficientes, desde que apenas a mídia solicitada seja carregada.
5. Os dados legados de `Message.mediaUrl` devem ser migrados para a nova modelagem relacional sem uso de colunas JSON.

## Objective
Permitir que convidados enviem várias imagens em uma única mensagem da cápsula, mantendo o upload client-side por signed URL e suportando persistência relacional normalizada no banco.

O sucesso da feature significa:
- o formulário aceita até `10` imagens no mesmo envio;
- o formulário aceita `1` vídeo por envio;
- os uploads são disparados em paralelo;
- todos os arquivos ficam vinculados à mesma `Message`;
- a listagem da cápsula mostra um carrossel para mensagens com múltiplas imagens;
- o carrossel não baixa as 10 imagens no carregamento inicial da tela.

## Tech Stack
- Next.js 16 App Router
- React 19 + `react-hook-form` + `zod`
- Prisma 7 + PostgreSQL
- Storage providers via `src/lib/storage`
- Vitest para testes existentes de API e utilitários

## Commands
- Dev: `npm run dev`
- Testes: `npm run test`
- Teste focado de upload: `npm run test -- src/app/api/capsules/[capsuleId]/upload/route.test.ts`
- Lint: `npm run lint`
- Build: `npm run build`
- Migração local: `npx prisma migrate dev --name add-message-assets`

## Project Structure
- `src/components` → formulário de upload, cards e novo carrossel
- `src/app/api/capsules/[capsuleId]/upload/init` → signed URL por arquivo
- `src/app/api/capsules/[capsuleId]/upload` → persistência final da mensagem e assets
- `src/app/capsules/[capsuleId]/page.tsx` → query e montagem da listagem
- `src/lib` → validações de upload, transformação de URLs e helpers de mídia
- `prisma/schema.prisma` + `prisma/migrations` → nova modelagem relacional
- `docs/specs` → especificação viva desta feature

## Code Style
Seguir o estilo atual do projeto: TypeScript, componentes funcionais, aspas simples e mudanças pequenas por camada.

```tsx
type MessageAssetView = {
  id: string
  url: string
}

function MessageImageCarousel({ assets }: { assets: MessageAssetView[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return <Image src={assets[activeIndex].url} alt='' unoptimized />
}
```

Convenções desta feature:
- `Message.type` continua representando o tipo agregado da mensagem: `IMAGE` ou `VIDEO`
- cada asset persistido ganha ordem explícita (`sortOrder`) para preservar o carrossel
- validações compartilhadas ficam em `src/lib/upload-validation.ts`

## Testing Strategy
- Cobrir via Vitest a validação do payload final do upload com múltiplos arquivos.
- Atualizar testes da rota `upload` para provar:
  - rejeição de lotes vazios;
  - rejeição de mais de 10 imagens;
  - rejeição de mistura entre imagem e vídeo;
  - rejeição de mais de 1 vídeo;
  - persistência de múltiplos assets ligados à mesma mensagem;
  - preservação da ordem dos assets.
- Adicionar testes unitários para o helper de validação de múltiplos arquivos, se ele for extraído.
- Rodar `npm run lint` como barra mínima do repositório.
- Se o ambiente permitir, fazer verificação manual do fluxo `upload -> listagem` na cápsula.

## Boundaries
- Always: manter upload client-side por signed URL quando o provider suportar; preservar compatibilidade com mensagens já existentes; evitar JSON no schema; validar limites no cliente e no servidor.
- Ask first: adicionar nova dependência de carrossel; mudar o contrato público de `/api/media`; alterar sem necessidade a UX fora do formulário/listagem.
- Never: baixar todas as imagens do carrossel no carregamento inicial; misturar dados de mídia em uma coluna JSON; remover suporte a mensagens legadas sem migração.

## Success Criteria
1. O formulário aceita múltiplas imagens usando `input[type=file][multiple]`.
2. O cliente impede:
   - mais de 10 imagens;
   - mais de 1 vídeo;
   - imagem e vídeo no mesmo envio;
   - arquivos fora dos tipos/tamanho aceitos.
3. Quando houver múltiplos arquivos, o cliente solicita signed URLs e envia os uploads em paralelo.
4. O submit final cria uma única `Message` com vários registros filhos de mídia.
5. Mensagens antigas continuam aparecendo normalmente após a migração.
6. A tela da cápsula exibe:
   - imagem única sem regressão visual relevante;
   - vídeo único sem regressão visual relevante;
   - múltiplas imagens em carrossel.
7. O carrossel renderiza apenas a imagem ativa, de modo que URLs das demais imagens não sejam requisitadas até navegação explícita do usuário.

## Plan
1. Modelar a persistência relacional:
   - criar `MessageMedia` (ou nome equivalente) com `messageId`, `storagePath`, `sortOrder`, `createdAt`;
   - remover dependência de `Message.mediaUrl`;
2. Ajustar o contrato do backend:
   - manter `upload/init` por arquivo;
   - aceitar no `upload` final uma lista ordenada de assets já enviados;
   - validar regras de quantidade e tipo no servidor;
   - persistir `Message` e `MessageMedia[]` em uma única operação.
3. Ajustar o cliente:
   - trocar `file` por `files`;
   - mostrar resumo/previews das imagens selecionadas;
   - executar init + upload em paralelo;
   - enviar o payload consolidado da mensagem com os assets.
4. Ajustar leitura e renderização:
   - incluir `message.media` nas queries;
   - adaptar o shape de `Post`;
   - criar carrossel simples e lazy para múltiplas imagens.
5. Verificar:
   - testes de rota/validação;
   - lint;
   - checagem manual, se possível.

## Tasks
- [ ] Task: Introduzir modelagem relacional para assets da mensagem
  - Acceptance: Prisma suporta `Message` com vários assets sem JSON e com migração de dados antigos.
  - Verify: `npx prisma migrate dev --name add-message-assets`
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`

- [ ] Task: Cobrir o novo contrato de upload com testes
  - Acceptance: Há testes descrevendo limites, combinações inválidas e persistência de múltiplos assets.
  - Verify: `npm run test -- src/app/api/capsules/[capsuleId]/upload/route.test.ts`
  - Files: `src/app/api/capsules/[capsuleId]/upload/route.test.ts`, helpers relacionados

- [ ] Task: Implementar persistência e validação de múltiplas mídias no backend
  - Acceptance: A rota final cria uma única mensagem com assets ordenados e valida os limites do lote.
  - Verify: `npm run test -- src/app/api/capsules/[capsuleId]/upload/route.test.ts`
  - Files: `src/app/api/capsules/[capsuleId]/upload/route.ts`, `src/lib/upload-validation.ts`, `src/lib/media.ts`

- [ ] Task: Atualizar o formulário para seleção múltipla e upload paralelo
  - Acceptance: Usuário consegue enviar até 10 imagens ou 1 vídeo, com uploads paralelos por signed URL.
  - Verify: `npm run lint`
  - Files: `src/components/upload-form.tsx`, possivelmente novos helpers/componentes

- [ ] Task: Renderizar múltiplas imagens em carrossel lazy na listagem
  - Acceptance: Mensagens com múltiplas imagens exibem carrossel e apenas a imagem ativa é carregada.
  - Verify: `npm run lint` e validação manual no navegador
  - Files: `src/app/capsules/[capsuleId]/page.tsx`, `src/components/post-card.tsx`, `src/components/memory-card.tsx`, novo componente de carrossel

## Open Questions
- Nenhuma bloqueante neste momento. Vou seguir com o entendimento de que vídeo continua sendo item único por mensagem e de que mensagens com múltiplas imagens não precisam de thumbnails nem preload agressivo.
