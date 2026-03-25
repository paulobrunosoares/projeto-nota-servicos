# Persistência de Dados com IndexedDB

## Visão Geral

O **IndexedDB** é uma solução de armazenamento no navegador que oferece capacidades muito superiores ao localStorage:

| Característica | localStorage | IndexedDB |
|---------------|--------------|-----------|
| Capacidade | ~5-10MB | ~50MB+ (depende do navegador) |
| Tipo de dados | Apenas strings | Qualquer tipo (objetos, arrays, blobs) |
| Operações | Síncronas | Assíncronas (não bloqueia a UI) |
| Indexação | Não suporta | Suporta índices e consultas complexas |
| Transações | Não suporta | Suporta transações ACID |

---

## Implementação Básica

### 1. Wrapper Simples para IndexedDB

```typescript
// utils/indexedDB.ts

class IndexedDBService {
  private dbName = 'OrdemServicoDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Inicializar o banco de dados
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar object stores (tabelas)
        if (!db.objectStoreNames.contains('ordens')) {
          const store = db.createObjectStore('ordens', { keyPath: 'id', autoIncrement: true });
          store.createIndex('cliente', 'cliente', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('dataCriacao', 'dataCriacao', { unique: false });
        }

        if (!db.objectStoreNames.contains('clientes')) {
          const store = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
          store.createIndex('email', 'email', { unique: true });
          store.createIndex('telefone', 'telefone', { unique: false });
        }
      };
    });
  }

  // Garantir que o DB está inicializado
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // CREATE - Adicionar um registro
  async add<T>(storeName: string, data: T): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data as any);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Buscar por ID
  async get<T>(storeName: string, id: number | string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as T || null);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Buscar todos
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  // UPDATE - Atualizar um registro
  async update<T>(storeName: string, data: T & { id: number | string }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data as any);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // DELETE - Remover um registro
  async delete(storeName: string, id: number | string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // QUERY - Buscar por índice
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar toda a store
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Fechar conexão
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();
```

---

## Uso com Svelte Stores

### 2. Svelte Store Persistente

```typescript
// stores/persistentStore.ts
import { writable } from 'svelte/store';
import { indexedDBService } from '../utils/indexedDB';

interface PersistentStoreConfig<T> {
  name: string;
  storeName: string;
  defaultValue?: T;
}

export function createPersistentStore<T>({
  name,
  storeName,
  defaultValue
}: PersistentStoreConfig<T>) {
  const store = writable<T>(defaultValue as T);
  let initialized = false;

  // Carregar dados do IndexedDB
  async function load() {
    if (initialized) return;
    
    await indexedDBService.init();
    const data = await indexedDBService.get<T>(storeName, name);
    
    if (data) {
      store.set(data);
    } else if (defaultValue) {
      await indexedDBService.add(storeName, { id: name, ...defaultValue });
    }
    
    initialized = true;
  }

  // Salvar dados no IndexedDB
  async function save(value: T) {
    await indexedDBService.init();
    await indexedDBService.update(storeName, { id: name, ...value } as any);
  }

  // Subscribe com auto-save
  const { subscribe } = store;
  
  return {
    subscribe,
    load,
    save,
    set: async (value: T) => {
      store.set(value);
      await save(value);
    },
    update: async (updater: (value: T) => T) => {
      store.update(updater);
      const currentValue = (store as any).value;
      await save(currentValue);
    }
  };
}
```

---

## Exemplo Prático: Ordem de Serviço

### 3. Store Específica para Ordens de Serviço

```typescript
// stores/ordensStore.ts
import { writable, get } from 'svelte/store';
import { indexedDBService } from '../utils/indexedDB';

export interface OrdemServico {
  id?: number;
  cliente: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  dataCriacao: string;
  dataConclusao?: string;
  valor?: number;
}

// Inicializar o banco
await indexedDBService.init();

// Store principal
const ordens = writable<OrdemServico[]>([]);

// Carregar todas as ordens
export async function loadOrdens() {
  const data = await indexedDBService.getAll<OrdemServico>('ordens');
  ordens.set(data);
  return data;
}

// Adicionar nova ordem
export async function addOrdem(ordem: Omit<OrdemServico, 'id'>) {
  const id = await indexedDBService.add('ordens', {
    ...ordem,
    dataCriacao: new Date().toISOString()
  });
  
  // Atualizar store local
  ordens.update(items => [...items, { ...ordem, id, dataCriacao: new Date().toISOString() }]);
  
  return id;
}

// Atualizar ordem
export async function updateOrdem(ordem: OrdemServico) {
  await indexedDBService.update('ordens', ordem);
  ordens.update(items => items.map(o => o.id === ordem.id ? ordem : o));
}

// Remover ordem
export async function deleteOrdem(id: number) {
  await indexedDBService.delete('ordens', id);
  ordens.update(items => items.filter(o => o.id !== id));
}

// Buscar por status
export async function getOrdensByStatus(status: string) {
  return await indexedDBService.getByIndex<OrdemServico>('ordens', 'status', status);
}

// Exportar store e ações
export const ordensStore = {
  subscribe: ordens.subscribe,
  load: loadOrdens,
  add: addOrdem,
  update: updateOrdem,
  delete: deleteOrdem,
  getByStatus: getOrdensByStatus
};
```

---

## Uso nos Componentes Svelte

### 4. Componente de Listagem

```svelte
<!-- routes/ordens/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { ordensStore, type OrdemServico } from '$stores/ordensStore';

  let carregando = true;

  onMount(async () => {
    await ordensStore.load();
    carregando = false;
  });
</script>

<div class="container">
  <h1>Ordens de Serviço</h1>
  
  {#if carregando}
    <p>Carregando...</p>
  {:else}
    <ul>
      {#each $ordensStore as ordem}
        <li class="ordem-item">
          <span class="status {ordem.status}">{ordem.status}</span>
          <strong>{ordem.cliente}</strong>
          <p>{ordem.descricao}</p>
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

---

## Migração do localStorage

### 5. Script de Migração

```typescript
// utils/migrateLocalStorage.ts
import { indexedDBService } from './indexedDB';

export async function migrateFromLocalStorage() {
  await indexedDBService.init();

  // Verificar se já foi migrado
  const migrado = localStorage.getItem('indexeddb_migrado');
  if (migrado) {
    console.log('Dados já foram migrados');
    return;
  }

  try {
    // Migrar ordens de serviço
    const ordensLocal = localStorage.getItem('ordens');
    if (ordensLocal) {
      const ordens = JSON.parse(ordensLocal);
      for (const ordem of ordens) {
        await indexedDBService.add('ordens', ordem);
      }
      console.log(`✓ ${ordens.length} ordens migradas`);
    }

    // Migrar clientes
    const clientesLocal = localStorage.getItem('clientes');
    if (clientesLocal) {
      const clientes = JSON.parse(clientesLocal);
      for (const cliente of clientes) {
        await indexedDBService.add('clientes', cliente);
      }
      console.log(`✓ ${clientes.length} clientes migrados`);
    }

    // Marcar como migrado
    localStorage.setItem('indexeddb_migrado', 'true');
    console.log('✓ Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
    throw error;
  }
}

// Executar migração no startup da aplicação
export async function initializeApp() {
  await migrateFromLocalStorage();
  // ... resto da inicialização
}
```

---

## Considerações de Performance

### 6. Otimizações

```typescript
// utils/indexedDBOptimized.ts

// Usar cursor para grandes volumes de dados
async function getAllWithCursor<T>(storeName: string): Promise<T[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const results: T[] = [];

    const cursor = store.openCursor();
    
    cursor.onsuccess = (event) => {
      const c = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (c) {
        results.push(c.value as T);
        c.continue();
      } else {
        resolve(results);
      }
    };
    
    cursor.onerror = () => reject(cursor.error);
  });
}

// Transações múltiplas em batch
async function addBatch<T>(storeName: string, items: T[]): Promise<void> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    for (const item of items) {
      store.add(item as any);
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
```

---

## Debug e Monitoramento

### 7. Ferramentas de Debug

```typescript
// utils/dbDebug.ts
import { indexedDBService } from './indexedDB';

export async function getDBInfo() {
  await indexedDBService.init();
  const db = (indexedDBService as any).db;

  return {
    name: db.name,
    version: db.version,
    objectStores: Array.from(db.objectStoreNames),
    // Estimativa de uso (API experimental)
    usage: navigator.storage?.estimate 
      ? await navigator.storage.estimate() 
      : 'Não suportado'
  };
}

// Limpar banco para desenvolvimento
export async function clearDatabase() {
  const dbName = 'OrdemServicoDB';
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => {
      console.log('✓ Banco de dados limpo');
      resolve(true);
    };
    request.onerror = () => reject(request.error);
  });
}
```

---

## Recursos Adicionais

### Links Úteis

- [MDN - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [IndexedDB Promisified (idb)](https://github.com/jakearchibald/idb) - Biblioteca popular que simplifica o uso
- [Dexie.js](https://dexie.org/) - Wrapper mais amigável para IndexedDB

### Quando Usar

✅ **Use IndexedDB quando:**
- Precisar armazenar grandes volumes de dados (>5MB)
- Trabalhar com dados complexos (objetos, arrays)
- Precisar de consultas e indexação
- Quiser evitar bloqueio da UI (operações assíncronas)

❌ **Use localStorage quando:**
- Dados simples e pequenos (<5MB)
- Precisar de acesso síncrono imediato
- Dados apenas em formato string
- Compatibilidade com navegadores muito antigos

---

## Conclusão

O IndexedDB oferece uma alternativa robusta e escalável ao localStorage, ideal para aplicações que necessitam de:

- Maior capacidade de armazenamento
- Consultas complexas e indexação
- Armazenamento de dados estruturados
- Performance não-bloqueante

A implementação acima fornece uma base sólida para persistência de dados no seu projeto de Ordens de Serviço com Svelte.
