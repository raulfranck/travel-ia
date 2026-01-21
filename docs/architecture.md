# Arquitetura do TravelBot Pro

## Visão Geral

TravelBot Pro é um sistema de agente de viagens inteligente baseado em monorepo TypeScript, com backend NestJS e frontend Next.js.

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Cliente"
        WA[WhatsApp User]
        WEB[Web Dashboard]
    end

    subgraph "Frontend - Next.js"
        LP[Landing Page]
        DASH[Dashboard]
        WEBAPI[API Client]
    end

    subgraph "Backend - NestJS"
        API[API Gateway]
        
        subgraph "Modules"
            WH[WhatsApp Module]
            TR[Travel Module]
            US[User Module]
            AU[Auth Module]
            PAY[Payment Module]
            EXP[Expense Module]
            AN[Analytics Module]
        end
        
        subgraph "Services"
            AI[AI Service]
            OCR[OCR Service]
        end
    end

    subgraph "External Services"
        META[Meta WhatsApp Cloud API]
        OAI[OpenAI GPT-4o]
        GV[Google Vision]
        ST[Stripe]
        BK[Booking API]
        SK[Skyscanner API]
        MX[Mixpanel]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        RD[(Redis Cache)]
    end

    WA -->|Mensagens| TW
    TW -->|Webhook| WH
    WEB --> WEBAPI
    WEBAPI --> API
    
    WH --> US
    WH --> TR
    TR --> AI
    EXP --> OCR
    
    AI --> OAI
    AI --> RD
    OCR --> GV
    PAY --> ST
    TR --> BK
    TR --> SK
    AN --> MX
    
    US --> PG
    TR --> PG
    EXP --> PG
    
    API --> AU
    AU --> US

    style WA fill:#25D366
    style WEB fill:#61DAFB
    style API fill:#E0234E
    style PG fill:#336791
    style RD fill:#DC382D
    style OAI fill:#10A37F
```

## Fluxo de Dados Principal

### 1. Onboarding via WhatsApp
```mermaid
sequenceDiagram
    participant User
    participant WhatsApp
    participant Backend
    participant Database

    User->>WhatsApp: /start
    WhatsApp->>Backend: Webhook
    Backend->>Database: Verifica usuário
    alt Usuário novo
        Backend->>Database: Cria usuário (hash)
        Backend->>WhatsApp: Solicita consentimento
        User->>WhatsApp: "aceito"
        WhatsApp->>Backend: Webhook
        Backend->>Database: Atualiza consentimento
    end
    Backend->>WhatsApp: Mensagem de boas-vindas
    WhatsApp->>User: Exibe mensagem
```

### 2. Geração de Roteiro com IA
```mermaid
sequenceDiagram
    participant User
    participant WhatsApp
    participant Backend
    participant Redis
    participant OpenAI
    participant Database

    User->>WhatsApp: Descreve viagem
    WhatsApp->>Backend: Webhook com dados
    Backend->>Database: Cria Trip
    Backend->>Redis: Verifica cache
    alt Cache miss
        Backend->>OpenAI: Gera roteiro
        OpenAI->>Backend: Retorna itinerário
        Backend->>Redis: Salva em cache
    end
    Backend->>Database: Salva itinerário
    Backend->>WhatsApp: Envia roteiro
    WhatsApp->>User: Exibe roteiro
```

### 3. Processamento de Gastos via OCR
```mermaid
sequenceDiagram
    participant User
    participant WhatsApp
    participant Backend
    participant GoogleVision
    participant Database

    User->>WhatsApp: Envia foto de recibo
    WhatsApp->>Backend: Webhook com imagem
    Backend->>GoogleVision: Processa OCR
    GoogleVision->>Backend: Retorna texto
    Backend->>Backend: Extrai valor e data
    Backend->>Database: Cria Expense
    Backend->>WhatsApp: Confirma registro
    WhatsApp->>User: Exibe confirmação
```

## Estrutura de Pastas

```
travel-ia/
├── backend/              # Backend NestJS
│   ├── src/
│   │   ├── whatsapp/    # Módulo WhatsApp
│   │   ├── travel/      # Módulo Viagens
│   │   ├── user/        # Módulo Usuário
│   │   ├── auth/        # Módulo Autenticação
│   │   ├── payment/     # Módulo Pagamento
│   │   ├── expense/     # Módulo Despesas
│   │   ├── analytics/   # Módulo Analytics
│   │   └── config/      # Configurações
│   └── package.json
├── frontend/             # Frontend Next.js
│   ├── app/             # Pages (App Router)
│   ├── components/      # Componentes React
│   ├── lib/             # Utilitários e API
│   └── package.json
├── shared/              # Código compartilhado
│   ├── src/
│   │   ├── types/       # Tipos TypeScript
│   │   ├── constants/   # Constantes
│   │   └── utils/       # Utilitários
│   └── package.json
├── docs/                # Documentação
├── package.json         # Raiz (workspaces)
└── tsconfig.json        # Config TypeScript
```

## Tecnologias Principais

### Backend
- **NestJS**: Framework Node.js
- **TypeORM**: ORM para PostgreSQL
- **Meta WhatsApp Cloud API**: API oficial WhatsApp (1000 conversas grátis/mês)
- **OpenAI**: GPT-4o para IA
- **Google Vision**: OCR

- **Stripe**: Pagamentos
- **Redis**: Cache

### Frontend
- **Next.js 14**: Framework React
- **Tailwind CSS**: Estilização
- **Chart.js**: Gráficos
- **Axios**: Cliente HTTP

### Database
- **PostgreSQL**: Banco principal
- **Redis**: Cache e sessões

## Segurança

1. **Hash de números WhatsApp** (SHA-256)
2. **JWT** para autenticação dashboard
3. **Rate limiting** em todas as APIs
4. **HTTPS** obrigatório em produção
5. **Validação** de dados com class-validator
6. **Consentimento LGPD/GDPR** no onboarding

## Escalabilidade

- **Horizontal**: Auto-scaling AWS/Vercel
- **Cache**: Redis para reduzir custos IA
- **Rate Limiting**: 100 requests/minuto
- **Database**: Connection pooling
- **CDN**: Assets estáticos

## Monitoramento

- **Mixpanel**: Analytics e conversões
- **Logs**: Winston/Pino
- **Alertas**: Erros em tempo real
- **Performance**: <3s resposta média

