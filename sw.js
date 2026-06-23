// 서비스워커 비활성화 버전 - 캐시 전체 삭제
const CACHE_NAME = 'delivery-master-v4';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[ServiceWorker] Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] All caches cleared');
        })
    );
    self.clients.claim();
});

// 캐시 없이 무조건 네트워크에서 가져옴
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
