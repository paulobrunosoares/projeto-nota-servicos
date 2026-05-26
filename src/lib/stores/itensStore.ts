/**
 * Store persistente para Itens de Serviço usando IndexedDB
 * Substitui o localStorage pelo IndexedDB para maior capacidade e performance
 *
 * NOTA: Todas as funções são assíncronas e só funcionam no browser.
 * No servidor, retornam valores vazios/default.
 */

import { indexedDBService, type StoreName } from '$lib/utils/indexedDB';
import type { ItemServico, Metadata } from '$lib/types';

// Interfaces internas com ID
export interface ItemServicoComId extends ItemServico {
	id: number;
}

export interface MetadataComChave {
	chave: string;
	dados: Metadata;
}

// ==================== ITENS DE SERVIÇO ====================

/**
 * Carregar todos os itens de serviço
 */
export async function carregarItens(): Promise<ItemServicoComId[]> {
	await indexedDBService.init();
	const itens = await indexedDBService.getAll<ItemServicoComId>('itens');
	return itens.sort((a, b) => a.id - b.id);
}

/**
 * Salvar lista completa de itens (substitui todos)
 */
export async function salvarItens(itens: ItemServico[]): Promise<void> {
	await indexedDBService.clear('itens');

	if (itens.length > 0) {
		// Adicionar IDs sequenciais se não existirem
		const itensComId = itens.map((item, index) => ({
			...item,
			id: (item as ItemServicoComId).id || index + 1
		}));
		await indexedDBService.putBatch('itens', itensComId);
	}
}

/**
 * Adicionar um único item
 */
export async function adicionarItem(item: ItemServico): Promise<number> {
	return await indexedDBService.add('itens', item as ItemServicoComId);
}

/**
 * Remover um item por ID
 */
export async function removerItem(id: number): Promise<void> {
	await indexedDBService.delete('itens', id);
}

/**
 * Limpar todos os itens
 */
export async function limparItens(): Promise<void> {
	await indexedDBService.clear('itens');
}

// ==================== ITENS PRÉ-DEFINIDOS ====================

/**
 * Carregar todos os itens pré-definidos
 */
export async function carregarItensPreDefinidos(): Promise<ItemServicoComId[]> {
	const itens = await indexedDBService.getAll<ItemServicoComId>('itensPreDefinidos');
	return itens.sort((a, b) => a.id - b.id);
}

/**
 * Salvar lista completa de itens pré-definidos (substitui todos)
 */
export async function salvarItensPreDefinidos(itens: ItemServico[]): Promise<void> {
	await indexedDBService.clear('itensPreDefinidos');

	if (itens.length > 0) {
		const itensComId = itens.map((item, index) => ({
			...item,
			id: (item as ItemServicoComId).id || index + 1
		}));
		await indexedDBService.putBatch('itensPreDefinidos', itensComId);
	}
}

/**
 * Adicionar um único item pré-definido
 */
export async function adicionarItemPreDefinido(item: ItemServico): Promise<number> {
	return await indexedDBService.add('itensPreDefinidos', item as ItemServicoComId);
}

/**
 * Remover um item pré-definido por ID
 */
export async function removerItemPreDefinido(id: number): Promise<void> {
	await indexedDBService.delete('itensPreDefinidos', id);
}

/**
 * Limpar todos os itens pré-definidos
 */
export async function limparItensPreDefinidos(): Promise<void> {
	await indexedDBService.clear('itensPreDefinidos');
}

// ==================== METADATA ====================

const METADATA_CHAVE = 'empresa';

/**
 * Carregar metadata da empresa
 */
export async function carregarMetadata(): Promise<Metadata | null> {
	await indexedDBService.init();
	const result = await indexedDBService.get<MetadataComChave>('metadata', METADATA_CHAVE);
	return result?.dados || null;
}

/**
 * Salvar metadata da empresa
 */
export async function salvarMetadata(metadata: Metadata): Promise<void> {
	await indexedDBService.init();
	await indexedDBService.put('metadata', {
		chave: METADATA_CHAVE,
		dados: metadata
	});
}

/**
 * Obter metadata padrão
 */
export function getMetadataDefault(): Metadata {
	return {
		dadosEmpresa: {
			nomeEmpresa: 'Minha Empresa LTDA',
			contato: '(11) 1234-5678',
			subDescricao: 'Serviços de qualidade para você',
			cidade: 'São Paulo'
		},
		dadosConta: {
			nome: 'João da Silva',
			cpf: '123.456.789-00',
			banco: 'Banco do Brasil',
			agencia: '1234',
			conta: '56789-0'
		},
		chavesPix: [
			{ tipo: 'CPF', chave: '123.456.789-00' },
			{ tipo: 'E-mail', chave: 'joao.silva@example.com' }
		]
	};
}

// ==================== UTILITÁRIOS ====================

/**
 * Obter informações do banco de dados (para debug)
 */
export async function getDBInfo(): Promise<{
	name: string;
	version: number;
	objectStores: string[];
}> {
	return await indexedDBService.getInfo();
}

/**
 * Limpar todo o banco de dados (cuidado!)
 */
export async function limparBancoDados(): Promise<void> {
	await Promise.all([
		indexedDBService.clear('itens'),
		indexedDBService.clear('itensPreDefinidos'),
		indexedDBService.clear('metadata'),
		indexedDBService.clear('configuracoes')
	]);
}

/**
 * Exportar todos os dados para backup
 */
export async function exportarDados(): Promise<{
	itens: ItemServicoComId[];
	itensPreDefinidos: ItemServicoComId[];
	metadata: Metadata | null;
	dataExportacao: string;
}> {
	const [itens, itensPreDefinidos, metadata] = await Promise.all([
		carregarItens(),
		carregarItensPreDefinidos(),
		carregarMetadata()
	]);

	return {
		itens,
		itensPreDefinidos,
		metadata,
		dataExportacao: new Date().toISOString()
	};
}

/**
 * Importar dados de backup
 */
export async function importarDados(dados: {
	itens?: ItemServico[];
	itensPreDefinidos?: ItemServico[];
	metadata?: Metadata;
}): Promise<void> {
	const promises: Promise<void>[] = [];

	if (dados.itens) {
		promises.push(salvarItens(dados.itens));
	}

	if (dados.itensPreDefinidos) {
		promises.push(salvarItensPreDefinidos(dados.itensPreDefinidos));
	}

	if (dados.metadata) {
		promises.push(salvarMetadata(dados.metadata));
	}

	await Promise.all(promises);
}
