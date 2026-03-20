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
│   │   └── store.ts           # Funções localStorage
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
- Para "resetar", limpe os dados do site nas configurações do navegador

### PDFs Profissionais
- Configure todos os dados da empresa antes de gerar o primeiro PDF
- Os PDFs incluem automaticamente todas as informações configuradas
- O formato é otimizado para impressão e visualização digital

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

## 📄 Licença

Este projeto está sob licença MIT. Sinta-se livre para usar e modificar.

---

**Desenvolvido com ❤️ usando SvelteKit e Svelte 5**
- Feedback visual para ações do usuário
- Campo de data pré-preenchido com data atual

### Funcionalidades
- Adição dinâmica de itens de serviço
- Validação de campos obrigatórios
- Cálculo automático do valor total
- Remoção individual de itens
- Formatação automática de valores em Real (R$)
- Suporte a Enter para adicionar itens rapidamente

### PDF Gerado
- Cabeçalho com design profissional
- Tabela formatada com bordas e cores alternadas
- Linha de rodapé com total destacado
- Melhor organização visual
- Suporte a múltiplos itens

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
