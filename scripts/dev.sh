#!/bin/bash

echo "🚀 Iniciando TravelBot Pro em modo desenvolvimento..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verifica se os serviços Docker estão rodando
echo -e "${YELLOW}Verificando serviços...${NC}"
if ! docker ps | grep -q travelbot-postgres; then
    echo -e "${YELLOW}PostgreSQL não está rodando. Iniciando...${NC}"
    docker-compose up -d postgres
    sleep 3
fi

if ! docker ps | grep -q travelbot-redis; then
    echo -e "${YELLOW}Redis não está rodando. Iniciando...${NC}"
    docker-compose up -d redis
    sleep 2
fi

echo -e "${GREEN}✓ Serviços prontos${NC}"
echo ""
echo -e "${GREEN}Iniciando aplicação...${NC}"
echo "  - Backend: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo ""

# Inicia a aplicação
npm run dev

