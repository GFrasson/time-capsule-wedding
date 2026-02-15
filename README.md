# Wedding Time Capsule 💍

Uma aplicação moderna e elegante para convidados compartilharem mensagens, fotos e vídeos em um casamento.

## 🚀 Funcionalidades

- **Upload de Mídia**: Suporte para mensagens de texto, fotos e vídeos via Cloudinary.
- **Linha do Tempo em Tempo Real**: Visualize as mensagens conforme elas são enviadas.
- **QR Code Gerado Automaticamente**: Facilite o acesso dos convidados à página de upload.
- **Design Mobile-First**: Interface limpa e responsiva, otimizada para celulares.
- **Armazenamento Seguro**: Metadados no PostgreSQL e arquivos no Cloudinary.

## 🛠️ Configuração

### Pré-requisitos
- Node.js 18+
- Banco de Dados PostgreSQL (Local ou Nuvem)
- Conta no Cloudinary (para upload de arquivos)

### Passos para Instalação

1. **Clone o repositório** e instale as dependências:
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente**:
   Renomeie o `.env` ou crie um novo com as seguintes chaves:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wedding_capsule?schema=public"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu_cloud_name"
   CLOUDINARY_API_KEY="sua_api_key"
   CLOUDINARY_API_SECRET="seu_api_secret"
   ```

3. **Configure o Banco de Dados**:
   ```bash
   npx prisma migrate dev --name init
   ```
   *Nota: Se você não tiver o Postgres rodando localmente, configure-o primeiro ou use um serviço como Supabase/Neon.*

4. **Inicie o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse a Aplicação**:
   - Linha do tempo: `http://localhost:3000`
   - Página de upload: `http://localhost:3000/upload`
   - QR Code para impressão: `http://localhost:3000/share`

## 📦 Estrutura do Projeto

- `src/app`: Rotas e páginas (Next.js App Router).
- `src/components`: Componentes de UI (baseados em Shadcn/ui).
- `src/lib`: Utilitários e configurações (Prisma, etc).
- `prisma`: Schema do banco de dados.

## 🎨 Personalização

O design utiliza Tailwind CSS e componentes do Shadcn UI. Você pode customizar as cores e fontes em `src/app/globals.css`.

---
Desenvolvido com ❤️ para celebrar o amor.
