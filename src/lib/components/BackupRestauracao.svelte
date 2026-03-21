<script lang="ts">
	import { exportarBackup, restaurarBackup, validarBackup } from '$lib/store';
	import type { BackupData } from '$lib/types';

	// Estado do componente
	let mostrarModalRestaurar = $state(false);
	let backupParaRestaurar: BackupData | null = $state(null);
	let restaurarMetadata = $state(true);
	let restaurarItens = $state(true);
	let restaurarItensPreDefinidos = $state(true);
	let fileInput: HTMLInputElement | null = null;

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

		// Executar restauração
		const resultado = restaurarBackup(backupParaRestaurar, {
			restaurarMetadata,
			restaurarItens,
			restaurarItensPreDefinidos
		});

		// Verificar resultado
		if (resultado.sucesso) {
			// Mostrar quais itens foram restaurados
			const itensRestaurados = [];
			if (resultado.itensRestaurados.metadata) itensRestaurados.push('Configurações');
			if (resultado.itensRestaurados.itens) itensRestaurados.push('Itens de Serviço');
			if (resultado.itensRestaurados.itensPreDefinidos)
				itensRestaurados.push('Itens Pré-definidos');

			const mensagem =
				itensRestaurados.length > 0
					? `Backup restaurado com sucesso!\n\nItens restaurados:\n• ${itensRestaurados.join('\n• ')}\n\nA página será recarregada.`
					: 'Nenhum item foi selecionado para restauração.';

			alert(mensagem);

			// Só recarregar se algo foi restaurado
			if (itensRestaurados.length > 0) {
				// Pequeno delay para garantir que o localStorage foi atualizado
				setTimeout(() => {
					window.location.reload();
				}, 100);
			}
		} else {
			// Mostrar erro
			alert(`Erro na restauração!\n\n${resultado.mensagem}\n\nPor favor, tente novamente.`);
		}
	}

	function cancelarRestauracao() {
		mostrarModalRestaurar = false;
		backupParaRestaurar = null;
		restaurarMetadata = true;
		restaurarItens = true;
		restaurarItensPreDefinidos = true;
	}
</script>

<!-- Seção de Backup e Restauração -->
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

<!-- Modal de Restauração -->
{#if mostrarModalRestaurar && backupParaRestaurar}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={cancelarRestauracao}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
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
