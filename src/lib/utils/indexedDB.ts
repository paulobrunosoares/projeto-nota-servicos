/**
 * Serviço de IndexedDB para persistência de dados
 * Alternativa ao localStorage com maior capacidade e performance
 * 
 * NOTA: Este módulo só funciona no browser. No servidor (SSR),
 * as operações são no-ops ou retornam valores padrão.
 */

type StoreName = 'itens' | 'itensPreDefinidos' | 'metadata' | 'configuracoes';

interface IndexedDBConfig {
	dbName: string;
	version: number;
	stores: StoreName[];
}

class IndexedDBService {
	private dbName = 'OrdemServicoDB';
	private version = 1;
	private db: IDBDatabase | null = null;
	private initPromise: Promise<void> | null = null;
	private isBrowser: boolean;

	constructor() {
		// Verificar se está no browser
		this.isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
	}

	/**
	 * Inicializa o banco de dados IndexedDB
	 * No servidor, esta função é um no-op
	 */
	async init(): Promise<void> {
		// No servidor, não faz nada
		if (!this.isBrowser) {
			return Promise.resolve();
		}

		if (this.db) {
			return Promise.resolve();
		}

		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => {
				console.error('Erro ao abrir IndexedDB:', request.error);
				this.initPromise = null;
				reject(request.error);
			};

			request.onsuccess = () => {
				this.db = request.result;
				this.db.onversionchange = () => {
					console.log('Versão do banco mudou, fechando conexão...');
				};
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Criar object stores se não existirem
				if (!db.objectStoreNames.contains('itens')) {
					const store = db.createObjectStore('itens', { keyPath: 'id', autoIncrement: true });
					store.createIndex('descricao', 'descricao', { unique: false });
				}

				if (!db.objectStoreNames.contains('itensPreDefinidos')) {
					const store = db.createObjectStore('itensPreDefinidos', {
						keyPath: 'id',
						autoIncrement: true
					});
					store.createIndex('descricao', 'descricao', { unique: false });
				}

				if (!db.objectStoreNames.contains('metadata')) {
					db.createObjectStore('metadata', { keyPath: 'chave' });
				}

				if (!db.objectStoreNames.contains('configuracoes')) {
					db.createObjectStore('configuracoes', { keyPath: 'chave' });
				}
			};
		});

		return this.initPromise;
	}

	/**
	 * Garante que o DB está inicializado
	 */
	private async ensureDB(): Promise<IDBDatabase> {
		if (!this.db) {
			await this.init();
		}
		return this.db!;
	}

	/**
	 * CREATE - Adicionar um registro
	 */
	async add<T extends Record<string, unknown>>(
		storeName: StoreName,
		data: T
	): Promise<number> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.add() chamado no servidor - operação ignorada');
			return Promise.resolve(0);
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.add(data);

			request.onsuccess = () => resolve(request.result as number);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * READ - Buscar por ID
	 */
	async get<T>(storeName: StoreName, id: number | string): Promise<T | null> {
		if (!this.isBrowser) {
			return Promise.resolve(null);
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.get(id);

			request.onsuccess = () => resolve((request.result as T) || null);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * READ - Buscar todos os registros
	 */
	async getAll<T>(storeName: StoreName): Promise<T[]> {
		if (!this.isBrowser) {
			return Promise.resolve([]);
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result as T[]);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * UPDATE - Atualizar ou criar um registro (upsert)
	 */
	async put<T extends Record<string, unknown>>(
		storeName: StoreName,
		data: T & { id?: number | string; chave?: string }
	): Promise<number | string> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.put() chamado no servidor - operação ignorada');
			return Promise.resolve(0);
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.put(data as any);

			request.onsuccess = () => resolve(request.result as number | string);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * DELETE - Remover um registro
	 */
	async delete(storeName: StoreName, id: number | string): Promise<void> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.delete() chamado no servidor - operação ignorada');
			return Promise.resolve();
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * CLEAR - Limpar toda a store
	 */
	async clear(storeName: StoreName): Promise<void> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.clear() chamado no servidor - operação ignorada');
			return Promise.resolve();
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * QUERY - Buscar por índice
	 */
	async getByIndex<T>(
		storeName: StoreName,
		indexName: string,
		value: unknown
	): Promise<T[]> {
		if (!this.isBrowser) {
			return Promise.resolve([]);
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);

			if (!store.indexNames.contains(indexName)) {
				reject(new Error(`Índice "${indexName}" não existe na store "${storeName}"`));
				return;
			}

			const index = store.index(indexName);
			const request = index.getAll(value);

			request.onsuccess = () => resolve(request.result as T[]);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * BATCH - Adicionar múltiplos registros em transação
	 */
	async addBatch<T extends Record<string, unknown>>(
		storeName: StoreName,
		items: T[]
	): Promise<void> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.addBatch() chamado no servidor - operação ignorada');
			return Promise.resolve();
		}
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

	/**
	 * BATCH - Atualizar múltiplos registros em transação
	 */
	async putBatch<T extends Record<string, unknown>>(
		storeName: StoreName,
		items: T[]
	): Promise<void> {
		if (!this.isBrowser) {
			console.warn('IndexedDB.putBatch() chamado no servidor - operação ignorada');
			return Promise.resolve();
		}
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);

			for (const item of items) {
				store.put(item as any);
			}

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
	}

	/**
	 * Fechar conexão (útil para testes ou limpeza)
	 */
	close(): void {
		if (this.db) {
			this.db.close();
			this.db = null;
			this.initPromise = null;
		}
	}

	/**
	 * Obter informações do banco de dados (debug)
	 */
	async getInfo(): Promise<{
		name: string;
		version: number;
		objectStores: string[];
	}> {
		if (!this.isBrowser) {
			return {
				name: 'N/A (Server)',
				version: 0,
				objectStores: []
			};
		}
		await this.init();
		const db = this.db!;

		return {
			name: db.name,
			version: db.version,
			objectStores: Array.from(db.objectStoreNames)
		};
	}
}

// Exportar instância singleton
export const indexedDBService = new IndexedDBService();

// Exportar tipos
export type { StoreName };
