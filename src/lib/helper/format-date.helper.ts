type DataBRFormatada = {
	yyyyMMdd?: string;
	ddMMyyyy?: string;
	ddMMyyyyHHmmss?: string;
	yyyyMMddHHmmss?: string;
	ddMMyyyy_HHmmss?: string;
	yyyyMMdd_HHmmss?: string;
};

type DataBRFormatadaOptions = {
	date?: string;
	format?: keyof DataBRFormatada;
};

export function getDataBRFormatada(options: DataBRFormatadaOptions): string {
	const { date, format } = options;

	const dataCurrent = date ? new Date(date) : new Date();

	const dataBR = new Date(dataCurrent.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

	const yy = String(dataBR.getFullYear()).slice(-2);
	const MM = String(dataBR.getMonth() + 1).padStart(2, '0');
	const dd = String(dataBR.getDate()).padStart(2, '0');

	const HH = String(dataBR.getHours()).padStart(2, '0');
	const mm = String(dataBR.getMinutes()).padStart(2, '0');
	const ss = String(dataBR.getSeconds()).padStart(2, '0');

	switch (format) {
		case 'yyyyMMdd':
			return `${dataBR.getFullYear()}-${MM}-${dd}`;
		case 'ddMMyyyy':
			return `${dd}/${MM}/${dataBR.getFullYear()}`;
		case 'ddMMyyyy_HHmmss':
			return `${dd}/${MM}/${dataBR.getFullYear()} ${HH}:${mm}:${ss}`;
		case 'yyyyMMdd_HHmmss':
			return `${dataBR.getFullYear()}-${MM}-${dd} ${HH}:${mm}:${ss}`;
		case 'ddMMyyyyHHmmss':
			return `${dd}${MM}${dataBR.getFullYear()}${HH}${mm}${ss}`;
		case 'yyyyMMddHHmmss':
			return `${dataBR.getFullYear()}${MM}${dd}${HH}${mm}${ss}`;
		default:
			return `${dd}/${MM}/${yy}`;
	}
}
