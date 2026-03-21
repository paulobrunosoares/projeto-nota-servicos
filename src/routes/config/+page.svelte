<script lang="ts">
	import { onMount } from 'svelte';
	import { startConfigTour } from '$lib/helper/tour.helper';
	import { salvarMetadata, carregarMetadata, getMetadataDefault } from '$lib/store';
	import type { ChavePix } from '$lib/types';
	import { BackupRestauracao } from '$lib/components';

	let nomeEmpresa = $state('');
	let contato = $state('');
	let subDescricao = $state('');
	let nomeTitular = $state('');
	let cpf = $state('');
	let banco = $state('');
	let agencia = $state('');
	let conta = $state('');
	let chavesPix: ChavePix[] = $state([]);

	let novoTipoPix = $state('');
	let novaChavePix = $state('');

	// Função para recarregar todos os dados
	const recarregarDados = () => {
		const metadata = carregarMetadata() || getMetadataDefault();
		nomeEmpresa = metadata.dadosEmpresa.nomeEmpresa;
		contato = metadata.dadosEmpresa.contato;
		subDescricao = metadata.dadosEmpresa.subDescricao;
		nomeTitular = metadata.dadosConta.nome;
		cpf = metadata.dadosConta.cpf;
		banco = metadata.dadosConta.banco;
		agencia = metadata.dadosConta.agencia;
		conta = metadata.dadosConta.conta;
		chavesPix = metadata.chavesPix;
	};

	onMount(() => {
		recarregarDados();

		// Listener para mudanças no localStorage (backup restaurado em outra aba)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'ordem-servicos-metadata') {
				recarregarDados();
			}
		};

		window.addEventListener('storage', handleStorageChange);

		// Disparar tour se for o primeiro acesso
		if (!localStorage.getItem('tourConfigRealizado')) {
			setTimeout(() => {
				startConfigTour();
				localStorage.setItem('tourConfigRealizado', 'true');
			}, 500);
		}

		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	});

	function adicionarChavePix() {
		if (!novoTipoPix.trim() || !novaChavePix.trim()) {
			alert('Preencha o tipo e a chave PIX');
			return;
		}

		chavesPix = [...chavesPix, { tipo: novoTipoPix, chave: novaChavePix }];
		novoTipoPix = '';
		novaChavePix = '';
	}

	function removerChavePix(index: number) {
		chavesPix = chavesPix.filter((_, i) => i !== index);
	}

	function salvar() {
		const metadata = {
			dadosEmpresa: {
				nomeEmpresa,
				contato,
				subDescricao
			},
			dadosConta: {
				nome: nomeTitular,
				cpf,
				banco,
				agencia,
				conta
			},
			chavesPix
		};

		salvarMetadata(metadata);
		alert('Configurações salvas com sucesso!');
	}

	function voltar() {
		window.history.back();
	}
</script>

<div class="flex h-screen flex-col bg-linear-to-br from-slate-100 to-slate-200">
	<div class="mx-auto flex h-full w-full max-w-5xl flex-col">
		<div class="flex h-full flex-col bg-white shadow-xl">
			<!-- Header -->
			<div class="bg-linear-to-r from-purple-600 to-purple-700 px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-white">Configurações da Empresa</h1>
						<p class="mt-1 text-sm text-purple-100">Gerencie os dados da sua empresa</p>
					</div>
					<div class="flex flex-row gap-2">
						<button
							onclick={() => startConfigTour()}
							class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
							title="Guia de Uso"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
							</svg>
							<span class="hidden sm:inline">Ajuda</span>
						</button>
						<button
							onclick={voltar}
							class="rounded-lg bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
						>
							← Voltar
						</button>
					</div>
				</div>
			</div>

			<!-- Conteúdo -->
			<div class="flex-1 space-y-6 overflow-y-auto p-6">
				<!-- Dados da Empresa -->
				<div id="tour-dados-empresa" class="rounded-xl border border-purple-100 bg-purple-50 p-4">
					<h2 class="mb-3 text-lg font-bold text-gray-800">Dados da Empresa</h2>

					<div class="space-y-3">
						<div>
							<label for="nomeEmpresa" class="mb-1 block text-sm font-semibold text-gray-700">
								Nome da Empresa
							</label>
							<input
								id="nomeEmpresa"
								type="text"
								bind:value={nomeEmpresa}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
								placeholder="Ex: Minha Empresa LTDA"
							/>
						</div>

						<div>
							<label for="contato" class="mb-1 block text-sm font-semibold text-gray-700">
								Contato
							</label>
							<input
								id="contato"
								type="text"
								bind:value={contato}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
								placeholder="Ex: (21) 98456-7890"
							/>
						</div>

						<div>
							<label for="subDescricao" class="mb-1 block text-sm font-semibold text-gray-700">
								Descrição
							</label>
							<input
								id="subDescricao"
								type="text"
								bind:value={subDescricao}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
								placeholder="Ex: Serviços de Informática"
							/>
						</div>
					</div>
				</div>

				<!-- Dados Bancários -->
				<div id="tour-dados-bancarios" class="rounded-xl border border-blue-100 bg-blue-50 p-4">
					<h2 class="mb-3 text-lg font-bold text-gray-800">Dados Bancários</h2>

					<div class="space-y-3">
						<div>
							<label for="nomeTitular" class="mb-1 block text-sm font-semibold text-gray-700">
								Nome do Titular
							</label>
							<input
								id="nomeTitular"
								type="text"
								bind:value={nomeTitular}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Ex: Carlos Silva"
							/>
						</div>

						<div>
							<label for="cpf" class="mb-1 block text-sm font-semibold text-gray-700"> CPF </label>
							<input
								id="cpf"
								type="text"
								bind:value={cpf}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Ex: 123.456.789-00"
							/>
						</div>

						<div>
							<label for="banco" class="mb-1 block text-sm font-semibold text-gray-700">
								Banco/Instituição
							</label>
							<input
								id="banco"
								type="text"
								bind:value={banco}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
								placeholder="Ex: Banco do Brasil"
							/>
						</div>

						<div class="grid gap-3 md:grid-cols-2">
							<div>
								<label for="agencia" class="mb-1 block text-sm font-semibold text-gray-700">
									Agência
								</label>
								<input
									id="agencia"
									type="text"
									bind:value={agencia}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
									placeholder="Ex: 1234-5"
								/>
							</div>

							<div>
								<label for="conta" class="mb-1 block text-sm font-semibold text-gray-700">
									Conta
								</label>
								<input
									id="conta"
									type="text"
									bind:value={conta}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
									placeholder="Ex: 12345-6"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Chaves PIX -->
				<div id="tour-chaves-pix" class="rounded-xl border border-green-100 bg-green-50 p-4">
					<h2 class="mb-3 text-lg font-bold text-gray-800">Chaves PIX</h2>

					<div class="mb-3 grid gap-3 md:grid-cols-2">
						<div>
							<label for="tipoPix" class="mb-1 block text-sm font-semibold text-gray-700">
								Tipo
							</label>
							<select
								id="tipoPix"
								bind:value={novoTipoPix}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
							>
								<option value="">Selecione o tipo</option>
								<option value="CPF">CPF</option>
								<option value="CNPJ">CNPJ</option>
								<option value="Email">Email</option>
								<option value="Telefone">Telefone</option>
								<option value="Chave Aleatória">Chave Aleatória</option>
							</select>
						</div>

						<div>
							<label for="chavePix" class="mb-1 block text-sm font-semibold text-gray-700">
								Chave
							</label>
							<input
								id="chavePix"
								type="text"
								bind:value={novaChavePix}
								onkeypress={(e) => e.key === 'Enter' && adicionarChavePix()}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
								placeholder="Ex: 123.456.789-00"
							/>
						</div>
					</div>

					<button
						onclick={adicionarChavePix}
						class="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-green-700"
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
						Adicionar Chave PIX
					</button>

					<!-- Lista de Chaves PIX -->
					{#if chavesPix.length > 0}
						<div class="space-y-2">
							{#each chavesPix as chavePix, index (index)}
								<div
									class="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3"
								>
									<div>
										<span class="font-semibold text-gray-700">{chavePix.tipo}:</span>
										<span class="ml-2 text-gray-600">{chavePix.chave}</span>
									</div>
									<button
										onclick={() => removerChavePix(index)}
										class="p-1 text-red-600 transition-colors hover:text-red-800"
										title="Remover chave"
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
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Backup e Restauração -->
				<div id="tour-backup"><BackupRestauracao /></div>

				<!-- Botão Salvar -->
				<button
					id="btn-salvar-config"
					onclick={salvar}
					class="flex w-full transform items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl"
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
							d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
						/>
					</svg>
					Salvar Configurações
				</button>
			</div>
		</div>
	</div>
</div>
