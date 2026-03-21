# Componente BackupRestauracao

## 📍 Localização
`src/lib/components/BackupRestauracao.svelte`

## 📖 Descrição
Componente reutilizável para gerenciar backup e restauração de dados da aplicação. Fornece uma interface completa com botões para download de backup e um modal interativo para restauração seletiva de dados.

## ✨ Funcionalidades

### Backup
- Gera arquivo JSON com todos os dados do localStorage
- Download automático com nome formatado: `backup-ordem-servicos-YYYY-MM-DD.json`
- Inclui: metadata da empresa, itens de serviço e itens pré-definidos

### Restauração
- Upload de arquivo JSON
- Validação automática do formato do backup
- **Seleção granular** do que restaurar (checkboxes independentes)
- Exibição de informações do backup (data e versão)
- Contador de itens para cada categoria
- Confirmação dupla antes de sobrescrever dados
- Recarregamento automático da página após restauração

## 🎨 Interface

### Seção Principal
```svelte
<BackupRestauracao />
```

Renderiza:
- Card laranja com título "Backup e Restauração"
- Dois botões lado a lado:
  - **Baixar Backup** (fundo laranja)
  - **Restaurar Backup** (borda laranja)
- Input de arquivo oculto para upload

### Modal de Restauração
Modal responsivo que aparece após selecionar um arquivo:
- **Header laranja** com título
- **Informações do backup**: data e versão
- **Checkboxes para seleção**:
  - ☑️ Configurações da Empresa
  - ☑️ Itens de Serviço (com contador)
  - ☑️ Itens Pré-definidos (com contador)
- **Aviso de segurança** (card amarelo)
- **Botões de ação**: Cancelar | Restaurar

## 📦 Dependências

### Importações
```typescript
import { exportarBackup, restaurarBackup, validarBackup } from '$lib/store';
import type { BackupData } from '$lib/types';
```

### Funções do Store
- `exportarBackup()`: Cria e baixa o arquivo de backup
- `restaurarBackup(backup, options)`: Restaura dados selecionados
- `validarBackup(data)`: Valida estrutura do arquivo

### Tipos
```typescript
interface BackupData {
  versao: string;
  dataBackup: string;
  metadata: Metadata | null;
  itens: ItemServico[];
  itensPreDefinidos: ItemServico[];
}
```

## 🔧 Estado Interno

```typescript
let mostrarModalRestaurar = $state(false);
let backupParaRestaurar: BackupData | null = $state(null);
let restaurarMetadata = $state(true);
let restaurarItens = $state(true);
let restaurarItensPreDefinidos = $state(true);
let fileInput: HTMLInputElement | null = null;
```

## 📝 Uso

### Integração Básica
```svelte
<script lang="ts">
  import BackupRestauracao from '$lib/components/BackupRestauracao.svelte';
</script>

<!-- Adicione onde desejar na página -->
<BackupRestauracao />
```

### Exemplo na Página de Configuração
```svelte
<!-- Dados da Empresa -->
<div class="rounded-xl border border-purple-100 bg-purple-50 p-4">
  <!-- ... campos da empresa ... -->
</div>

<!-- Backup e Restauração -->
<BackupRestauracao />

<!-- Botão Salvar -->
<button onclick={salvar}>Salvar Configurações</button>
```

## 🎯 Casos de Uso

1. **Backup Regular**: Usuário clica em "Baixar Backup" periodicamente
2. **Migração de Dados**: Transferir dados entre dispositivos/navegadores
3. **Recuperação**: Restaurar dados após limpeza ou erro
4. **Teste**: Fazer backup antes de testar alterações importantes
5. **Restauração Parcial**: Restaurar apenas configurações sem afetar itens

## 🔒 Segurança

- ✅ Validação de formato do arquivo JSON
- ✅ Confirmação dupla antes de sobrescrever dados
- ✅ Aviso visual sobre irreversibilidade
- ✅ Tratamento de erros com feedback ao usuário
- ✅ Limpeza do input após upload

## 🎨 Estilo

### Classes Tailwind Principais
- **Card**: `rounded-xl border border-orange-100 bg-orange-50 p-4`
- **Botões**: `rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white`
- **Modal**: `fixed inset-0 z-50 flex items-center justify-center bg-black/50`
- **Aviso**: `rounded-lg border border-yellow-200 bg-yellow-50 p-4`

### Responsividade
- Grid de 2 colunas em telas médias: `md:grid-cols-2`
- Modal responsivo: `max-w-lg overflow-y-auto`
- Adapta-se a diferentes tamanhos de tela

## 🐛 Tratamento de Erros

```typescript
try {
  const texto = await file.text();
  const dados = JSON.parse(texto);
  
  if (!validarBackup(dados)) {
    alert('Arquivo de backup inválido!');
    return;
  }
  // ... processamento
} catch (error) {
  alert('Erro ao ler o arquivo de backup: ' + (error as Error).message);
}
```

## ⚡ Performance

- Processamento assíncrono de arquivos
- Validação antes de carregar dados
- Limpeza automática de referências
- Recarregamento eficiente após restauração

## 🔄 Fluxo de Dados

```
Usuário clica em "Baixar Backup"
  ↓
exportarBackup() é chamado
  ↓
Arquivo JSON é baixado

---

Usuário clica em "Restaurar Backup"
  ↓
Input de arquivo é acionado
  ↓
Arquivo é lido e validado
  ↓
Modal é exibido com opções
  ↓
Usuário seleciona o que restaurar
  ↓
Confirmação é solicitada
  ↓
restaurarBackup() é chamado
  ↓
Página é recarregada
```

## 📊 Estrutura do Arquivo de Backup

```json
{
  "versao": "1.0.0",
  "dataBackup": "2026-03-21T15:30:00.000Z",
  "metadata": {
    "dadosEmpresa": {
      "nomeEmpresa": "Minha Empresa",
      "contato": "(11) 1234-5678",
      "subDescricao": "Descrição"
    },
    "dadosConta": { ... },
    "chavesPix": [ ... ]
  },
  "itens": [
    { "descricao": "Serviço 1", "valor": 100 }
  ],
  "itensPreDefinidos": [ ... ]
}
```

## 🧪 Testes Sugeridos

1. ✅ Baixar backup com dados existentes
2. ✅ Baixar backup sem dados (vazio)
3. ✅ Restaurar backup completo
4. ✅ Restaurar apenas configurações
5. ✅ Restaurar apenas itens
6. ✅ Tentar upload de arquivo inválido
7. ✅ Cancelar restauração
8. ✅ Verificar recarregamento após restauração

## 📝 Notas de Desenvolvimento

- Usa **Svelte 5** com `$state` runes
- Totalmente tipado com TypeScript
- Auto-contido (não precisa de props)
- Reutilizável em qualquer página
- Styled com Tailwind CSS
- Acessibilidade: avisos de click events são conhecidos

## 🔮 Melhorias Futuras

- [ ] Adicionar props para personalizar cores/textos
- [ ] Suporte a múltiplos backups (histórico)
- [ ] Exportar backup para nuvem (Google Drive, Dropbox)
- [ ] Backup automático periódico
- [ ] Comparação entre backups
- [ ] Preview dos dados antes de restaurar
- [ ] Compressão do arquivo JSON
- [ ] Criptografia opcional
