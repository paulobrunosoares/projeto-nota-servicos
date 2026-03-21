# Sistema de Backup e Restauração

## Visão Geral

O sistema permite fazer backup e restaurar todos os dados da aplicação armazenados no localStorage, incluindo:

- **Configurações da Empresa**: Dados da empresa, informações bancárias e chaves PIX
- **Itens de Serviço**: Lista de itens de serviço em uso
- **Itens Pré-definidos**: Catálogo de itens pré-definidos

## Como Fazer Backup

1. Acesse a página de **Configurações** da aplicação
2. Role até a seção **Backup e Restauração** (seção laranja)
3. Clique no botão **Baixar Backup**
4. Um arquivo JSON será baixado automaticamente com o formato: `backup-ordem-servicos-YYYY-MM-DD.json`

### Estrutura do Arquivo de Backup

```json
{
  "versao": "1.0.0",
  "dataBackup": "2026-03-21T...",
  "metadata": {
    "dadosEmpresa": { ... },
    "dadosConta": { ... },
    "chavesPix": [ ... ]
  },
  "itens": [ ... ],
  "itensPreDefinidos": [ ... ]
}
```

## Como Restaurar Backup

1. Acesse a página de **Configurações**
2. Na seção **Backup e Restauração**, clique em **Restaurar Backup**
3. Selecione o arquivo JSON de backup salvo anteriormente
4. Uma janela modal será exibida com as opções de restauração

### Opções de Restauração Seletiva

Você pode escolher quais dados deseja restaurar marcando/desmarcando as opções:

- ✅ **Configurações da Empresa**: Restaura dados da empresa, bancários e chaves PIX
- ✅ **Itens de Serviço**: Restaura a lista de itens de serviço (quantidade exibida)
- ✅ **Itens Pré-definidos**: Restaura o catálogo de itens pré-definidos (quantidade exibida)

### Informações do Backup

O modal mostra:
- **Data**: Quando o backup foi criado
- **Versão**: Versão do formato do backup

### Aviso Importante

⚠️ **Atenção**: Os dados selecionados serão **substituídos** pelos dados do backup. Esta ação **não pode ser desfeita**.

### Etapas para Confirmar

1. Revise as informações do backup
2. Selecione o que deseja restaurar
3. Clique em **Restaurar** para confirmar
4. Uma confirmação adicional será solicitada
5. Após a confirmação, a página será recarregada automaticamente

## Casos de Uso

### Migração entre Dispositivos

1. Faça backup no dispositivo atual
2. Transfira o arquivo JSON para o novo dispositivo
3. Restaure o backup no novo dispositivo

### Backup de Segurança

- Faça backups periódicos dos seus dados
- Mantenha os arquivos em local seguro (nuvem, pen drive, etc.)
- Use backups para recuperar dados em caso de problema

### Teste de Configurações

- Faça backup antes de alterar configurações importantes
- Se algo der errado, restaure o backup anterior

### Restauração Parcial

- Restaure apenas as configurações da empresa sem afetar os itens
- Restaure apenas os itens pré-definidos mantendo as configurações atuais

## Integração com o Código

### Arquivos Modificados

- **`src/lib/types.ts`**: Novos tipos `BackupData` e `RestoreOptions`
- **`src/lib/store.ts`**: Funções de backup/restauração
  - `criarBackup()`: Cria objeto de backup com todos os dados
  - `exportarBackup()`: Exporta backup como arquivo JSON
  - `restaurarBackup(backup, options)`: Restaura dados selecionados
  - `validarBackup(data)`: Valida estrutura do arquivo de backup
- **`src/routes/config/+page.svelte`**: Interface de usuário para backup/restauração

### Funções Principais

```typescript
// Exportar backup
exportarBackup(): void

// Restaurar backup com opções seletivas
restaurarBackup(backup: BackupData, options: RestoreOptions): void

// Validar arquivo de backup
validarBackup(data: unknown): data is BackupData
```

### Exemplo de Uso Programático

```typescript
import { exportarBackup, restaurarBackup, validarBackup } from '$lib/store';
import type { BackupData, RestoreOptions } from '$lib/types';

// Fazer backup
exportarBackup();

// Restaurar backup
const backup: BackupData = { /* dados do arquivo */ };
const options: RestoreOptions = {
  restaurarMetadata: true,
  restaurarItens: true,
  restaurarItensPreDefinidos: false
};

if (validarBackup(backup)) {
  restaurarBackup(backup, options);
}
```

## Notas Técnicas

- Os dados são armazenados no **localStorage** do navegador
- O formato do backup é **JSON** para fácil portabilidade
- A validação garante que apenas backups válidos sejam restaurados
- O sistema usa **Svelte 5** com `$state` para reatividade
- A interface é responsiva e funciona em diferentes tamanhos de tela

## Troubleshooting

### "Arquivo de backup inválido"

- Verifique se o arquivo é um JSON válido
- Certifique-se de que o arquivo não foi corrompido
- Verifique se o arquivo contém todos os campos obrigatórios

### Botão "Restaurar" desabilitado

- Selecione pelo menos uma opção de restauração
- Verifique se o backup foi carregado corretamente

### Página não recarrega após restauração

- Caso isso aconteça, recarregue manualmente a página (F5)
- Os dados já foram restaurados no localStorage
