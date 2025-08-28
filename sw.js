const CACHE_NAME = 'shelter-cache-v2'; // 更新版本号可以强制更新缓存
// 定义需要被缓存的核心文件列表
const urlsToCache = [
  '/shelter/',
  '/shelter/index.html',
  '/shelter/page2.html',
  '/shelter/page3.html',
  '/shelter/page4.html',
  '/shelter/page5.html',
  '/shelter/css/style.css',
  '/shelter/js/main.js',
  '/shelter/manifest.json',
  // 把你最重要的图片也加进来
  '/shelter/images/icon-192.png',
  '/shelter/images/icon-512.png'
  // 你可以把所有页面的背景图路径都加进来
];

// 1. 安装 Service Worker 并缓存文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 拦截网络请求，优先从缓存中提供资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});