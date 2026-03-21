<script lang="ts">
	import { onMount } from 'svelte';
	import {
		salvarMetadata,
		carregarMetadata,
		getMetadataDefault,
		exportarBackup,
		restaurarBackup,
		validarBackup
	} from '$lib/store';
	import type { ChavePix, BackupData } from '$lib/types';

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

	// Variáveis para Backup/Restauração
	let mostrarModalRestaurar = $state(false);
	let backupParaRestaurar: BackupData | null = $state(null);
	let restaurarMetadata = $state(true);
	let restaurarItens = $state(true);
	let restaurarItensPreDefinidos = $state(true);
	let fileInput: HTMLInputElement | null = null;

	onMount(() => {
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

	// Funções de Backup
	function fazerBackup() {
		exportarBackup();
		alert('Backup criado com sucesso!');
	}

	function selecionarArquivoBackup() {
		fileInput?.click();
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		try {
			const texto = await file.text();
			const dados = JSON.parse(texto);

			if (!validarBackup(dados)) {
				alert('Arquivo de backup inválido!');
				return;
			}

			backupParaRestaurar = dados;
			mostrarModalRestaurar = true;
		} catch (error) {
			alert('Erro ao ler o arquivo de backup: ' + (error as Error).message);
		}

		// Limpar input
		input.value = '';
	}

	function confirmarRestauracao() {
		if (!backupParaRestaurar) return;

		const confirmacao = confirm(
			'Tem certeza que deseja restaurar o backup? Os dados atuais serão substituídos.'
		);

		if (!confirmacao) return;

		restaurarBackup(backupParaRestaurar, {
			restaurarMetadata,
			restaurarItens,
			restaurarItensPreDefinidos
		});

		alert('Backup restaurado com sucesso! Recarregando página...');
		window.location.reload();
	}

	function cancelarRestauracao() {
		mostrarModalRestaurar = false;
		backupParaRestaurar = null;
		restaurarMetadata = true;
		restaurarItens = true;
		restaurarItensPreDefinidos = true;
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
					<button
						onclick={voltar}
						class="rounded-lg bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
					>
						← Voltar
					</button>
				</div>
			</div>

			<!-- Conteúdo -->
			<div class="flex-1 space-y-6 overflow-y-auto p-6">
				<!-- Dados da Empresa -->
				<div class="rounded-xl border border-purple-100 bg-purple-50 p-4">
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
				<div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
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
				<div class="rounded-xl border border-green-100 bg-green-50 p-4">
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
				<div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
					<h2 class="mb-3 text-lg font-bold text-gray-800">Backup e Restauração</h2>
					<p class="mb-4 text-sm text-gray-600">
						Faça backup dos seus dados ou restaure a partir de um arquivo anterior
					</p>

					<div class="grid gap-3 md:grid-cols-2">
						<!-- Botão Fazer Backup -->
						<button
							onclick={fazerBackup}
							class="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-orange-700"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
								/>
							</svg>
							Baixar Backup
						</button>

						<!-- Botão Restaurar Backup -->
						<button
							onclick={selecionarArquivoBackup}
							class="flex items-center justify-center gap-2 rounded-lg border-2 border-orange-600 bg-white px-6 py-3 font-semibold text-orange-600 transition-colors duration-200 hover:bg-orange-50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							Restaurar Backup
						</button>
					</div>

					<!-- Input de arquivo oculto -->
					<input
						type="file"
						accept="application/json,.json"
						bind:this={fileInput}
						onchange={handleFileChange}
						class="hidden"
					/>
				</div>

				<!-- Botão Salvar -->
				<button
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

<!-- Modal de Restauração -->
{#if mostrarModalRestaurar && backupParaRestaurar}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={cancelarRestauracao}
	>
		<div
			class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header do Modal -->
			<div class="bg-linear-to-r from-orange-600 to-orange-700 px-6 py-4">
				<h2 class="text-xl font-bold text-white">Restaurar Backup</h2>
			</div>

			<!-- Conteúdo do Modal -->
			<div class="p-6">
				<!-- Informações do Backup -->
				<div class="mb-4 rounded-lg bg-gray-50 p-4">
					<h3 class="mb-2 font-semibold text-gray-700">Informações do Backup</h3>
					<div class="space-y-1 text-sm text-gray-600">
						<p>
							<strong>Data:</strong>
							{new Date(backupParaRestaurar.dataBackup).toLocaleString('pt-BR')}
						</p>
						<p><strong>Versão:</strong> {backupParaRestaurar.versao}</p>
					</div>
				</div>

				<!-- Opções de Restauração -->
				<div class="mb-6">
					<h3 class="mb-3 font-semibold text-gray-700">Selecione o que deseja restaurar:</h3>
					<div class="space-y-3">
						<!-- Metadata -->
						<label
							class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
							class:bg-orange-50={restaurarMetadata}
						>
							<input type="checkbox" bind:checked={restaurarMetadata} class="h-5 w-5" />
							<div class="flex-1">
								<div class="font-semibold text-gray-700">Configurações da Empresa</div>
								<div class="text-sm text-gray-500">
									{backupParaRestaurar.metadata
										? 'Dados da empresa, bancários e chaves PIX'
										: 'Não disponível neste backup'}
								</div>
							</div>
						</label>

						<!-- Itens -->
						<label
							class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
							class:bg-orange-50={restaurarItens}
						>
							<input type="checkbox" bind:checked={restaurarItens} class="h-5 w-5" />
							<div class="flex-1">
								<div class="font-semibold text-gray-700">Itens de Serviço</div>
								<div class="text-sm text-gray-500">
									{backupParaRestaurar.itens.length} item(ns) no backup
								</div>
							</div>
						</label>

						<!-- Itens Pré-definidos -->
						<label
							class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
							class:bg-orange-50={restaurarItensPreDefinidos}
						>
							<input type="checkbox" bind:checked={restaurarItensPreDefinidos} class="h-5 w-5" />
							<div class="flex-1">
								<div class="font-semibold text-gray-700">Itens Pré-definidos</div>
								<div class="text-sm text-gray-500">
									{backupParaRestaurar.itensPreDefinidos.length} item(ns) no backup
								</div>
							</div>
						</label>
					</div>
				</div>

				<!-- Aviso -->
				<div class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<div class="flex gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0 text-yellow-600"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						<p class="text-sm text-yellow-800">
							<strong>Atenção:</strong> Os dados selecionados serão substituídos pelos dados do backup.
							Esta ação não pode ser desfeita.
						</p>
					</div>
				</div>

				<!-- Botões -->
				<div class="flex gap-3">
					<button
						onclick={cancelarRestauracao}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
					>
						Cancelar
					</button>
					<button
						onclick={confirmarRestauracao}
						disabled={!restaurarMetadata && !restaurarItens && !restaurarItensPreDefinidos}
						class="flex-1 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
					>
						Restaurar
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
