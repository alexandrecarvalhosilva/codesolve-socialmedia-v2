# CodeSolve Social Media - Backend

Backend API para a plataforma CodeSolve Social Media, um sistema multi-tenant para gerenciamento de comunicação via WhatsApp e redes sociais.

## Tecnologias

- **Runtime**: Node.js 22+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Cache/Filas**: Redis
- **WebSocket**: Socket.IO
- **Autenticação**: JWT

## Requisitos

- Node.js 22+
- PostgreSQL 14+
- Redis 6+

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# Criar dados iniciais (opcional)
npx prisma db seed
```

## Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## Estrutura do Projeto

```
src/
├── config/          # Configurações (database, redis, env)
├── middleware/      # Middlewares (auth, rate limit)
├── routes/          # Rotas da API
├── types/           # Tipos TypeScript
├── utils/           # Utilitários
└── index.ts         # Entrada principal
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual

### Tenants
- `GET /api/tenants` - Listar tenants (SuperAdmin)
- `POST /api/tenants` - Criar tenant (SuperAdmin)
- `GET /api/tenants/:id` - Detalhes do tenant
- `PUT /api/tenants/:id` - Atualizar tenant

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Detalhes do usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário

### Chat
- `GET /api/chat/conversations` - Listar conversas
- `GET /api/chat/conversations/:id` - Detalhes da conversa
- `GET /api/chat/conversations/:id/messages` - Mensagens da conversa
- `POST /api/chat/conversations/:id/messages` - Enviar mensagem

### WhatsApp
- `GET /api/whatsapp/instances` - Listar instâncias
- `POST /api/whatsapp/instances` - Criar instância
- `POST /api/whatsapp/instances/:id/connect` - Conectar (QR Code)
- `POST /api/whatsapp/instances/:id/disconnect` - Desconectar

### Billing
- `GET /api/billing/plans` - Listar planos
- `GET /api/billing/subscription` - Assinatura atual
- `POST /api/billing/checkout` - Criar checkout

### Relatórios
- `GET /api/reports/dashboard` - Dashboard
- `GET /api/reports/messages` - Relatório de mensagens
- `GET /api/reports/usage` - Uso de recursos

## Autenticação

Todas as rotas (exceto login, registro e health) requerem autenticação via Bearer Token:

```
Authorization: Bearer <token>
```

## Roles e Permissões

- **superadmin**: Acesso total ao sistema
- **admin**: Acesso total ao tenant
- **operador**: Acesso operacional limitado
- **visualizador**: Apenas visualização

## Rate Limiting

- API geral: 300 req/min por tenant
- Autenticação: 10 tentativas/15min por IP
- Relatórios: 5 req/hora por tenant

## WebSocket

Conexão via Socket.IO para eventos em tempo real:

```javascript
const socket = io('http://localhost:3001');

// Entrar em sala do tenant
socket.emit('join:tenant', tenantId);

// Entrar em conversa
socket.emit('join:conversation', conversationId);

// Eventos recebidos
socket.on('message:new', (message) => { ... });
socket.on('typing:start', (data) => { ... });
```

## Licença

Proprietário - CodeSolve
