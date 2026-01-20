# Deploy - CodeSolve Social Media

Este documento descreve os passos para subir o **Frontend** e **Backend** comunicando entre si usando Docker.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Sua Máquina                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │   Frontend (React)  │      │   Backend (Node.js) │          │
│  │   Container         │ ───► │   Container         │          │
│  │   Porta: 80         │      │   Porta: 3001       │          │
│  └─────────────────────┘      └─────────────────────┘          │
│                                        │                        │
│                                        ▼                        │
│                          ┌─────────────────────────┐           │
│                          │   PostgreSQL + Redis    │           │
│                          │   72.60.3.251           │           │
│                          └─────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao PostgreSQL (72.60.3.251:5432)
- Acesso ao Redis (72.60.3.251:6379)

---

## Estrutura de Diretórios

```
/dados/arjuna/Documentos/Gandhiva-TI/projetos/codesolve-socialmedia/
├── codesolve-social-media-frontend/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── ...
└── codesolve-social-backend/
    ├── docker-compose.yml
    ├── Dockerfile
    └── ...
```

---

## Passo a Passo

### 1. Configurar Variáveis de Ambiente

#### Backend (.env)

Crie o arquivo `.env` no diretório do backend:

```bash
cd /dados/arjuna/Documentos/Gandhiva-TI/projetos/codesolve-socialmedia/codesolve-social-backend
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://postgres:9ee5b061c99d1c2d8127e96bb5ea8da2@72.60.3.251:5432/codesolve-socialmedia

# Redis
REDIS_URL=redis://72.60.3.251:6379

# JWT
JWT_SECRET=cd83afce33e1ba7aeba5e3cfc6e635758a0b48af41ae378c239f0140ebd3d6a1f45bb47e6b1898d53ed71ef04baf43c974cf435ba8457ba259adbf2292377e9b
JWT_EXPIRES_IN=30d

# CORS - URLs do frontend
CORS_ORIGIN=http://localhost,http://localhost:80,http://localhost:5173
```

#### Frontend (.env)

Crie/edite o `.env` no diretório do frontend:

```env
VITE_API_URL=http://localhost:3001
```

---

### 2. Criar Rede Docker Compartilhada

Antes de subir os containers, crie a rede que será compartilhada:

```bash
docker network create codesolve-network
```

---

### 3. Subir o Backend

```bash
cd /dados/arjuna/Documentos/Gandhiva-TI/projetos/codesolve-socialmedia/codesolve-social-backend

# Build e start
docker-compose up -d --build
```

**Verificar se está rodando:**

```bash
# Ver logs
docker-compose logs -f backend

# Testar health check
curl http://localhost:3001/api/health

# Testar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codesolve.com.br","password":"Admin@123"}'
```

---

### 4. Subir o Frontend

```bash
cd /dados/arjuna/Documentos/Gandhiva-TI/projetos/codesolve-socialmedia/codesolve-social-media-frontend

# Build e start
docker-compose up -d --build
```

**Verificar se está rodando:**

```bash
# Ver logs
docker-compose logs -f frontend

# Abrir no navegador
xdg-open http://localhost
```

---

### 5. Atualizar docker-compose do Frontend

Para que o frontend se conecte à mesma rede do backend, adicione a rede externa no `docker-compose.yml` do frontend:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:3001}
    container_name: codesolve-frontend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - codesolve-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  codesolve-network:
    external: true
```

---

## Comandos Úteis

### Gerenciamento

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar containers
docker-compose down

# Rebuild e restart
docker-compose up -d --build --force-recreate

# Limpar tudo (cuidado!)
docker-compose down -v --rmi all
```

### Troubleshooting

```bash
# Verificar se a rede existe
docker network ls | grep codesolve

# Inspecionar rede
docker network inspect codesolve-network

# Verificar conectividade entre containers
docker exec codesolve-frontend ping codesolve-backend

# Ver logs de erro
docker-compose logs backend 2>&1 | grep -i error
```

---

## Modo Desenvolvimento

Para desenvolvimento com hot-reload:

### Backend

```bash
cd codesolve-social-backend
docker-compose --profile dev up backend-dev
```

### Frontend

```bash
cd codesolve-social-media-frontend
docker-compose --profile dev up frontend-dev
```

---

## Usuários de Teste

| Email | Senha | Role |
|-------|-------|------|
| admin@codesolve.com.br | Admin@123 | SuperAdmin |
| admin@techsolutions.com.br | Tech@123 | Admin |
| admin@fitnesspro.com.br | Fitness@123 | Admin |
| dr.fernanda@clinicasaude.com.br | Clinica@123 | Admin |

---

## Checklist Final

- [ ] Rede `codesolve-network` criada
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 80
- [ ] Health check do backend retorna OK
- [ ] Login funciona via curl
- [ ] Frontend consegue fazer login
- [ ] CORS configurado corretamente

---

## Problemas Comuns

### CORS Error

Se aparecer erro de CORS no navegador:

1. Verifique se `CORS_ORIGIN` no backend inclui a URL do frontend
2. Reinicie o backend após alterar

### Connection Refused

Se o frontend não consegue conectar ao backend:

1. Verifique se ambos estão na mesma rede Docker
2. Use `http://localhost:3001` (não `http://backend:3001`) se acessando do navegador

### Database Connection Error

Se o backend não conecta ao PostgreSQL:

1. Verifique se o IP 72.60.3.251 está acessível
2. Verifique as credenciais no `.env`
3. Teste conexão: `psql -h 72.60.3.251 -U postgres -d codesolve-socialmedia`
