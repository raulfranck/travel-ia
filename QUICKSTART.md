# 🚀 Guia Rápido - TravelBot Pro

## Setup em 5 minutos

### 1️⃣ Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** (opcional, mas recomendado)

### 2️⃣ Instalação Automática

```bash
# Clone o projeto
git clone <seu-repo>
cd travel-ia

# Execute o script de setup (Linux/Mac)
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**O script fará automaticamente:**
✅ Instalar todas as dependências  
✅ Criar arquivo `.env` com valores padrão  
✅ Iniciar PostgreSQL e Redis via Docker  

### 3️⃣ Configurar Chaves de API

Edite o arquivo `.env` na raiz e adicione suas chaves:

```env
# Mínimo necessário para testar
OPENAI_API_KEY=sk-sua_chave_aqui
META_ACCESS_TOKEN=seu_token_meta
META_PHONE_NUMBER_ID=seu_phone_id
META_WEBHOOK_VERIFY_TOKEN=seu_verify_token
```

> 💡 **Dica**: Para testar sem WhatsApp, deixe as variáveis META_* vazias. O resto funcionará!

### 4️⃣ Iniciar Aplicação

```bash
# Opção 1: Tudo de uma vez (recomendado)
npm run dev

# Opção 2: Com script helper
./scripts/dev.sh

# Opção 3: Separado
npm run start:backend:dev  # Terminal 1
npm run start:frontend      # Terminal 2
```

### 5️⃣ Acessar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **PgAdmin** (gerenciar DB): http://localhost:5050
  - Email: admin@travelbot.com
  - Senha: admin

---

## ✅ Verificar se está funcionando

### Backend
```bash
curl http://localhost:3001/api/whatsapp/health
# Deve retornar: {"status":"ok","service":"whatsapp"}
```

### Frontend
Abra http://localhost:3000 - você verá a landing page.

---

## 🐛 Problemas Comuns

### "Port 3001 já está em uso"
```bash
# Encontre e mate o processo
lsof -ti:3001 | xargs kill -9
```

### "Não consegue conectar ao PostgreSQL"
```bash
# Verifique se o Docker está rodando
docker ps

# Reinicie o PostgreSQL
docker-compose restart postgres
```

### "Redis connection failed"
```bash
# Reinicie o Redis
docker-compose restart redis
```

---

## 📚 Próximos Passos

1. **Explore o código**
   - Backend: `backend/src/`
   - Frontend: `frontend/app/`
   - Types compartilhados: `shared/src/`

2. **Leia a documentação**
   - [README.md](./README.md) - Documentação completa
   - [docs/architecture.md](./docs/architecture.md) - Arquitetura
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir

3. **Teste as APIs**
   - Use Postman ou Insomnia
   - Endpoints em `README.md > API Endpoints`

4. **Configure o WhatsApp**
   - Crie conta no [Meta for Developers](https://developers.facebook.com)
   - Siga o guia: `docs/WHATSAPP_META_SETUP.md`
   - Configure webhook apontando para seu backend

5. **Deploy**
   - Frontend: Vercel
   - Backend: Railway, Heroku ou AWS

---

## 🎯 Checklist MVP

- [ ] Backend rodando em `localhost:3001`
- [ ] Frontend rodando em `localhost:3000`
- [ ] PostgreSQL conectado
- [ ] Redis conectado
- [ ] Chaves OpenAI configuradas
- [ ] Landing page acessível
- [ ] Dashboard acessível
- [ ] Endpoint `/api/whatsapp/health` funcionando

---

## 🆘 Ajuda

- **GitHub Issues**: Reporte bugs
- **Email**: contato@travelbot.com
- **Discord**: [Em breve]

**Divirta-se codando! 🚀✨**

