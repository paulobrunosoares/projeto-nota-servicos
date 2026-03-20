// ================================
// src/routes/api/pdf/+server.ts
// ================================

import { PDFDocument, StandardFonts, rgb, type PDFFont, type Color } from 'pdf-lib';

interface ItemServico {
	id: number;
	descricao: string;
	valor: number;
}

interface ChavePix {
	tipo: string;
	chave: string;
}

interface DadosEmpresa {
	nomeEmpresa: string;
	contato: string;
	subDescricao: string;
}

interface DadosConta {
	nome: string;
	cpf: string;
	banco: string;
	agencia: string;
	conta: string;
}

interface Metadata {
	dadosEmpresa: DadosEmpresa;
	dadosConta: DadosConta;
	chavesPix: ChavePix[];
}

export async function POST({ request }) {
	const body = await request.json();

	const { dataServico, itens, valorTotal, metadata } = body as {
		dataServico: string;
		itens: ItemServico[];
		valorTotal: number;
		metadata: Metadata;
	};

	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595, 842]);
	const { width, height } = page.getSize();

	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

	let currentY = height - 50;

	// Função auxiliar para desenhar texto
	const drawText = (
		text: string,
		x: number,
		y: number,
		options: { font?: PDFFont; size?: number; color?: Color } = {}
	) => {
		page.drawText(text, {
			x,
			y,
			size: options.size || 12,
			font: options.font || fontRegular,
			color: options.color || rgb(0, 0, 0)
		});
	};

	// Função para desenhar retângulo
	const drawRectangle = (
		x: number,
		y: number,
		w: number,
		h: number,
		color: { r: number; g: number; b: number },
		filled = true,
		borderWidth = 0.5
	) => {
		page.drawRectangle({
			x,
			y,
			width: w,
			height: h,
			color: rgb(color.r, color.g, color.b),
			borderColor: rgb(0.8, 0.8, 0.8),
			borderWidth: filled ? 0 : borderWidth
		});
	};

	// Função para formatar valor em Reais
	const formatarValor = (valor: number): string => {
		return valor.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	};

	// === CABEÇALHO ===
	// Título
	drawRectangle(50, currentY - 30, width - 100, 30, { r: 0.2, g: 0.4, b: 0.8 });
	drawText('NOTA DE SERVIÇO', width / 2 - 70, currentY - 18, {
		font: fontBold,
		size: 18,
		color: rgb(1, 1, 1)
	});
	currentY -= 50;

	// Informações do prestador
	drawText(metadata.dadosEmpresa.nomeEmpresa, 50, currentY, {
		font: fontBold,
		size: 12
	});
	currentY -= 20;
	drawText(`Contato: ${metadata.dadosEmpresa.contato}`, 50, currentY, { size: 11 });
	currentY -= 20;
	drawText(`Data do Serviço: ${dataServico}`, 50, currentY, {
		font: fontBold,
		size: 11
	});
	currentY -= 35;

	// === LINHA SEPARADORA ===
	drawRectangle(50, currentY, width - 100, 1, { r: 0.7, g: 0.7, b: 0.7 });
	currentY -= 30;

	// === TABELA DE SERVIÇOS ===
	// Cabeçalho da tabela
	const tableTop = currentY;
	const rowHeight = 25;
	const colDescWidth = 380;
	const colValorWidth = 115;

	// Fundo do cabeçalho
	drawRectangle(50, tableTop - rowHeight, colDescWidth, rowHeight, { r: 0.95, g: 0.95, b: 0.95 });
	drawRectangle(50 + colDescWidth, tableTop - rowHeight, colValorWidth, rowHeight, {
		r: 0.95,
		g: 0.95,
		b: 0.95
	});

	// Bordas do cabeçalho
	drawRectangle(
		50,
		tableTop - rowHeight,
		colDescWidth,
		rowHeight,
		{ r: 0.6, g: 0.6, b: 0.6 },
		false,
		0.5
	);
	drawRectangle(
		50 + colDescWidth,
		tableTop - rowHeight,
		colValorWidth,
		rowHeight,
		{ r: 0.6, g: 0.6, b: 0.6 },
		false,
		0.5
	);

	// Textos do cabeçalho
	drawText('Descrição do Serviço', 60, tableTop - rowHeight + 8, {
		font: fontBold,
		size: 10
	});
	drawText('Valor (R$)', 50 + colDescWidth + 30, tableTop - rowHeight + 8, {
		font: fontBold,
		size: 10
	});

	currentY = tableTop - rowHeight;

	// === ITENS DA TABELA ===
	itens.forEach((item, index) => {
		const itemY = currentY - rowHeight;

		// Fundo alternado
		if (index % 2 === 0) {
			drawRectangle(50, itemY, colDescWidth, rowHeight, { r: 0.98, g: 0.98, b: 0.98 });
			drawRectangle(50 + colDescWidth, itemY, colValorWidth, rowHeight, {
				r: 0.98,
				g: 0.98,
				b: 0.98
			});
		}

		// Bordas
		drawRectangle(50, itemY, colDescWidth, rowHeight, { r: 0.7, g: 0.7, b: 0.7 }, false, 0.5);
		drawRectangle(
			50 + colDescWidth,
			itemY,
			colValorWidth,
			rowHeight,
			{ r: 0.7, g: 0.7, b: 0.7 },
			false,
			0.5
		);

		// Conteúdo
		const descricao =
			item.descricao.length > 50 ? item.descricao.substring(0, 50) + '...' : item.descricao;
		drawText(descricao, 60, itemY + 8, { size: 10 });
		drawText(formatarValor(item.valor), 50 + colDescWidth + 30, itemY + 8, {
			size: 10,
			font: fontRegular
		});

		currentY = itemY;
	});

	// === LINHA DO TOTAL ===
	const totalY = currentY - rowHeight - 5;

	// Fundo do total
	drawRectangle(50, totalY, colDescWidth, rowHeight, { r: 0.85, g: 0.92, b: 1 });
	drawRectangle(50 + colDescWidth, totalY, colValorWidth, rowHeight, { r: 0.85, g: 0.92, b: 1 });

	// Bordas do total
	drawRectangle(50, totalY, colDescWidth, rowHeight, { r: 0.6, g: 0.6, b: 0.6 }, false, 0.8);
	drawRectangle(
		50 + colDescWidth,
		totalY,
		colValorWidth,
		rowHeight,
		{ r: 0.6, g: 0.6, b: 0.6 },
		false,
		0.8
	);

	// Texto do total
	drawText('VALOR TOTAL', 60, totalY + 8, { font: fontBold, size: 11 });
	drawText(`R$ ${formatarValor(valorTotal)}`, 50 + colDescWidth + 30, totalY + 8, {
		font: fontBold,
		size: 12,
		color: rgb(0.1, 0.3, 0.7)
	});

	// === RODAPÉ ===
	let footerY = 110;

	// Dados Bancários
	if (metadata.dadosConta && metadata.dadosConta.banco && metadata.dadosConta.banco.trim() !== '') {
		drawText('Dados Bancários:', 50, footerY, {
			font: fontBold,
			size: 10,
			color: rgb(0.2, 0.2, 0.2)
		});
		footerY -= 15;

		// Nome do titular
		if (metadata.dadosConta.nome) {
			drawText(`Nome: ${metadata.dadosConta.nome}`, 50, footerY, {
				size: 9,
				color: rgb(0.3, 0.3, 0.3)
			});
			footerY -= 14;
		}

		// CPF
		if (metadata.dadosConta.cpf) {
			const cpfFormatado = metadata.dadosConta.cpf.replace(
				/(\d{3})(\d{3})(\d{3})(\d{2})/,
				'$1.$2.$3-$4'
			);
			drawText(`CPF: ${cpfFormatado}`, 50, footerY, {
				size: 9,
				color: rgb(0.3, 0.3, 0.3)
			});
			footerY -= 14;
		}

		// Banco, Agência e Conta
		const textosBanco: string[] = [];
		if (metadata.dadosConta.banco) textosBanco.push(`Banco: ${metadata.dadosConta.banco}`);
		if (metadata.dadosConta.agencia) textosBanco.push(`Agência: ${metadata.dadosConta.agencia}`);
		if (metadata.dadosConta.conta) textosBanco.push(`Conta: ${metadata.dadosConta.conta}`);

		const textoBancario = textosBanco.join(' | ');
		drawText(textoBancario, 50, footerY, {
			size: 9,
			color: rgb(0.3, 0.3, 0.3)
		});
		footerY -= 18;
	}

	// Chaves PIX
	if (metadata.chavesPix && metadata.chavesPix.length > 0) {
		drawText('Pagamento via PIX:', 50, footerY, {
			font: fontBold,
			size: 10,
			color: rgb(0.2, 0.2, 0.2)
		});
		footerY -= 15;

		metadata.chavesPix.forEach((chavePix) => {
			const textoChave = `${chavePix.tipo}: ${chavePix.chave}`;
			drawText(textoChave, 50, footerY, {
				size: 9,
				color: rgb(0.3, 0.3, 0.3)
			});
			footerY -= 14;
		});

		footerY -= 5;
	}

	// Linha separadora do rodapé
	drawRectangle(50, footerY - 5, width - 100, 1, { r: 0.7, g: 0.7, b: 0.7 });
	drawText(
		'Obrigado pela preferência! Em caso de dúvidas, entre em contato.',
		width / 2 - 180,
		footerY - 20,
		{ size: 9, color: rgb(0.4, 0.4, 0.4) }
	);

	const pdfBytes = await pdfDoc.save();

	return new Response(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'inline; filename="nota-servico.pdf"'
		}
	});
}
