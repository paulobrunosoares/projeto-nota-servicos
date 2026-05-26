import type { ItemServico, Metadata, BackupData, RestoreOptions, RestoreResult } from './types';

const ITENS_KEY = 'ordem-servicos-itens';
const ITENS_PREDEFINIDOS_KEY = 'ordem-servicos-itens-predefinidos';
const METADATA_KEY = 'ordem-servicos-metadata';
const BACKUP_VERSION = '1.0.0';

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

// Funções para Backup e Restauração
export function criarBackup(): BackupData {
	return {
		versao: BACKUP_VERSION,
		dataBackup: new Date().toISOString(),
		metadata: carregarMetadata(),
		itens: carregarItens(),
		itensPreDefinidos: carregarItensPreDefinidos()
	};
}

export function exportarBackup(): void {
	if (typeof window === 'undefined') return;

	const backup = criarBackup();
	const json = JSON.stringify(backup, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	const dataFormatada = new Date().toISOString().split('T')[0];
	link.href = url;
	link.download = `backup-nota-servicos-${dataFormatada}.json`;
	link.click();

	URL.revokeObjectURL(url);
}

export function restaurarBackup(backup: BackupData, options: RestoreOptions): RestoreResult {
	if (typeof window === 'undefined') {
		return {
			sucesso: false,
			mensagem: 'Restauração só pode ser executada no navegador',
			itensRestaurados: {
				metadata: false,
				itens: false,
				itensPreDefinidos: false
			}
		};
	}

	const resultado: RestoreResult = {
		sucesso: true,
		mensagem: 'Backup restaurado com sucesso!',
		itensRestaurados: {
			metadata: false,
			itens: false,
			itensPreDefinidos: false
		}
	};

	try {
		// Restaurar Metadata
		if (options.restaurarMetadata && backup.metadata) {
			salvarMetadata(backup.metadata);
			// Verificar se foi salvo corretamente
			const verificacao = carregarMetadata();
			if (verificacao) {
				resultado.itensRestaurados.metadata = true;
			} else {
				throw new Error('Falha ao salvar configurações da empresa');
			}
		}

		// Restaurar Itens
		if (options.restaurarItens) {
			salvarItens(backup.itens || []);
			// Verificar se foi salvo corretamente
			const verificacao = carregarItens();
			if (Array.isArray(verificacao)) {
				resultado.itensRestaurados.itens = true;
			} else {
				throw new Error('Falha ao salvar itens de serviço');
			}
		}

		// Restaurar Itens Pré-definidos
		if (options.restaurarItensPreDefinidos) {
			salvarItensPreDefinidos(backup.itensPreDefinidos || []);
			// Verificar se foi salvo corretamente
			const verificacao = carregarItensPreDefinidos();
			if (Array.isArray(verificacao)) {
				resultado.itensRestaurados.itensPreDefinidos = true;
			} else {
				throw new Error('Falha ao salvar itens pré-definidos');
			}
		}

		// Disparar evento de storage para notificar outras abas/janelas
		// Isso permite que outras abas abertas saibam que os dados mudaram
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'backup-restaurado',
				newValue: new Date().toISOString(),
				url: window.location.href
			})
		);

		return resultado;
	} catch (error) {
		return {
			sucesso: false,
			mensagem: `Erro ao restaurar backup: ${(error as Error).message}`,
			itensRestaurados: resultado.itensRestaurados
		};
	}
}

export function validarBackup(data: unknown): data is BackupData {
	if (!data || typeof data !== 'object') return false;

	const backup = data as Partial<BackupData>;

	return (
		typeof backup.versao === 'string' &&
		typeof backup.dataBackup === 'string' &&
		(backup.metadata === null || typeof backup.metadata === 'object') &&
		Array.isArray(backup.itens) &&
		Array.isArray(backup.itensPreDefinidos)
	);
}
