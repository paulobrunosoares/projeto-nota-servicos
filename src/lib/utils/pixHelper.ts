// ================================
// src/lib/utils/pixHelper.ts
// ================================

import QRCode from 'qrcode';
import type { ChavePix } from '$lib/types';

/**
 * Seleciona a chave Pix prioritária seguindo a ordem:
 * 1. Celular/Telefone
 * 2. CPF
 * 3. Primeira disponível
 */
export function selecionarChavePixPrioritaria(chavesPix: ChavePix[]): ChavePix | null {
	if (!chavesPix || chavesPix.length === 0) {
		return null;
	}

	// Prioridade 1: Celular ou Telefone
	const chaveCelular = chavesPix.find(
		(chave) =>
			chave.tipo.toLowerCase() === 'celular' ||
			chave.tipo.toLowerCase() === 'telefone' ||
			chave.tipo.toLowerCase() === 'phone'
	);
	if (chaveCelular) {
		return chaveCelular;
	}

	// Prioridade 2: CPF
	const chaveCPF = chavesPix.find((chave) => chave.tipo.toLowerCase() === 'cpf');
	if (chaveCPF) {
		return chaveCPF;
	}

	// Prioridade 3: Primeira disponível
	return chavesPix[0];
}

/**
 * Gera QR Code simples com APENAS o valor da chave PIX
 * O QR Code contém somente o número/valor (ex: "10277938783" ou "21998030152")
 * Isso permite que apps de banco reconheçam e leiam a chave diretamente
 */
export async function gerarQRCodePixSimples(
	chavesPix: ChavePix[]
): Promise<{ qrCodeDataURL: string; chaveSelecionada: ChavePix; textoChave: string } | null> {
	const chaveSelecionada = selecionarChavePixPrioritaria(chavesPix);

	if (!chaveSelecionada) {
		return null;
	}

	// Remove formatação da chave (mantém apenas números para CPF/telefone)
	let chaveFormatada = chaveSelecionada.chave;
	if (
		chaveSelecionada.tipo.toLowerCase() === 'cpf' ||
		chaveSelecionada.tipo.toLowerCase() === 'celular' ||
		chaveSelecionada.tipo.toLowerCase() === 'telefone'
	) {
		chaveFormatada = chaveSelecionada.chave.replace(/\D/g, ''); // Remove tudo que não for número
	}

	// QR Code contém APENAS o valor da chave (sem tipo=)
	// Isso permite que apps de banco leiam diretamente
	const qrCodeDataURL = await QRCode.toDataURL(chaveFormatada, {
		errorCorrectionLevel: 'M',
		type: 'image/png',
		width: 200,
		margin: 1,
		color: {
			dark: '#000000',
			light: '#FFFFFF'
		}
	});

	// Texto para exibição: "Tipo: valor"
	const textoChave = `${chaveSelecionada.tipo}: ${chaveFormatada}`;

	return {
		qrCodeDataURL,
		chaveSelecionada,
		textoChave
	};
}
