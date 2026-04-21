# Wedding Time Capsule 💍

Uma aplicação moderna e elegante para convidados compartilharem mensagens, fotos e vídeos em um casamento.

## 🚀 Funcionalidades

- **Upload de Mídia**: Suporte para mensagens de texto, fotos e vídeos (via Cloudinary ou Backblaze B2).
- **Linha do Tempo em Tempo Real**: Visualize as mensagens conforme elas são enviadas.
- **QR Code Gerado Automaticamente**: Facilite o acesso dos convidados à página de upload.
- **Design Mobile-First**: Interface limpa e responsiva, otimizada para celulares.
- **Armazenamento Seguro**: Metadados no PostgreSQL e arquivos na nuvem escolhida.

## 🛠️ Configuração

### Pré-requisitos
- Node.js 18+
- Banco de Dados PostgreSQL (Local ou Nuvem)
- Conta no Cloudinary ou Backblaze B2 (para upload de arquivos)

### Passos para Instalação

1. **Clone o repositório** e instale as dependências:
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente**:
   Renomeie o `.env` ou crie um novo com as seguintes chaves:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wedding_capsule?schema=public"
   
   # Escolha o provedor de storage (cloudinary ou backblaze)
   STORAGE_PROVIDER="backblaze"
   
   # Se usar Cloudinary:
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu_cloud_name"
   CLOUDINARY_API_KEY="sua_api_key"
   CLOUDINARY_API_SECRET="seu_api_secret"
   
   # Se usar Backblaze B2:
   BACKBLAZE_BUCKET_NAME="seu_bucket_name"
   BACKBLAZE_ENDPOINT="https://s3.us-west-xxx.backblazeb2.com"
   BACKBLAZE_REGION="us-west-xxx"
   BACKBLAZE_KEY_ID="seu_key_id"
   BACKBLAZE_APPLICATION_KEY="sua_application_key"
   BACKBLAZE_PUBLIC_ENDPOINT="https://f000.backblazeb2.com/file/seu_bucket_name"

   # Proteção de acesso via QR Code (obrigatório para restringir acesso):
   CAPSULE_ACCESS_TOKEN="um-token-secreto-forte"
   NEXT_PUBLIC_CAPSULE_ACCESS_TOKEN="um-token-secreto-forte"
   ```

   Se você usar uploads client-side com URLs assinadas do Backblaze, também precisa configurar CORS no bucket para aceitar `PUT` e `OPTIONS` a partir das origens do app. Sem isso, o navegador vai bloquear o upload com erro de preflight.

   Exemplo de CORS para a API S3-Compatible do Backblaze:
   ```xml
   <CORSConfiguration>
     <CORSRule>
       <ID>allow-direct-uploads</ID>
       <AllowedOrigin>http://localhost:3000</AllowedOrigin>
       <AllowedOrigin>https://SEU-DOMINIO-VERCEL.vercel.app</AllowedOrigin>
       <AllowedMethod>PUT</AllowedMethod>
       <AllowedMethod>GET</AllowedMethod>
       <AllowedMethod>HEAD</AllowedMethod>
       <AllowedHeader>*</AllowedHeader>
       <ExposeHeader>ETag</ExposeHeader>
       <ExposeHeader>x-amz-request-id</ExposeHeader>
       <MaxAgeSeconds>3600</MaxAgeSeconds>
     </CORSRule>
   </CORSConfiguration>
   ```

   O ponto principal é que a origem precisa bater exatamente com o frontend, por exemplo `http://localhost:3000` no desenvolvimento e o domínio real publicado em produção.

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
