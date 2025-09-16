# 📡 API Integration - WebDiário Student Portal

## 📋 Visão Geral

Este documento descreve a integração com as APIs do WebDiário no Student Portal, incluindo autenticação, dados do estudante e funcionalidades acadêmicas.

## 🔗 Base URLs

```
Desenvolvimento: 
- API Principal: http://localhost:8080/api
- Security API: http://localhost:8081/api/security
- Security App: http://localhost:3003

Produção: 
- API Principal: https://api.webdiario.com/api
- Security API: https://security.webdiario.com/api/security
- Security App: https://auth.webdiario.com
```

## 🔐 Autenticação

Todos os endpoints requerem autenticação via JWT token no header:

```
Authorization: Bearer <jwt_token>
```

## 📊 Endpoints de Autenticação

### **Login**
```http
POST /api/security/auth/login
Content-Type: application/json

{
  "login": "student@example.com",
  "senha": "password123"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "student@example.com",
    "email": "student@example.com",
    "nome": "João Silva",
    "roles": ["STUDENT"]
  },
  "expiresIn": 86400000
}
```

### **Refresh Token**
```http
POST /api/security/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400000
}
```

### **User Info**
```http
GET /api/security/user/me
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "id": 123,
  "username": "student@example.com",
  "email": "student@example.com",
  "nome": "João Silva",
  "roles": ["STUDENT"],
  "tenantId": 1,
  "tenantName": "Escola Exemplo"
}
```

### **Logout**
```http
POST /api/security/auth/logout
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true
}
```

## 📊 Endpoints de Dados do Estudante

### **Informações do Estudante**
```http
GET /api/students/me
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "id": 123,
  "nome": "João Silva",
  "email": "joao@example.com",
  "matricula": "2024001",
  "turma": {
    "id": 1,
    "nome": "3º Ano A",
    "ano": 2024
  },
  "escola": {
    "id": 1,
    "nome": "Escola Exemplo"
  }
}
```

### **Notas do Estudante**
```http
GET /api/students/me/grades
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `bimestre`: Número do bimestre (1-4)
- `disciplina`: ID da disciplina (opcional)
- `ano`: Ano letivo (opcional)

**Resposta:**
```json
{
  "grades": [
    {
      "id": 1,
      "disciplina": {
        "id": 1,
        "nome": "Matemática"
      },
      "bimestre": 1,
      "nota1": 8.5,
      "nota2": 7.0,
      "nota3": 9.0,
      "media": 8.2,
      "status": "APROVADO"
    }
  ],
  "total": 1
}
```

### **Frequência do Estudante**
```http
GET /api/students/me/attendance
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `mes`: Mês (1-12)
- `ano`: Ano
- `disciplina`: ID da disciplina (opcional)

**Resposta:**
```json
{
  "attendance": [
    {
      "id": 1,
      "disciplina": {
        "id": 1,
        "nome": "Matemática"
      },
      "data": "2024-01-15",
      "presente": true,
      "justificativa": null
    }
  ],
  "summary": {
    "totalAulas": 20,
    "totalPresencas": 18,
    "totalFaltas": 2,
    "percentualFrequencia": 90.0
  }
}
```

### **Calendário Acadêmico**
```http
GET /api/students/me/calendar
Authorization: Bearer <token>
```

**Parâmetros de Query:**
- `mes`: Mês (1-12)
- `ano`: Ano

**Resposta:**
```json
{
  "events": [
    {
      "id": 1,
      "titulo": "Prova de Matemática",
      "descricao": "Avaliação do 1º bimestre",
      "data": "2024-02-15",
      "tipo": "AVALIACAO",
      "disciplina": {
        "id": 1,
        "nome": "Matemática"
      }
    }
  ],
  "total": 1
}
```

## 🚨 Códigos de Erro

### **Códigos HTTP**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 422 | Entidade não processável |
| 500 | Erro interno do servidor |

### **Códigos de Erro Específicos**

```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Estudante não encontrado",
    "details": {
      "studentId": "123"
    }
  }
}
```

**Códigos de Erro Comuns:**
- `INVALID_CREDENTIALS`: Credenciais inválidas
- `TOKEN_EXPIRED`: Token expirado
- `STUDENT_NOT_FOUND`: Estudante não encontrado
- `GRADES_NOT_AVAILABLE`: Notas não disponíveis

## 📝 Exemplos de Uso

### **Exemplo Completo: Buscar Notas do Estudante**

```bash
# 1. Fazer login
curl -X POST "http://localhost:8081/api/security/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "student@example.com",
    "senha": "password123"
  }'

# 2. Usar token para buscar notas
curl -X GET "http://localhost:8080/api/students/me/grades?bimestre=1" \
  -H "Authorization: Bearer <token>"

# 3. Buscar frequência
curl -X GET "http://localhost:8080/api/students/me/attendance?mes=1&ano=2024" \
  -H "Authorization: Bearer <token>"
```

## 🔧 Configuração

### **Variáveis de Ambiente**

```bash
# .env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_SECURITY_API_URL=http://localhost:8081/api/security
REACT_APP_SECURITY_APP_URL=http://localhost:3003
```

### **Configuração de CORS**

```yaml
# application.yml
cors:
  allowed-origins:
    - http://localhost:3004
    - https://student.webdiario.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
```

## 🧪 Testes de API

### **Teste de Autenticação**

```bash
# Testar login
curl -X POST "http://localhost:8081/api/security/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"login": "test@example.com", "senha": "test123"}'

# Verificar resposta
# Deve retornar tokens válidos
```

### **Teste de Endpoints Protegidos**

```bash
# Testar endpoint protegido
curl -X GET "http://localhost:8080/api/students/me" \
  -H "Authorization: Bearer <token>"

# Verificar resposta
# Deve retornar dados do estudante
```

### **Teste de Erro de Autenticação**

```bash
# Testar sem token
curl -X GET "http://localhost:8080/api/students/me"

# Verificar resposta
# Deve retornar 401 Unauthorized
```

## 📊 Monitoramento

### **Métricas de API**

- **Response Time**: Tempo de resposta por endpoint
- **Success Rate**: Taxa de sucesso por endpoint
- **Error Rate**: Taxa de erro por endpoint
- **Active Users**: Usuários ativos por período

### **Health Checks**

```bash
# Verificar saúde da API principal
curl http://localhost:8080/api/health

# Verificar saúde da API de segurança
curl http://localhost:8081/api/security/health
```

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **Erro 401 Unauthorized**
```bash
# Verificar token
echo $TOKEN

# Verificar expiração
# Token pode ter expirado

# Renovar token
curl -X POST "http://localhost:8081/api/security/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

#### **Erro 403 Forbidden**
```bash
# Verificar roles do usuário
# Usuário deve ter role STUDENT

# Verificar permissões
# Endpoint pode requerer permissões específicas
```

#### **Erro 404 Not Found**
```bash
# Verificar URL do endpoint
# URL pode estar incorreta

# Verificar se recurso existe
# Estudante pode não existir
```

---

**📝 Última Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Equipe de Desenvolvimento WebDiário  
**🏗️ Projeto**: WebDiário Student Portal  
**🎯 Status**: 🚧 **EM DESENVOLVIMENTO**
