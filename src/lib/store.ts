import type { ItemServico, Metadata } from './types';

const ITENS_KEY = 'ordem-servicos-itens';
const ITENS_PREDEFINIDOS_KEY = 'ordem-servicos-itens-predefinidos';
const METADATA_KEY = 'ordem-servicos-metadata';

// Funções para gerenciar itens
export function salvarItens(itens: ItemServico[]): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ITENS_KEY, JSON.stringify(itens));
	}
}

export function carregarItens(): ItemServico[] {
	if (typeof window !== 'undefined') {
		const data = localStorage.getItem(ITENS_KEY);
		return data ? JSON.parse(data) : [];
	}
	return [];
}

export function limparItens(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ITENS_KEY);
	}
}

// Funções para gerenciar itens pré-definidos
export function salvarItensPreDefinidos(itens: ItemServico[]): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ITENS_PREDEFINIDOS_KEY, JSON.stringify(itens));
	}
}

export function carregarItensPreDefinidos(): ItemServico[] {
	if (typeof window !== 'undefined') {
		const data = localStorage.getItem(ITENS_PREDEFINIDOS_KEY);
		return data ? JSON.parse(data) : [];
	}
	return [];
}

export function limparItensPreDefinidos(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ITENS_PREDEFINIDOS_KEY);
	}
}

// Funções para gerenciar metadata
export function salvarMetadata(metadata: Metadata): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
	}
}

export function carregarMetadata(): Metadata | null {
	if (typeof window !== 'undefined') {
		const data = localStorage.getItem(METADATA_KEY);
		return data ? JSON.parse(data) : null;
	}
	return null;
}

export function getMetadataDefault(): Metadata {
	// Gerar dados mock para a metadata
	return {
		dadosEmpresa: {
			nomeEmpresa: 'Minha Empresa LTDA',
			contato: '(11) 1234-5678',
			subDescricao: 'Serviços de qualidade para você'
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
