# 📚 WebDiário Student Portal

## 📋 Visão Geral

O **WebDiário Student Portal** é uma aplicação React desenvolvida para fornecer aos estudantes acesso às suas informações acadêmicas, incluindo notas, frequência, calendário acadêmico e outras funcionalidades relacionadas ao sistema WebDiário.

## 🎯 Objetivos

- **Portal Estudantil**: Interface dedicada para estudantes acessarem suas informações acadêmicas
- **Autenticação SSO**: Integração completa com o sistema de Single Sign-On do WebDiário
- **Interface Moderna**: Design responsivo e intuitivo usando React e Tailwind CSS
- **Segurança**: Implementação de rotas protegidas e gerenciamento de sessão

## 🏗️ Arquitetura

### **Tecnologias Utilizadas**

- **Frontend**: React 18 com TypeScript
- **Roteamento**: React Router DOM v6
- **Estilização**: Tailwind CSS
- **Autenticação**: SSO integrado com WebDiário Security
- **Notificações**: React Toastify
- **HTTP Client**: Axios

### **Estrutura do Projeto**

```
app-webdiario-student-portal/
├── docs/                    # 📚 Documentação completa
├── public/                  # 🔧 Arquivos públicos
├── src/                     # 🔧 Código fonte
│   ├── components/          # 🧩 Componentes reutilizáveis
│   ├── contexts/            # 🔄 Contextos React
│   ├── pages/               # 📄 Páginas da aplicação
│   ├── services/            # 🔌 Serviços e APIs
│   ├── types/               # 📝 Definições TypeScript
│   └── App.tsx              # 🚀 Componente principal
├── env.example              # ⚙️ Variáveis de ambiente
└── package.json             # 📦 Dependências
```

## 🚀 Guias de Uso

### **Instalação**

```bash
# Clone o repositório
git clone [repository-url]
cd app-webdiario-student-portal

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Execute o projeto
npm start
```

### **Execução**

```bash
# Modo desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

## 🔧 Desenvolvimento

### **Funcionalidades Implementadas**

- ✅ **Autenticação SSO**: Integração completa com WebDiário Security
- ✅ **Rotas Protegidas**: Sistema de proteção de rotas
- ✅ **Contexto de Autenticação**: Gerenciamento de estado de autenticação
- ✅ **Interface Responsiva**: Design adaptável para diferentes dispositivos
- ✅ **Notificações**: Sistema de toast para feedback do usuário

### **Funcionalidades em Desenvolvimento**

- 🚧 **Dashboard Estudantil**: Interface principal com informações do estudante
- 🚧 **Visualização de Notas**: Acesso às notas e avaliações
- 🚧 **Controle de Frequência**: Visualização da frequência escolar
- 🚧 **Calendário Acadêmico**: Acesso ao calendário de eventos

## 📊 Referência Técnica

### **Configurações**

- **Porta**: 3004 (desenvolvimento)
- **API Base**: http://localhost:8080/api
- **Security API**: http://localhost:8081/api/security
- **Security App**: http://localhost:3003

### **Variáveis de Ambiente**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `REACT_APP_API_URL` | URL da API principal | `http://localhost:8080/api` |
| `REACT_APP_SECURITY_API_URL` | URL da API de segurança | `http://localhost:8081/api/security` |
| `REACT_APP_SECURITY_APP_URL` | URL do app de segurança | `http://localhost:3003` |
| `REACT_APP_APP_NAME` | Nome da aplicação | `student-portal` |

## 🆘 Suporte

### **Problemas Comuns**

1. **Erro de CORS**: Verifique se as APIs estão rodando nas portas corretas
2. **Token Expirado**: O sistema redireciona automaticamente para login
3. **Erro de SSO**: Verifique se o app de segurança está rodando

### **Logs de Debug**

O sistema inclui logs detalhados para debug. Para ativar:

```bash
# No arquivo .env
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## 🔗 Links Úteis

- **Documentação Completa**: [docs/index.md](./docs/index.md)
- **API Documentation**: [docs/API_INTEGRATION.md](./docs/API_INTEGRATION.md)
- **Arquitetura**: [docs/ARQUITETURA.md](./docs/ARQUITETURA.md)
- **Deploy**: [docs/DEPLOY.md](./docs/DEPLOY.md)

---

**📝 Última Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Equipe de Desenvolvimento WebDiário  
**🏗️ Projeto**: WebDiário Student Portal  
**🎯 Status**: 🚧 **EM DESENVOLVIMENTO**