<script lang="ts">
	import { onMount } from 'svelte';
	import {
		carregarMetadata,
		getMetadataDefault,
		salvarItens,
		carregarItens,
		carregarItensPreDefinidos,
		salvarItensPreDefinidos
	} from '$lib/store';
	import type { ItemServico as ItemServicoBase, Metadata } from '$lib/types';
	import { getDataBRFormatada } from '$lib/helper/format-date.helper';

	interface ItemServico extends ItemServicoBase {
		id: number;
	}

	let dataServico = $state(getDataBRFormatada({ format: 'ddMMyyyy' }));
	let novaDescricao = $state('');
	let novoValor = $state('');
	let itens: ItemServico[] = $derived([]);
	let itensPreDefinidos: ItemServico[] = $state([]);
	let proximoId = 1;
	let nomeEmpresa = $state('Minha Empresa LTDA');
	let contatoEmpresa = $state('(21) 98663-3011');
	let servicoSelecionado = $state('');
	let metadata = $state<Metadata>(getMetadataDefault());

	let valorTotal = $derived(itensPreDefinidos.reduce((acc, item) => acc + item.valor, 0));

	const reCarregarItens = () => {
		itens = carregarItens().map((item, index) => ({ ...item, id: index + 1 }));
	};
	const reCarregarItensPreDefinidos = () => {
		itensPreDefinidos = carregarItensPreDefinidos().map((item, index) => ({
			...item,
			id: index + 1
		}));
	};
	// Função para recarregar todos os dados
	const recarregarTodosDados = () => {
		metadata = carregarMetadata() || getMetadataDefault();
		nomeEmpresa = metadata.dadosEmpresa.nomeEmpresa;
		contatoEmpresa = metadata.dadosEmpresa.contato;
		reCarregarItens();
		reCarregarItensPreDefinidos();
	};

	// Carregar metadados da empresa e itens salvos ao iniciar
	onMount(() => {
		recarregarTodosDados();

		// Listener para mudanças no localStorage (backup restaurado em outra aba)
		const handleStorageChange = (e: StorageEvent) => {
			if (
				e.key === 'ordem-servicos-metadata' ||
				e.key === 'ordem-servicos-itens' ||
				e.key === 'ordem-servicos-itens-predefinidos'
			) {
				recarregarTodosDados();
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	});

	function adicionarItem() {
		if (!novaDescricao.trim() || !novoValor.trim()) {
			alert('Preencha a descrição e o valor do item');
			return;
		}

		const valor = parseFloat(novoValor.replace(',', '.'));
		if (isNaN(valor) || valor <= 0) {
			alert('Valor inválido');
			return;
		}

		itensPreDefinidos = [
			...itensPreDefinidos,
			{
				id: proximoId++,
				descricao: novaDescricao.trim(),
				valor: valor
			}
		];

		// verificar se o item adicionado já existe na lista de itens predefinidos
		const itemExistente = itens?.find(
			(item) => item.descricao === novaDescricao.trim() && item.valor === valor
		);

		if (!itemExistente) {
			// console.log('itemExistente: ', itemExistente, itens.length);
			// Salvar itens no localStorage
			itens.push({ id: proximoId++, descricao: novaDescricao.trim(), valor });
			const itensSemId = itens.length
				? itens.map(({ descricao, valor }) => ({ descricao, valor }))
				: [{ descricao: novaDescricao.trim(), valor }];
			salvarItens(itensSemId);
			reCarregarItens();
		}

		const itensPreDefinidosSemId = itensPreDefinidos.map(({ descricao, valor }) => ({
			descricao,
			valor
		}));
		salvarItensPreDefinidos(itensPreDefinidosSemId);

		novaDescricao = '';
		novoValor = '';
		servicoSelecionado = '';
	}

	function selecionarServico() {
		if (servicoSelecionado) {
			const servicoData = JSON.parse(servicoSelecionado);
			novaDescricao = servicoData.descricao;
			novoValor = servicoData.valor.toString().replace('.', ',');
		}
	}

	function removerItem(id: number) {
		itens = itens.filter((item) => item.id !== id);

		// Salvar itens atualizados no localStorage
		const itensSemId = itens.map(({ descricao, valor }) => ({
			descricao,
			valor
		}));
		salvarItens(itensSemId);
	}

	function removerItemPreDefinidos(id: number) {
		itensPreDefinidos = itensPreDefinidos.filter((item) => item.id !== id);

		// Salvar itens atualizados no localStorage
		const itensPreDefinidosSemId = itensPreDefinidos.map(({ descricao, valor }) => ({
			descricao,
			valor
		}));
		salvarItensPreDefinidos(itensPreDefinidosSemId);
	}

	function formatarValor(valor: number): string {
		return valor.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	async function gerarPDF() {
		if (itensPreDefinidos.length === 0) {
			alert('Adicione pelo menos um item de serviço');
			return;
		}

		// Recarregar metadata para garantir que esteja atualizado
		metadata = carregarMetadata() || getMetadataDefault();

		const res = await fetch('/api/pdf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				dataServico,
				itens: itensPreDefinidos,
				valorTotal,
				metadata
			})
		});

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);

		// Criar link temporário para download
		const link = document.createElement('a');
		link.href = url;
		// data +horário para evitar nome de arquivo duplicado ex: yymmdd-hhmmss
		const dataTimeExtract = getDataBRFormatada({ format: 'ddMMyyHHmmss' });
		link.download = `nota-servico-${dataTimeExtract}.pdf`;
		link.click();

		// Liberar memória
		URL.revokeObjectURL(url);

		// clean nos itens pré-definidos para evitar que sejam re-adicionados ao gerar o PDF
		itensPreDefinidos = [];
		salvarItensPreDefinidos([]);
	}

	let viewItenssalvos = $state(false);
	const toggleViewItensSalvos = () => {
		viewItenssalvos = !viewItenssalvos;
	};
</script>

<div class="flex h-screen flex-col bg-linear-to-br from-slate-100 to-slate-200">
	<div class="mx-auto flex h-full w-full max-w-5xl flex-col">
		<div class="flex h-full flex-col bg-white shadow-xl">
			<!-- Header -->
			<div class="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-white">Nota de Serviço</h1>
						<p class="mt-1 text-sm text-blue-100">{nomeEmpresa}</p>
					</div>
					<button
						onclick={() => (window.location.href = '/config')}
						class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="hidden sm:inline">Configurações</span>
					</button>
				</div>
			</div>

			<!-- Conteúdo -->
			<div class="flex-1 space-y-4 overflow-y-auto p-6">
				<!-- Data do Serviço -->
				<div>
					<label for="dataServico" class="mb-1 block text-sm font-semibold text-gray-700">
						Data do Serviço
					</label>
					<input
						id="dataServico"
						type="text"
						bind:value={dataServico}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
						placeholder="DD/MM/AAAA"
					/>
				</div>

				<!-- Seção de Adicionar Item -->
				<div class="rounded-xl border border-blue-100 bg-blue-50 p-2">
					<div class="flex items-center justify-between">
						<h2 class="mb-3 text-lg font-bold text-gray-800">Adicionar Item de Serviço</h2>
						<span
							class="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
						>
							<button onclick={toggleViewItensSalvos} class="flex items-center gap-2 rounded-lg">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
										clip-rule="evenodd"
									/>
								</svg>
								{itens.length} itens salvos
							</button>
						</span>
					</div>
					<!-- visualizar lista de servicos salvos do localStorage -->
					{#if viewItenssalvos}
						<!-- Pré-visualização dos Itens -->
						{#if itens.length > 0}
							<div class="mb-1 flex flex-col border border-gray-200 bg-gray-50">
								<h2 class="m-1 text-center text-lg font-bold text-gray-800">Serviços Salvos</h2>

								<div class="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm">
									<!-- Cabeçalho da tabela -->
									<table class="w-full">
										<thead class="sticky top-0 border-b border-gray-200 bg-gray-100">
											<tr>
												<th
													class="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
												>
													Descrição
												</th>
												<th
													class="px-4 py-2 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase"
												>
													Valor
												</th>
												<th
													class="w-20 px-4 py-2 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase"
												>
													Ação
												</th>
											</tr>
										</thead>
									</table>

									<!-- Corpo da tabela com scroll -->
									<div class="max-h-60 overflow-y-auto">
										<table class="w-full">
											<tbody class="divide-y divide-gray-200">
												{#each itens as item (item.id)}
													<tr class="transition-colors hover:bg-gray-50">
														<td class="px-4 py-2 text-sm text-gray-800">
															{item.descricao}
														</td>
														<td class="px-4 py-2 text-right text-sm font-medium text-gray-800">
															R$ {formatarValor(item.valor)}
														</td>
														<td class="w-20 px-4 py-2 text-center">
															<button
																onclick={() => removerItem(item.id)}
																class="p-1 text-red-600 transition-colors hover:text-red-800"
																title="Remover item"
															>
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	class="h-5 w-5"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																>
																	<path
																		fill-rule="evenodd"
																		d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
																		clip-rule="evenodd"
																	/>
																</svg>
															</button>
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						{/if}
					{/if}

					<!-- Select de Serviços Salvos -->
					{#if itens.length > 0}
						<div class="mb-3">
							<label
								for="servicoPredefinido"
								class="mb-1 block text-sm font-semibold text-gray-700"
							>
								Selecionar Serviço da Lista
							</label>
							<select
								id="servicoPredefinido"
								bind:value={servicoSelecionado}
								onchange={selecionarServico}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
							>
								<option value="">-- Selecione um serviço --</option>
								{#each itens as item (item.id)}
									<option value={JSON.stringify({ descricao: item.descricao, valor: item.valor })}>
										{item.descricao}
									</option>
								{/each}
							</select>
						</div>
					{/if}

					<div class="mb-3 grid gap-3 md:grid-cols-2">
						<div>
							<label for="novaDescricao" class="mb-1 block text-sm font-semibold text-gray-700">
								Descrição do Serviço
							</label>
							<input
								id="novaDescricao"
								type="text"
								bind:value={novaDescricao}
								onkeypress={(e) => e.key === 'Enter' && adicionarItem()}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Ex: Instalação de SSD 480GB"
							/>
						</div>

						<div>
							<label for="novoValor" class="mb-1 block text-sm font-semibold text-gray-700">
								Valor (R$)
							</label>
							<input
								id="novoValor"
								type="text"
								bind:value={novoValor}
								onkeypress={(e) => e.key === 'Enter' && adicionarItem()}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Ex: 130,00"
							/>
						</div>
					</div>
					<button
						onclick={adicionarItem}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
								clip-rule="evenodd"
							/>
						</svg>
						Adicionar Item
					</button>
				</div>

				<!-- Pré-visualização dos Itens -->
				{#if itensPreDefinidos.length > 0}
					<div class="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-1 sm:p-4">
						<div class="mb-1 flex items-center justify-between">
							<h2 class="text-lg font-bold text-gray-800">Itens Pré-Definidos</h2>
							<button
								onclick={() => {
									itensPreDefinidos = [];
									salvarItensPreDefinidos([]);
								}}
								class="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-red-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1	0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
								Limpar
							</button>
							<span
								class="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
							>
								{itensPreDefinidos.length} itens
							</span>
						</div>

						<div class="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm">
							<!-- Cabeçalho da tabela -->
							<table class="w-full">
								<thead class="sticky top-0 border-b border-gray-200 bg-gray-100">
									<tr>
										<th
											class="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
										>
											Descrição
										</th>
										<th
											class="px-4 py-2 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase"
										>
											Valor
										</th>
										<th
											class="w-20 px-4 py-2 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase"
										>
											Ação
										</th>
									</tr>
								</thead>
							</table>

							<!-- Corpo da tabela com scroll -->
							<div class="max-h-60 overflow-y-auto">
								<table class="w-full">
									<tbody class="divide-y divide-gray-200">
										{#each itensPreDefinidos as item (item.id)}
											<tr class="transition-colors hover:bg-gray-50">
												<td class="px-4 py-2 text-sm text-gray-800">
													{item.descricao}
												</td>
												<td class="px-4 py-2 text-right text-sm font-medium text-gray-800">
													R$ {formatarValor(item.valor)}
												</td>
												<td class="w-20 px-4 py-2 text-center">
													<button
														onclick={() => removerItemPreDefinidos(item.id)}
														class="p-1 text-red-600 transition-colors hover:text-red-800"
														title="Remover item"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-5 w-5"
															viewBox="0 0 20 20"
															fill="currentColor"
														>
															<path
																fill-rule="evenodd"
																d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
																clip-rule="evenodd"
															/>
														</svg>
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>

							<!-- Rodapé da tabela -->
							<table class="w-full">
								<tfoot class="border-t-2 border-blue-300 bg-linear-to-r from-blue-50 to-blue-100">
									<tr>
										<td class="px-4 py-3 text-sm font-bold text-gray-800"> VALOR TOTAL </td>
										<td class="px-4 py-3 text-right text-lg font-bold text-blue-700">
											R$ {formatarValor(valorTotal)}
										</td>
										<td class="w-20"></td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				{:else}
					<div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mx-auto mb-2 h-10 w-10 text-yellow-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="font-medium text-yellow-800">Nenhum item adicionado ainda</p>
						<p class="mt-1 text-sm text-yellow-600">
							Adicione itens de serviço usando o formulário acima
						</p>
					</div>
				{/if}

				<!-- Botão Gerar PDF -->
				<button
					onclick={gerarPDF}
					disabled={itensPreDefinidos.length === 0}
					class="flex w-full transform items-center justify-center gap-2 rounded-lg bg-linear-to-r from-green-600 to-green-700 px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-green-800 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
					Gerar Nota de Serviço
				</button>
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-200 bg-white px-6 py-3 text-center text-sm text-gray-600">
				<p>Contato: {contatoEmpresa}</p>
			</div>
		</div>
	</div>
</div>
