# Environment Variables Template

Copie este conteúdo para um arquivo `.env` na raiz do projeto:

```env
# ===== BACKEND CONFIGURATION =====

# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=travelbot_pro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=7d

# ===== WHATSAPP (META CLOUD API) =====

# Meta WhatsApp Cloud API ⭐ Recomendado
# ✅ Funciona com números brasileiros
# ✅ 1000 conversas grátis/mês
# 📚 Guia: docs/WHATSAPP_META_SETUP.md

META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
META_WEBHOOK_VERIFY_TOKEN=my_secret_verify_token_123
META_APP_SECRET=your_app_secret_here

# ===== AI INTEGRATION =====

# OpenAI (GPT-4o para roteiros, gpt-4o-mini para classificação)
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Google Cloud (Vision API for OCR)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
GOOGLE_PROJECT_ID=your_google_project_id

# ===== TRAVEL APIS =====

# Booking.com API
BOOKING_API_KEY=your_booking_api_key
BOOKING_AFFILIATE_ID=your_affiliate_id

# Skyscanner API
SKYSCANNER_API_KEY=your_skyscanner_api_key

# ===== PAYMENT & MONETIZATION =====

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Freemium Limits
FREE_PLAN_TRIPS_LIMIT=1
BASIC_PLAN_TRIPS_LIMIT=10
PRO_PLAN_TRIPS_LIMIT=999

# Pricing (in cents)
BASIC_PLAN_PRICE=1900
PRO_PLAN_PRICE=4900

# ===== ANALYTICS =====

# Mixpanel
MIXPANEL_TOKEN=your_mixpanel_token

# ===== FRONTEND CONFIGURATION =====

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key

# ===== SECURITY =====

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_ALGORITHM=aes-256-cbc

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## 📝 Notas Importantes

### WhatsApp Meta Cloud API
- **Obrigatório** para funcionar no Brasil
- Obtenha as credenciais em: https://developers.facebook.com/apps/
- Siga o guia completo: `docs/WHATSAPP_META_SETUP.md`
- Guia rápido: `WHATSAPP_QUICKSTART.md`

### Variáveis Obrigatórias para MVP
```env
# Backend básico
DATABASE_PASSWORD=postgres
JWT_SECRET=change_this_in_production

# WhatsApp (obrigatório)
META_ACCESS_TOKEN=seu_token
META_PHONE_NUMBER_ID=seu_phone_id
META_WEBHOOK_VERIFY_TOKEN=seu_verify_token

# IA (obrigatório para roteiros)
OPENAI_API_KEY=sua_chave
```

### Variáveis Opcionais (para produção)
- Google Vision: OCR de comprovantes
- Booking/Skyscanner: Busca de hotéis e voos
- Stripe: Pagamentos e assinaturas
- Mixpanel: Analytics

## 🚀 Setup Rápido

```bash
# 1. Copie este template
cp ENV_TEMPLATE.md .env

# 2. Edite o .env
nano .env

# 3. Preencha as variáveis obrigatórias
# - DATABASE_PASSWORD
# - META_ACCESS_TOKEN
# - META_PHONE_NUMBER_ID  
# - META_WEBHOOK_VERIFY_TOKEN

# 4. Reinicie o backend
npm run dev
```

## 🔒 Segurança- ⚠️ **NUNCA** commite o arquivo `.env`
- ✅ Já está no `.gitignore`
- ✅ Use variáveis de ambiente em produção
- ✅ Mude `JWT_SECRET` e `ENCRYPTION_KEY` em produção
