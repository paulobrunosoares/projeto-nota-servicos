type DataBRFormatada = {
	yyyyMMdd?: string;
	ddMMyyyy?: string;
	ddMMyyyyHHmmss?: string;
	yyyyMMddHHmmss?: string;
	ddMMyyyy_HHmmss?: string;
	yyyyMMdd_HHmmss?: string;
	ddMMyyHHmmss?: string;
};

type DataBRFormatadaOptions = {
	date?: string;
	format?: keyof DataBRFormatada;
};

// Helper para padding otimizado (evita múltiplas chamadas a padStart)
const pad = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

export function getDataBRFormatada(options: DataBRFormatadaOptions): string {
	const { date, format } = options;

	const dataCurrent = date ? new Date(date) : new Date();
	const dataBR = new Date(dataCurrent.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

	// Lazy evaluation: calcular apenas o necessário para cada formato
	const getYear = () => dataBR.getFullYear();
	const getMonth = () => pad(dataBR.getMonth() + 1);
	const getDay = () => pad(dataBR.getDate());
	const getHours = () => pad(dataBR.getHours());
	const getMinutes = () => pad(dataBR.getMinutes());
	const getSeconds = () => pad(dataBR.getSeconds());

	switch (format) {
		case 'yyyyMMdd': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			return `${year}-${month}-${day}`;
		}
		case 'ddMMyyyy': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			return `${day}/${month}/${year}`;
		}
		case 'ddMMyyyy_HHmmss': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			const hours = getHours();
			const minutes = getMinutes();
			const seconds = getSeconds();
			return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
		}
		case 'yyyyMMdd_HHmmss': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			const hours = getHours();
			const minutes = getMinutes();
			const seconds = getSeconds();
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		}
		case 'ddMMyyyyHHmmss': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			const hours = getHours();
			const minutes = getMinutes();
			const seconds = getSeconds();
			return `${day}${month}${year}${hours}${minutes}${seconds}`;
		}
		case 'yyyyMMddHHmmss': {
			const year = getYear();
			const month = getMonth();
			const day = getDay();
			const hours = getHours();
			const minutes = getMinutes();
			const seconds = getSeconds();
			return `${year}${month}${day}${hours}${minutes}${seconds}`;
		}
		default: {
			const yearShort = String(getYear()).slice(-2);
			const month = getMonth();
			const day = getDay();
			const hours = getHours();
			const minutes = getMinutes();
			const seconds = getSeconds();

			return `${day}${month}${yearShort}${hours}${minutes}${seconds}`;
		}
	}
}
