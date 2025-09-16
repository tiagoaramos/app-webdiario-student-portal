# 🚀 Instalação - WebDiário Student Portal

## 📋 Pré-requisitos

### **Sistema Operacional**
- **Windows**: 10 ou superior
- **macOS**: 10.15 ou superior
- **Linux**: Ubuntu 18.04+ ou equivalente

### **Software Necessário**
- **Node.js**: 16.0.0 ou superior - Runtime JavaScript
- **npm**: 8.0.0 ou superior - Gerenciador de pacotes
- **Git**: 2.0.0 ou superior - Controle de versão

### **Hardware Recomendado**
- **RAM**: 4 GB mínimo, 8 GB recomendado
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Disco**: 2 GB de espaço livre

## 🔧 Instalação

### **Método 1: Instalação Rápida**

```bash
# Clone o repositório
git clone https://github.com/webdiario/app-webdiario-student-portal.git
cd app-webdiario-student-portal

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Execute o projeto
npm start
```

### **Método 2: Instalação Manual**

#### **Passo 1: Preparar Ambiente**
```bash
# Criar diretório do projeto
mkdir app-webdiario-student-portal
cd app-webdiario-student-portal

# Inicializar projeto Git
git init
```

#### **Passo 2: Instalar Dependências**
```bash
# Instalar dependências principais
npm install react react-dom react-router-dom axios react-toastify

# Instalar dependências de desenvolvimento
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
```

#### **Passo 3: Configurar Projeto**
```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações
nano .env
```

#### **Passo 4: Executar Projeto**
```bash
# Modo desenvolvimento
npm start

# Modo produção
npm run build
npm start
```

## ⚙️ Configuração

### **Variáveis de Ambiente**

```bash
# Arquivo .env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_SECURITY_API_URL=http://localhost:8081/api/security
REACT_APP_SECURITY_APP_URL=http://localhost:3003
REACT_APP_APP_NAME=student-portal
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

### **Configuração do Tailwind CSS**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... outras cores
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### **Configuração do PostCSS**

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🧪 Verificação da Instalação

### **Teste Básico**

```bash
# Verificar se o projeto está rodando
curl http://localhost:3004

# Resposta esperada: HTML da aplicação React
```

### **Teste Completo**

```bash
# Executar testes
npm test

# Resultado esperado
✅ Todos os testes passaram
```

### **Teste de Autenticação SSO**

```bash
# 1. Acessar aplicação
open http://localhost:3004

# 2. Verificar redirecionamento para SSO
# Deve redirecionar para http://localhost:3003/login

# 3. Fazer login no SSO
# Deve retornar para aplicação com token
```

## 🚨 Problemas Comuns

### **Erro de Dependências**
```bash
# Solução
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Erro de Porta**
```bash
# Verificar processos na porta 3004
lsof -i :3004

# Matar processo se necessário
kill -9 [PID]
```

### **Erro de CORS**
```bash
# Verificar se as APIs estão rodando
curl http://localhost:8080/api/health
curl http://localhost:8081/api/security/health

# Se não estiverem rodando, iniciar os serviços
```

### **Erro de Permissão**
```bash
# Solução no Linux/macOS
sudo chown -R $(whoami) /caminho/do/projeto

# Solução no Windows
# Executar como administrador
```

### **Erro de Tailwind CSS**
```bash
# Reinstalar Tailwind CSS
npm uninstall tailwindcss
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 📞 Suporte

### **Canais de Suporte**
- **GitHub Issues**: [Link para issues](https://github.com/webdiario/app-webdiario-student-portal/issues)
- **Documentação**: [docs/index.md](./index.md)
- **Email**: suporte@webdiario.com

### **Informações para Suporte**
Ao solicitar suporte, inclua:
- Versão do Node.js (`node --version`)
- Versão do npm (`npm --version`)
- Sistema operacional
- Logs de erro completos
- Passos para reproduzir o problema

### **Logs de Debug**

```bash
# Ativar logs detalhados
export REACT_APP_DEBUG=true
export REACT_APP_LOG_LEVEL=debug
npm start
```

### **Verificação de Saúde**

```bash
# Verificar status dos serviços
curl http://localhost:3004/health
curl http://localhost:8080/api/health
curl http://localhost:8081/api/security/health
```

---

**📝 Última Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Equipe de Desenvolvimento WebDiário  
**🏗️ Projeto**: WebDiário Student Portal  
**🎯 Status**: ✅ **INSTALAÇÃO DOCUMENTADA**
