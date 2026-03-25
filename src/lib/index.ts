// IndexedDB - Persistência de dados
export { indexedDBService } from './utils/indexedDB';
export type { StoreName } from './utils/indexedDB';

// Migração localStorage -> IndexedDB
export {
	migrarParaIndexedDB,
	foiMigrado,
	getMigracaoStatus,
	resetarMigracao,
	compararDados,
	inicializarApp
} from './utils/migrateLocalStorage';

// Stores persistentes
export * from './stores/itensStore';
