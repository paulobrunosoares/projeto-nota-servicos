export interface ItemServico {
	descricao: string;
	valor: number;
}

export interface ChavePix {
	tipo: string;
	chave: string;
}

export interface DadosEmpresa {
	nomeEmpresa: string;
	contato: string;
	subDescricao: string;
}

export interface DadosConta {
	nome: string;
	cpf: string;
	banco: string;
	agencia: string;
	conta: string;
}

export interface Metadata {
	dadosEmpresa: DadosEmpresa;
	dadosConta: DadosConta;
	chavesPix: ChavePix[];
}

export interface BackupData {
	versao: string;
	dataBackup: string;
	metadata: Metadata | null;
	itens: ItemServico[];
	itensPreDefinidos: ItemServico[];
}

export interface RestoreOptions {
	restaurarMetadata: boolean;
	restaurarItens: boolean;
	restaurarItensPreDefinidos: boolean;
}
