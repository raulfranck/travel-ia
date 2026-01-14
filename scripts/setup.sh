#!/bin/bash

echo "🚀 Iniciando setup do TravelBot Pro..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica Node.js
echo -e "\n${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js >= 18.0.0"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"

# Verifica npm
echo -e "\n${YELLOW}Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm encontrado: $NPM_VERSION${NC}"

# Instala dependências
echo -e "\n${YELLOW}Instalando dependências...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Cria .env se não existir
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Criando arquivo .env...${NC}"
    cat > .env << EOF
# ===== BACKEND CONFIGURATION =====
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

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
JWT_SECRET=dev_secret_change_in_production
JWT_EXPIRATION=7d

# ===== INTEGRATIONS =====
# Adicione suas chaves de API aqui

# Meta WhatsApp Cloud API
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
META_APP_SECRET=your_app_secret

OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-4o

# ===== FRONTEND =====
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env já existe${NC}"
fi

# Inicia Docker Compose (PostgreSQL e Redis)
echo -e "\n${YELLOW}Iniciando serviços Docker (PostgreSQL e Redis)...${NC}"
if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    docker-compose up -d postgres redis
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Serviços Docker iniciados${NC}"
        echo -e "  - PostgreSQL: localhost:5432"
        echo -e "  - Redis: localhost:6379"
    else
        echo -e "${YELLOW}⚠ Erro ao iniciar Docker. Certifique-se de ter PostgreSQL e Redis instalados manualmente.${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Docker não encontrado. Por favor, instale PostgreSQL e Redis manualmente.${NC}"
fi

# Aguarda serviços
echo -e "\n${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 5

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Configure suas chaves de API no arquivo .env"
echo "2. Execute: npm run dev"
echo "3. Acesse:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:3001"
echo "   - PgAdmin: http://localhost:5050 (user: admin@travelbot.com, senha: admin)"
echo ""
echo "Para mais informações, consulte o README.md"
echo ""

