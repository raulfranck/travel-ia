# 🌍 TravelBot Pro

> Seu assistente de viagens inteligente via WhatsApp, potencializado por IA

TravelBot Pro é um agente de viagens completo que combina WhatsApp, inteligência artificial e um dashboard web para ajudar usuários a planejar viagens incríveis, gerenciar gastos e obter roteiros personalizados.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Testes](#testes)
- [Contribuindo](#contribuindo)

## ✨ Características

### MVP Features
- ✅ **Onboarding via WhatsApp** com consentimento LGPD
- 🤖 **Roteiros personalizados com IA** (GPT-4)
- 💰 **Gestão de gastos** com OCR de recibos
- 📊 **Dashboard web** com gráficos e exportação
- 💳 **Sistema freemium** com Stripe
- 🔗 **Integrações** com Booking, Skyscanner
- 📈 **Analytics** com Mixpanel

### Próximas Features
- 🗺️ Mapas interativos (Google Maps)
- 🌐 Suporte multilíngue
- 🎯 Recomendações baseadas em ML
- 📱 App mobile nativo

## 🛠 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **PostgreSQL** - Banco de dados
- **Redis** - Cache
- **TypeORM** - ORM
- **Meta WhatsApp Cloud API** - WhatsApp oficial (1000 conversas grátis/mês)
- **OpenAI** - GPT-4o
- **Google Vision** - OCR
- **Stripe** - Pagamentos

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Linguagem
- **Tailwind CSS** - Estilização
- **Chart.js** - Gráficos
- **Axios** - HTTP Client

### DevOps
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Vercel** - Deploy frontend
- **AWS/Railway** - Deploy backend

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 7

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/travel-ia.git
cd travel-ia
```

### 2. Instale as dependências

```bash
npm install
```

Isso instalará as dependências de todos os workspaces (backend, frontend, shared).

Alternativamente, instale manualmente:

```bash
# Raiz
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Shared
cd ../shared && npm install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto usando o template `ENV_TEMPLATE.md`:

```bash
cp ENV_TEMPLATE.md .env
```

Edite o `.env` e preencha as chaves necessárias:

#### Backend Essencial
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=travelbot_pro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=seu_secret_super_seguro
```

#### Integrações (obtenha as chaves nos respectivos sites)
```env
# Meta WhatsApp Cloud API (Recomendado)
# Obtenha em: https://developers.facebook.com/apps/
# Guia: docs/WHATSAPP_META_SETUP.md
META_ACCESS_TOKEN=seu_access_token
META_PHONE_NUMBER_ID=seu_phone_number_id
META_WEBHOOK_VERIFY_TOKEN=seu_verify_token

# OpenAI
OPENAI_API_KEY=sk-sua_chave_openai

# Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe

# Google Cloud (para OCR)
GOOGLE_APPLICATION_CREDENTIALS=./caminho/para/credentials.json
```

### 2. Configurar Banco de Dados

```bash
# Crie o banco de dados
createdb travelbot_pro

# As tabelas serão criadas automaticamente quando você rodar o backend
# (TypeORM synchronize: true em desenvolvimento)
```

### 3. Configurar Redis

```bash
# Inicie o Redis
redis-server

# Ou com Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## 🚀 Executando o Projeto

### Desenvolvimento

#### Opção 1: Rodar tudo junto (recomendado)

```bash
npm run dev
```

Isso iniciará backend e frontend simultaneamente usando `concurrently`.

#### Opção 2: Rodar separadamente

**Terminal 1 - Backend:**
```bash
npm run start:backend:dev
# ou
cd backend && npm run start:dev
```

O backend estará disponível em `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# ou
cd frontend && npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Produção

```bash
# Build
npm run build:backend
npm run build:frontend

# Start
npm run start:backend
npm run start:frontend
```

## 📁 Estrutura do Projeto

```
travel-ia/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── whatsapp/       # Webhook e lógica WhatsApp
│   │   ├── travel/         # Viagens e roteiros IA
│   │   ├── user/           # Usuários e planos
│   │   ├── auth/           # Autenticação JWT
│   │   ├── payment/        # Stripe e assinaturas
│   │   ├── expense/        # Despesas e OCR
│   │   ├── analytics/      # Mixpanel tracking
│   │   ├── config/         # Configurações DB/Redis
│   │   ├── main.ts         # Entry point
│   │   └── app.module.ts   # Módulo raiz
│   └── package.json
│
├── frontend/               # Frontend Next.js
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── dashboard/     # Dashboard
│   │   ├── layout.tsx     # Layout global
│   │   └── globals.css    # Estilos globais
│   ├── components/        # Componentes React
│   ├── lib/
│   │   ├── api.ts         # Cliente API
│   │   └── utils.ts       # Utilitários
│   └── package.json
│
├── shared/                # Código compartilhado
│   ├── src/
│   │   ├── types/        # Tipos TypeScript
│   │   ├── constants/    # Constantes
│   │   └── utils/        # Validadores
│   └── package.json
│
├── docs/                 # Documentação
│   └── architecture.md   # Diagrama de arquitetura
│
├── .cursor/              # Regras do projeto
│   └── rules/
│
├── package.json          # Raiz (workspaces)
├── tsconfig.json         # Config TypeScript
├── .gitignore
├── ENV_TEMPLATE.md       # Template de variáveis
└── README.md            # Este arquivo
```

## 🔌 API Endpoints

### WhatsApp
- `POST /api/whatsapp/webhook` - Recebe mensagens do Meta Cloud API
- `GET /api/whatsapp/webhook` - Verifica webhook (hub.challenge)
- `GET /api/whatsapp/health` - Status do serviço e provider

### Viagens
- `GET /api/trips` - Lista viagens
- `POST /api/trips` - Cria viagem
- `GET /api/trips/:id` - Detalhes da viagem
- `PATCH /api/trips/:id` - Atualiza viagem
- `POST /api/trips/:id/generate-itinerary` - Gera roteiro com IA

### Despesas
- `GET /api/expenses` - Lista despesas
- `POST /api/expenses` - Cria despesa
- `POST /api/expenses/ocr` - Processa recibo com OCR

### Usuários
- `GET /api/users/:id` - Perfil do usuário
- `PATCH /api/users/:id` - Atualiza perfil
- `GET /api/users/:id/stats` - Estatísticas

### Autenticação
- `POST /api/auth/login` - Login (envia OTP)
- `POST /api/auth/verify-otp` - Verifica OTP

### Pagamentos
- `POST /api/payments/create-subscription` - Cria assinatura
- `POST /api/payments/webhook` - Webhook Stripe
- `POST /api/payments/cancel-subscription` - Cancela assinatura

## 🌐 Deploy

### Frontend (Vercel)

```bash
# No diretório frontend
vercel --prod
```

Configure as variáveis de ambiente no dashboard da Vercel:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

### Backend (Railway/Heroku/AWS)

```bash
# Build
cd backend && npm run build

# Configure variáveis de ambiente
# Inicie com
npm run start:prod
```

### Banco de Dados

Recomendamos:
- **PostgreSQL**: Supabase, Neon, ou RDS
- **Redis**: Upstash, Redis Cloud

## 🧪 Testes

```bash
# Backend
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage

# Frontend
cd frontend
npm run test
```

## 📊 Monitoramento

### Analytics
Configure Mixpanel para tracking de eventos:
- Criação de viagens
- Conversões de planos
- Uso de features

### Logs
- Backend usa NestJS Logger
- Configure Winston para produção

## 🔐 Segurança

- ✅ Hash SHA-256 de números WhatsApp
- ✅ JWT para autenticação
- ✅ Rate limiting (100 req/min)
- ✅ CORS configurado
- ✅ Helmet para headers seguros
- ✅ Validação de inputs com class-validator
- ✅ LGPD/GDPR compliance

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Convenções de Código

- TypeScript strict mode
- ESLint + Prettier
- Commits semânticos
- kebab-case para arquivos
- camelCase para variáveis
- PascalCase para classes

Veja `.cursor/rules/` para convenções completas.

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Autores

- Desenvolvido por [Seu Nome]

## 🆘 Suporte

Para dúvidas ou suporte:
- Email: contato@travelbot.com
- WhatsApp: +55 11 99999-9999

## 🗺️ Roadmap

### Fase 1 - MVP (Atual)
- [x] Estrutura do monorepo
- [x] Backend NestJS completo
- [x] Frontend Next.js básico
- [ ] Testes automatizados
- [ ] Deploy em produção

### Fase 2 - Expansão
- [ ] App mobile React Native
- [ ] Suporte multilíngue
- [ ] Integração com mais APIs
- [ ] Machine Learning para recomendações

### Fase 3 - Escala
- [ ] Expansão internacional
- [ ] Parcerias com agências
- [ ] API pública para desenvolvedores

---

**TravelBot Pro** - Planeje viagens incríveis com inteligência artificial 🚀✈️

