const CACHE_NAME = 'nota-servico-v2'; // Incrementado para invalidar cache antigo
const urlsToCache = ['/manifest.json'];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
	// Ignora requisições não GET
	if (event.request.method !== 'GET') {
		return;
	}

	// Ignora requisições para API de PDF
	if (event.request.url.includes('/api/pdf')) {
		return;
	}

	// Para arquivos imutáveis do SvelteKit (_app/immutable/), sempre busca da rede
	// Isso evita problemas com hashes desatualizados após rebuild
	if (event.request.url.includes('/_app/immutable/')) {
		event.respondWith(
			fetch(event.request).catch(() => {
				// Se offline, tenta do cache como fallback
				return caches.match(event.request);
			})
		);
		return;
	}

	// Para outras requisições (HTML, etc), usa estratégia Network First
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Se a resposta é válida, cacheia antes de retornar
				if (response && response.status === 200 && response.type === 'basic') {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}
				return response;
			})
			.catch(() => {
				// Se offline, retorna do cache
				return caches.match(event.request);
			})
	);
});
