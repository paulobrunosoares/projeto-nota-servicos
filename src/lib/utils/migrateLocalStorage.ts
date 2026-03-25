/**
 * Script de migração do localStorage para IndexedDB
 * 
 * Este script verifica se existem dados no localStorage e os migra para o IndexedDB.
 * Após a migração bem-sucedida, os dados do localStorage são mantidos como backup
 * até que o usuário confirme que tudo está funcionando.
 */

import { indexedDBService } from '$lib/utils/indexedDB';
import type { ItemServico, Metadata } from '$lib/types';

// Chaves do localStorage (mesmas do store.ts original)
const ITENS_KEY = 'ordem-servicos-itens';
const ITENS_PREDEFINIDOS_KEY = 'ordem-servicos-itens-predefinidos';
const METADATA_KEY = 'ordem-servicos-metadata';
const MIGRACAO_KEY = 'indexeddb_migrado_v2';

interface MigracaoStatus {
	migrado: boolean;
	dataMigracao: string | null;
	itensMigrados: number;
	itensPreDefinidosMigrados: number;
	metadataMigrada: boolean;
	erro?: string;
}

/**
 * Verifica se já foi migrado
 */
export function foiMigrado(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(MIGRACAO_KEY) === 'true';
}

/**
 * Obtém status da migração
 */
export function getMigracaoStatus(): MigracaoStatus {
	if (typeof window === 'undefined') {
		return {
			migrado: false,
			dataMigracao: null,
			itensMigrados: 0,
			itensPreDefinidosMigrados: 0,
			metadataMigrada: false
		};
	}

	const migrado = localStorage.getItem(MIGRACAO_KEY) === 'true';
	const statusJson = localStorage.getItem(MIGRACAO_KEY + '_status');
	
	if (migrado && statusJson) {
		return JSON.parse(statusJson);
	}

	// Verificar dados disponíveis no localStorage
	const itensJson = localStorage.getItem(ITENS_KEY);
	const itensPreDefinidosJson = localStorage.getItem(ITENS_PREDEFINIDOS_KEY);
	const metadataJson = localStorage.getItem(METADATA_KEY);

	return {
		migrado,
		dataMigracao: null,
		itensMigrados: itensJson ? JSON.parse(itensJson).length : 0,
		itensPreDefinidosMigrados: itensPreDefinidosJson ? JSON.parse(itensPreDefinidosJson).length : 0,
		metadataMigrada: !!metadataJson
	};
}

/**
 * Executa a migração do localStorage para IndexedDB
 */
export async function migrarParaIndexedDB(): Promise<{
	sucesso: boolean;
	mensagem: string;
}> {
	if (typeof window === 'undefined') {
		return {
			sucesso: false,
			mensagem: 'Migração só pode ser executada no navegador'
		};
	}

	// Verificar se já foi migrado
	if (foiMigrado()) {
		return {
			sucesso: true,
			mensagem: 'Dados já foram migrados para IndexedDB'
		};
	}

	try {
		// Inicializar IndexedDB
		await indexedDBService.init();

		let itensMigrados = 0;
		let itensPreDefinidosMigrados = 0;
		let metadataMigrada = false;

		// Migrar itens de serviço
		const itensJson = localStorage.getItem(ITENS_KEY);
		if (itensJson) {
			const itens: ItemServico[] = JSON.parse(itensJson);
			if (itens.length > 0) {
				const itensComId = itens.map((item, index) => ({
					...item,
					id: index + 1
				}));
				await indexedDBService.putBatch('itens', itensComId);
				itensMigrados = itens.length;
				console.log(`✓ ${itens.length} itens migrados`);
			}
		}

		// Migrar itens pré-definidos
		const itensPreDefinidosJson = localStorage.getItem(ITENS_PREDEFINIDOS_KEY);
		if (itensPreDefinidosJson) {
			const itens: ItemServico[] = JSON.parse(itensPreDefinidosJson);
			if (itens.length > 0) {
				const itensComId = itens.map((item, index) => ({
					...item,
					id: index + 1
				}));
				await indexedDBService.putBatch('itensPreDefinidos', itensComId);
				itensPreDefinidosMigrados = itens.length;
				console.log(`✓ ${itens.length} itens pré-definidos migrados`);
			}
		}

		// Migrar metadata
		const metadataJson = localStorage.getItem(METADATA_KEY);
		if (metadataJson) {
			const metadata: Metadata = JSON.parse(metadataJson);
			await indexedDBService.put('metadata', {
				chave: 'empresa',
				dados: metadata
			});
			metadataMigrada = true;
			console.log('✓ Metadata migrada');
		}

		// Salvar status da migração
		const status: MigracaoStatus = {
			migrado: true,
			dataMigracao: new Date().toISOString(),
			itensMigrados,
			itensPreDefinidosMigrados,
			metadataMigrada
		};

		localStorage.setItem(MIGRACAO_KEY, 'true');
		localStorage.setItem(MIGRACAO_KEY + '_status', JSON.stringify(status));

		console.log('✓ Migração concluída com sucesso!');
		console.log(`  - Itens: ${itensMigrados}`);
		console.log(`  - Itens pré-definidos: ${itensPreDefinidosMigrados}`);
		console.log(`  - Metadata: ${metadataMigrada ? 'sim' : 'não'}`);

		return {
			sucesso: true,
			mensagem: `Migração concluída: ${itensMigrados} itens, ${itensPreDefinidosMigrados} pré-definidos, metadata ${metadataMigrada ? '' : 'não '}migrada`
		};
	} catch (error) {
		const erro = (error as Error).message;
		console.error('Erro na migração:', erro);
		
		return {
			sucesso: false,
			mensagem: `Erro na migração: ${erro}`
		};
	}
}

/**
 * Resetar status de migração (para testes ou re-migração)
 */
export function resetarMigracao(): void {
	if (typeof window === 'undefined') return;
	
	localStorage.removeItem(MIGRACAO_KEY);
	localStorage.removeItem(MIGRACAO_KEY + '_status');
	console.log('Status de migração resetado');
}

/**
 * Comparar dados entre localStorage e IndexedDB (para validação)
 */
export async function compararDados(): Promise<{
	iguais: boolean;
	diferencas: string[];
}> {
	if (typeof window === 'undefined') {
		return { iguais: false, diferencas: ['Ambiente não é navegador'] };
	}

	const diferencas: string[] = [];

	// Comparar itens
	const itensLocal = localStorage.getItem(ITENS_KEY);
	const itensIndexedDB = await indexedDBService.getAll('itens');
	
	if (itensLocal) {
		const itensLocalParsed: ItemServico[] = JSON.parse(itensLocal);
		if (itensLocalParsed.length !== itensIndexedDB.length) {
			diferencas.push(`Itens: localStorage=${itensLocalParsed.length}, IndexedDB=${itensIndexedDB.length}`);
		}
	} else if (itensIndexedDB.length > 0) {
		diferencas.push(`Itens: localStorage=vazio, IndexedDB=${itensIndexedDB.length}`);
	}

	// Comparar itens pré-definidos
	const itensPreDefinidosLocal = localStorage.getItem(ITENS_PREDEFINIDOS_KEY);
	const itensPreDefinidosIndexedDB = await indexedDBService.getAll('itensPreDefinidos');
	
	if (itensPreDefinidosLocal) {
		const itensPreDefinidosLocalParsed: ItemServico[] = JSON.parse(itensPreDefinidosLocal);
		if (itensPreDefinidosLocalParsed.length !== itensPreDefinidosIndexedDB.length) {
			diferencas.push(`Pré-definidos: localStorage=${itensPreDefinidosLocalParsed.length}, IndexedDB=${itensPreDefinidosIndexedDB.length}`);
		}
	} else if (itensPreDefinidosIndexedDB.length > 0) {
		diferencas.push(`Pré-definidos: localStorage=vazio, IndexedDB=${itensPreDefinidosIndexedDB.length}`);
	}

	// Comparar metadata
	const metadataLocal = localStorage.getItem(METADATA_KEY);
	const metadataIndexedDB = await indexedDBService.get('metadata', 'empresa');
	
	if (metadataLocal && metadataIndexedDB) {
		const metadataLocalParsed: Metadata = JSON.parse(metadataLocal);
		if (JSON.stringify(metadataLocalParsed) !== JSON.stringify(metadataIndexedDB.dados)) {
			diferencas.push('Metadata: dados diferentes');
		}
	} else if (metadataLocal && !metadataIndexedDB) {
		diferencas.push('Metadata: existe no localStorage, não no IndexedDB');
	} else if (!metadataLocal && metadataIndexedDB) {
		diferencas.push('Metadata: não existe no localStorage, existe no IndexedDB');
	}

	return {
		iguais: diferencas.length === 0,
		diferencas
	};
}

/**
 * Executar migração automática no startup da aplicação
 * Deve ser chamado apenas no client-side
 */
export async function inicializarApp(): Promise<void> {
	if (typeof window === 'undefined') return;
	
	// Sempre inicializar o IndexedDB
	await indexedDBService.init();
	
	// Executar migração se necessário
	if (!foiMigrado()) {
		console.log('Dados não migrados, executando migração...');
		const resultado = await migrarParaIndexedDB();
		if (!resultado.sucesso) {
			console.error('Falha na migração:', resultado.mensagem);
		}
	} else {
		console.log('Dados já migrados para IndexedDB');
	}
}
