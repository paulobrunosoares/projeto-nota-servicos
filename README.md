# 📝 Gerador de Nota de Serviço

Sistema completo e moderno para gerar notas de serviço em PDF, desenvolvido como **Progressive Web App (PWA)** com interface intuitiva, persistência de dados e funcionalidade offline.

## ✨ Funcionalidades Principais

### 📄 Geração de PDF Profissional
- Geração de PDF com layout profissional e formatado
- Cabeçalho com dados da empresa (nome, contato, subdescritivo)
- Tabela de itens com descrição e valores alinhados
- Rodapé completo com:
  - Nome do titular e CPF formatado (XXX.XXX.XXX-XX)
  - Dados bancários (Banco | Agência | Conta)
  - Chaves PIX configuráveis
- Cálculo automático do valor total
- Download direto do arquivo PDF

### 📝 Gestão de Itens de Serviço
- **Adicionar itens manualmente**: Digite descrição e valor
- **Selecionar serviços pré-definidos**: Dropdown com itens salvos anteriormente
- **Remoção individual**: Exclua itens da lista facilmente
- **Cálculo automático**: Total atualizado em tempo real
- **Pré-visualização completa**: Visualize todos os itens na tabela antes de gerar PDF

### ⚙️ Página de Configuração
Acesse via botão de engrenagem no canto superior direito para configurar:

#### 🏢 Dados da Empresa
- Nome da empresa
- Contato (telefone/WhatsApp)
- Subdescritivo (slogan ou descrição breve)

#### 💳 Dados da Conta Bancária
- Nome do titular
- CPF (formatado automaticamente no PDF)
- Nome do banco
- Agência
- Número da conta

#### 💰 Chaves PIX
- Adicione múltiplas chaves PIX
- Especifique o tipo (CPF, E-mail, Telefone, Chave Aleatória)
- Remova chaves desnecessárias
- Todas as chaves aparecem no rodapé do PDF

### 💾 Backup e Restauração
Sistema completo de backup e restauração de dados:

#### 🔄 Fazer Backup
- **Exportação completa**: Salva todas as configurações e dados em arquivo JSON
- **Nomenclatura automática**: `backup-ordem-servicos-YYYY-MM-DD.json`
- **Backup inclui**:
  - Configurações da empresa (nome, contato, subdescritivo)
  - Dados bancários (titular, CPF, banco, agência, conta)
  - Chaves PIX configuradas
  - Lista de itens de serviço atuais
  - Catálogo de itens pré-definidos
- **Versionamento**: Arquivo contém versão e timestamp do backup

#### ⚡ Restaurar Backup
- **Seleção de arquivo**: Upload de arquivo JSON de backup
- **Validação automática**: Verifica integridade do arquivo antes de restaurar
- **Restauração seletiva**: Escolha quais dados deseja restaurar:
  - ✅ Configurações da Empresa
  - ✅ Itens de Serviço (com contagem)
  - ✅ Itens Pré-definidos (com contagem)
- **Pré-visualização**: Veja informações do backup antes de confirmar
- **Confirmação de segurança**: Aviso antes de substituir dados atuais
- **Feedback completo**: Resumo dos itens restaurados com sucesso

### 💾 Persistência de Dados (localStorage)
- **Itens pré-definidos**: Liste seus serviços mais comuns
- **Configurações da empresa**: Salvas automaticamente
- **Dados bancários**: Não precisa preencher toda vez
- **Chaves PIX**: Mantidas entre sessões
- Os dados permanecem salvos mesmo fechando o navegador

### 📱 Progressive Web App (PWA)
- **Instalável**: Adicione à tela inicial do celular ou desktop
- **Funciona offline**: Use mesmo sem internet (após primeira visita)
- **Ícone personalizado**: App aparece com identidade própria
- **Modo standalone**: Abre em tela cheia sem barra do navegador
- **Atalhos rápidos**: Acesso direto à página inicial e configurações

### 🎨 Design Responsivo e Moderno
- Interface adaptável para desktop, tablet e mobile
- Gradientes modernos e sombras suaves
- Botão de configuração icon-only em tela pequena
- Layout otimizado para viewport (altura completa)
- Scroll independente na lista de itens
- Estados visuais de hover e foco
- Paleta de cores azul (#2563eb) consistente

## 🚀 Como Usar

### Primeira Configuração
1. **Clique no ícone de engrenagem** no canto superior direito
2. **Preencha os dados da empresa**: Nome, contato e subdescritivo
3. **Configure dados bancários**: Nome, CPF, banco, agência e conta
4. **Adicione chaves PIX**: Tipo e valor de cada chave
5. **Clique em "Salvar Configurações"**

### Gerando uma Nota de Serviço
1. **Selecione ou digite a data** do serviço
2. **Adicione itens de serviço**:
   - **Opção 1**: Selecione um serviço pré-definido no dropdown
   - **Opção 2**: Digite manualmente a descrição e valor
   - Clique em "Adicionar Item" ou pressione Enter
3. **Revise a lista** de itens na tabela de pré-visualização
4. **Remova itens** clicando no ícone 🗑️ se necessário
5. **Confira o valor total** calculado automaticamente
6. **Clique em "Gerar PDF"** para baixar o arquivo

### Instalando como PWA

#### No Desktop (Chrome/Edge/Brave)
1. Acesse o aplicativo no navegador
2. Procure o ícone **⊕** na barra de endereços
3. Clique em "Instalar" ou "Adicionar"
4. O app será instalado e poderá ser aberto como aplicativo independente

#### No Android (Chrome/Samsung Internet)
1. Acesse o aplicativo no navegador
2. Toque no menu **⋮** (três pontos)
3. Selecione **"Adicionar à tela inicial"**
4. Confirme e o ícone aparecerá no launcher

#### No iOS (Safari)
1. Acesse o aplicativo no Safari
2. Toque no botão **Compartilhar** (quadrado com seta)
3. Selecione **"Adicionar à Tela de Início"**
4. Confirme o nome e toque em "Adicionar"

### Fazendo Backup e Restauração

#### 📥 Criar Backup dos Dados
1. Acesse a página de **Configurações** (ícone de engrenagem)
2. Role até a seção **Backup e Restauração** (laranja)
3. Clique em **"Baixar Backup"**
4. Um arquivo JSON será baixado automaticamente
5. Guarde o arquivo em local seguro

**Importante**: O backup contém todas as suas configurações, dados bancários, chaves PIX e itens cadastrados.

#### 📤 Restaurar Backup
1. Acesse **Configurações** → **Backup e Restauração**
2. Clique em **"Restaurar Backup"**
3. Selecione o arquivo JSON de backup
4. Na janela modal, escolha quais dados restaurar:
   - **Configurações da Empresa**: Dados da empresa, bancários e PIX
   - **Itens de Serviço**: Lista atual de itens em uso
   - **Itens Pré-definidos**: Catálogo de serviços salvos
5. Confira as informações do backup (data e quantidades)
6. Clique em **"Confirmar Restauração"**
7. Confirme a operação no alerta de segurança
8. A página será recarregada automaticamente

**Dica**: Use a restauração seletiva para migrar apenas parte dos dados ou combinar informações de diferentes backups.

## 🛠️ Tecnologias

- **SvelteKit 5** - Framework web moderno com SSR
- **Svelte 5** - Runes ($state, $derived, $effect)
- **TypeScript** - Tipagem estática robusta
- **Tailwind CSS v4** - Estilização utility-first
- **pdf-lib** - Geração de PDFs no lado do servidor
- **Service Worker** - Cache e funcionalidade offline
- **Web App Manifest** - Configuração PWA

## 📦 Instalação e Desenvolvimento

```sh
# Clonar o repositório
git clone <url-do-repositorio>
cd projeto-ordem-servicos-mnt

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# Aplicativo disponível em http://localhost:5173/

# Build para produção
npm run build

# Pré-visualizar build de produção
npm run preview
```

## 🗂️ Estrutura do Projeto

```
projeto-ordem-servicos-mnt/
├── src/
│   ├── lib/
│   │   ├── types.ts           # Interfaces TypeScript
│   │   ├── store.ts           # Funções localStorage e backup
│   │   ├── components/
│   │   │   ├── BackupRestauracao.svelte  # Componente de backup
│   │   │   ├── index.ts       # Exportações de componentes
│   │   │   └── README.md      # Documentação dos componentes
│   │   └── helper/
│   │       └── format-date.helper.ts  # Funções auxiliares
│   ├── routes/
│   │   ├── +page.svelte       # Página principal
│   │   ├── +layout.svelte     # Layout global
│   │   ├── config/
│   │   │   └── +page.svelte   # Página de configuração
│   │   └── api/
│   │       └── pdf/
│   │           └── +server.ts # Endpoint de geração de PDF
│   ├── app.html               # Template HTML (PWA meta tags)
│   └── app.d.ts
├── static/
│   ├── manifest.json          # Manifest PWA
│   ├── service-worker.js      # Service Worker
│   ├── icon-192.png           # Ícone PWA 192x192
│   ├── icon-512.png           # Ícone PWA 512x512
│   └── robots.txt
├── BACKUP-RESTAURACAO.md      # Documentação do sistema de backup
├── REFATORACAO-BACKUP.md      # Documentação da refatoração
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 💡 Dicas de Uso

### Serviços Pré-Definidos
- Adicione seus serviços mais comuns na lista principal
- Use o dropdown para adicionar rapidamente ao criar notas
- Os itens ficam salvos no navegador (localStorage)

### Gerenciamento de Dados
- As configurações são salvas automaticamente
- Use a página de configuração sempre que mudar dados
- Os dados permanecem mesmo após fechar o navegador
- **Faça backups regulares** dos seus dados para segurança
- Use a restauração seletiva para migrar ou atualizar dados específicos
- Para "resetar", limpe os dados do site nas configurações do navegador

### PDFs Profissionais
- Configure todos os dados da empresa antes de gerar o primeiro PDF
- Os PDFs incluem automaticamente todas as informações configuradas
- O formato é otimizado para impressão e visualização digital

### Backup e Segurança
- **Recomendação**: Faça backup semanalmente ou após mudanças importantes
- Guarde os arquivos de backup em nuvem ou armazenamento externo
- Teste a restauração ocasionalmente para garantir integridade dos dados
- Use nomes descritivos ao salvar backups manualmente

## 📱 Compatibilidade PWA

| Plataforma | Instalação | Offline |
|------------|-----------|---------|
| Chrome/Edge Desktop | ✅ | ✅ |
| Android Chrome | ✅ | ✅ |
| iOS Safari | ✅ | ✅ |
| Firefox Desktop | ⚠️ Limitado | ✅ |

## 🎨 Personalização

### Alterar Cores do Tema
Edite o arquivo [manifest.json](static/manifest.json):
```json
"theme_color": "#2563eb",  // Azul atual
"background_color": "#ffffff"
```

### Personalizar Ícones
Substitua os arquivos em `/static/`:
- `icon-192.png` - Ícone 192x192px
- `icon-512.png` - Ícone 512x512px
- Mantenha as dimensões para melhor compatibilidade

## 🆕 Atualizações Recentes

### v1.0.0 - Sistema de Backup e Restauração (Março 2026)

#### ✨ Novos Recursos
- **Sistema Completo de Backup**
  - Exportação de todos os dados em formato JSON estruturado
  - Nomenclatura automática com data do backup
  - Versionamento do formato de backup para compatibilidade futura
  - Validação de integridade do arquivo antes da restauração

- **Restauração Seletiva Avançada**
  - Modal interativo para escolher quais dados restaurar
  - Pré-visualização das informações do backup (data, quantidades)
  - Confirmação de segurança antes de sobrescrever dados
  - Feedback detalhado sobre itens restaurados
  - Recarga automática da página após restauração bem-sucedida

#### 🔧 Melhorias Técnicas
- **Refatoração de Componente BackupRestauracao**
  - Criação de componente reutilizável e auto-contido
  - Redução de ~140 linhas na página de configuração
  - Separação clara de responsabilidades
  - Documentação completa do componente em `src/lib/components/README.md`
  - Sistema de exportação centralizado em `src/lib/components/index.ts`

#### 📚 Documentação
- Criado `BACKUP-RESTAURACAO.md` com guia completo do sistema
- Criado `REFATORACAO-BACKUP.md` documentando mudanças arquiteturais
- Atualizado README com seções de backup e restauração
- Documentação de componentes para facilitar manutenção futura

#### 🎯 Benefícios
- Segurança de dados aprimorada com backups regulares
- Migração facilitada entre dispositivos ou navegadores
- Recuperação rápida em caso de perda de dados do localStorage
- Flexibilidade para restaurar apenas dados específicos
- Código mais limpo e manutenível

## 📄 Licença

Este projeto está sob licença MIT. Sinta-se livre para usar e modificar.

---

**Desenvolvido com ❤️ usando SvelteKit e Svelte 5**

## 📝 Estrutura do Projeto

```
src/
├── routes/
│   ├── +page.svelte          # Interface principal
│   ├── +layout.svelte         # Layout global
│   └── api/
│       └── pdf/
│           └── +server.ts     # Geração do PDF
```

## 🌐 Deploy

Este projeto está configurado para deploy na Vercel com o adapter já instalado.

```sh
npm run build
```

## 📞 Contato

Tec. Informática - Paulo Bruno Soares  
Telefone: (21) 99803-0152

---

Desenvolvido com ❤️ usando SvelteKit
