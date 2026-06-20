const CACHE_NAME = 'delivery-master-v3';
// [Fix] 외부 CDN은 install 단계에서 강제 캐싱하지 않음 (CORS 오류로 전체 설치 실패 방지)
// 외부 리소스는 fetch 핸들러에서 동적으로 캐싱됨
const ASSETS_TO_CACHE = [
    './index.html',
    './manifest.json',
    './icon.svg'
];

// 설치: 캐시 초기화 (개별 캐싱으로 변경, 하나 실패해도 전체 설치는 성공)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return Promise.all(
                ASSETS_TO_CACHE.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('[ServiceWorker] Failed to cache:', url, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

// 활성화: 구버전 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 요청 가로채기
self.addEventListener('fetch', (event) => {
    // API 요청이나 Supabase 요청은 캐시하지 않음 (네트워크 전용)
    if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // 캐시 적중 시 반환, 아니면 네트워크 요청
            if (response) return response;

            return fetch(event.request).then((networkResponse) => {
                // 유효한 응답인지 확인 (opaque 응답은 status가 0이라 조건 완화)
                if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                    return networkResponse;
                }

                // 캐시 저장 (실패해도 무시하고 응답은 정상 반환)
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache).catch(() => {});
                });

                return networkResponse;
            }).catch((err) => {
                console.warn('[ServiceWorker] Fetch failed:', event.request.url, err);
                throw err;
            });
        })
    );
});
