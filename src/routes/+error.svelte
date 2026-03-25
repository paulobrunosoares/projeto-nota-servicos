<script>
	import { page } from '$app/stores';
</script>

<div class="container">
	<div class="content">
		<h1>404</h1>
		<h2>Página não encontrada</h2>
		<p>A página que você está procurando não existe.</p>
		<p class="error-message">{$page.status} - {$page.error?.message}</p>
		<a href="/" class="btn">Voltar para Home</a>
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.content {
		text-align: center;
		color: white;
	}

	h1 {
		font-size: 5rem;
		margin: 0;
		font-weight: bold;
	}

	h2 {
		font-size: 2rem;
		margin: 1rem 0;
	}

	p {
		font-size: 1.2rem;
		margin: 0.5rem 0;
	}

	.error-message {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.btn {
		display: inline-block;
		margin-top: 2rem;
		padding: 0.8rem 2rem;
		background-color: white;
		color: #667eea;
		text-decoration: none;
		border-radius: 5px;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	.btn:hover {
		transform: scale(1.05);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}
</style>
