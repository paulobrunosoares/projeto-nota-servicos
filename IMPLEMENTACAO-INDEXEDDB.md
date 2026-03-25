# Implementação IndexedDB - Resumo

## Visão Geral

A persistência de dados foi migrada do localStorage para o **IndexedDB**, oferecendo:

- ✅ Maior capacidade de armazenamento (~50MB+ vs ~5MB)
- ✅ Operações assíncronas (não bloqueia a UI)
- ✅ Suporte a dados complexos (objetos, arrays)
- ✅ Indexação e consultas mais eficientes
- ✅ Transações ACID
- ✅ **Suporte a SSR** - No servidor, as operações são no-ops seguros

## Importante: SSR (Server-Side Rendering)

O IndexedDB só está disponível no browser. Para suportar SSR no SvelteKit:

- Todas as funções verificam `typeof window !== 'undefined'`
- No servidor, retornam valores vazios/default sem erros
- A inicialização ocorre apenas no `onMount` dos componentes

```typescript
// Padrão usado em todos os componentes
onMount(() => {
  inicializarApp().then(() => {
    recarregarTodosDados();
  });
});
```

## Arquivos Criados

### 1. `src/lib/utils/indexedDB.ts`
Wrapper principal do IndexedDB com métodos:
- `init()` - Inicializa o banco de dados
- `add()` - Adiciona registro
- `get()` - Busca por ID
- `getAll()` - Busca todos
- `put()` - Atualiza/cria (upsert)
- `delete()` - Remove registro
- `clear()` - Limpa store
- `addBatch()` / `putBatch()` - Operações em lote

### 2. `src/lib/stores/itensStore.ts`
Store persistente para dados da aplicação:
- `carregarItens()` / `salvarItens()`
- `carregarItensPreDefinidos()` / `salvarItensPreDefinidos()`
- `carregarMetadata()` / `salvarMetadata()`
- `adicionarItem()` / `removerItem()`
- `exportarDados()` / `importarDados()`

### 3. `src/lib/utils/migrateLocalStorage.ts`
Script de migração automática:
- `inicializarApp()` - Inicializa e migra se necessário
- `migrarParaIndexedDB()` - Executa migração
- `foiMigrado()` - Verifica status da migração
- `compararDados()` - Valida migração

## Arquivos Atualizados

### `src/routes/+page.svelte`
- Migração para funções assíncronas do IndexedDB
- Auto-migração no onMount
- Funções `adicionarItem()`, `removerItem()`, `gerarPDF()` atualizadas

### `src/routes/config/+page.svelte`
- Função `salvar()` agora assíncrona
- Carregamento de metadata via IndexedDB

### `src/lib/components/BackupRestauracao.svelte`
- Backup/exportação usando `exportarDados()`
- Restauração usando `importarDados()`
- Estado de carregamento na UI

### `src/lib/index.ts`
- Exportação de todos os módulos IndexedDB

## Como Usar

### No Client-Side (componentes Svelte)

```typescript
import { 
  carregarItens, 
  salvarItens,
  carregarMetadata 
} from '$lib/stores/itensStore';

// Carregar dados
const itens = await carregarItens();
const metadata = await carregarMetadata();

// Salvar dados
await salvarItens(novosItens);
```

### Migração Automática

A migração do localStorage para IndexedDB ocorre automaticamente na primeira execução:

```typescript
import { inicializarApp } from '$lib/utils/migrateLocalStorage';

// No onMount do componente principal
onMount(() => {
  inicializarApp().then(() => {
    // Dados migrados, pode usar normalmente
  });
});
```

### Verificar Status da Migração

```typescript
import { foiMigrado, getMigracaoStatus } from '$lib/utils/migrateLocalStorage';

if (foiMigrado()) {
  console.log('Dados já migrados para IndexedDB');
}

const status = getMigracaoStatus();
console.log(status);
// { migrado: true, itensMigrados: 10, ... }
```

## Estrutura do Banco de Dados

```
OrdemServicoDB (v1)
├── itens
│   ├── id (autoIncrement)
│   ├── descricao
│   └── valor
├── itensPreDefinidos
│   ├── id (autoIncrement)
│   ├── descricao
│   └── valor
├── metadata
│   └── chave: 'empresa'
└── configuracoes (reserva para futuro)
```

## Debug

```typescript
import { getDBInfo, limparBancoDados } from '$lib/stores/itensStore';

// Ver informações do banco
const info = await getDBInfo();
console.log(info);
// { name: 'OrdemServicoDB', version: 1, objectStores: [...] }

// Limpar banco (cuidado!)
await limparBancoDados();
```

## Compatibilidade

O IndexedDB é suportado em:
- ✅ Chrome/Edge 57+
- ✅ Firefox 52+
- ✅ Safari 10+
- ✅ Opera 44+

Para navegadores muito antigos, o fallback seria implementar um wrapper que usa localStorage.

## Próximos Passos (Opcional)

1. **Adicionar fallback para localStorage** em navegadores sem IndexedDB
2. **Implementar sincronização** com backend (se aplicável)
3. **Adicionar versionamento** do schema para futuras migrações
4. **Implementar cache** para operações frequentes

## Rollback (se necessário)

Para voltar ao localStorage:

1. Reverter imports nos componentes para `$lib/store`
2. Manter o arquivo `INDEXEDDB-PERSISTENCIA.md` como referência futura
