const CACHE_NAME = 'nota-servico-v1';
const urlsToCache = [
	'/',
	'/config',
	'/manifest.json'
];

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

	event.respondWith(
		caches.match(event.request).then((response) => {
			// Retorna do cache se disponível
			if (response) {
				return response;
			}

			// Clona a requisição
			const fetchRequest = event.request.clone();

			return fetch(fetchRequest).then((response) => {
				// Verifica se é uma resposta válida
				if (!response || response.status !== 200 || response.type !== 'basic') {
					return response;
				}

				// Clona a resposta
				const responseToCache = response.clone();

				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});

				return response;
			});
		})
	);
});
