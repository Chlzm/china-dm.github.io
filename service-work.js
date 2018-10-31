
self.addEventListener('error', function(e) {
    self.clients.matchAll()
        .then(function (clients) {
            if (clients && clients.length) {
                clients[0].postMessage({
                    type: 'ERROR',
                    msg: e.message || null,
                    stack: e.error ? e.error.stack : null
                });
            }
        });
});

self.addEventListener('unhandledrejection', function(e) {
    self.clients.matchAll()
        .then(function (clients) {
            if (clients && clients.length) {
                clients[0].postMessage({
                    type: 'REJECTION',
                    msg: e.reason ? e.reason.message : null,
                    stack: e.reason ? e.reason.stack : null
                });
            }
        });
})

importScripts('/workbox/workbox-sw.js');

workbox.setConfig({
    debug: false,
    modulePathPrefix: '/workbox'
});


workbox.skipWaiting();
workbox.clientsClaim();

var cacheList = [
    '/',
    '/manifest.json'
];





workbox.routing.registerRoute(
    function(event) {
        // 需要缓存的HTML路径列表
        if(~cacheList.indexOf(event.url.pathname)){
            return true
        }
        return false;
        /*if (event.url.host === '/') {
        //if (event.url.host === 'www.taobao.com') {
            if (~cacheList.indexOf(event.url.pathname)) return true;
            else return false;
        } else {
            return false;
        }*/
    },
    workbox.strategies.networkFirst({
        cacheName: 'tbh:html',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 10
            }),
        ]
    })
);

workbox.routing.registerRoute(
    /\.css/,
    //new RegExp('https://g\.alicdn\.com/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'tbh:static',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20
            })
        ]
    })
);

workbox.routing.registerRoute(
    /\.js/,
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'tbh:js',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20
            })
        ]
    })
);

workbox.routing.registerRoute(
    /\.(png|jpg|jpeg|gif)$/,
    workbox.strategies.cacheFirst({
        cacheName: 'tbh:img',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxEntries: 20,
                maxAgeSeconds: 12 * 60 * 60
            })
        ]
    })
);
workbox.routing.registerRoute(
    new RegExp('https://gtms01\.alicdn\.com/'),
    workbox.strategies.cacheFirst({
        cacheName: 'tbh:img',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxEntries: 30,
                maxAgeSeconds: 12 * 60 * 60
            })
        ]
    })
);

workbox.routing.registerRoute(
    /https:\/\/wwwupload\.gaodunwangxiao\.com\/images\/rgtConsult\.png/,
    workbox.strategies.networkFirst({
        cacheName: 'cros:img',
        cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 7 * 24 * 60 * 60
        },
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxEntries: 30,
                maxAgeSeconds: 12 * 60 * 60
            })
        ]
    })
)
workbox.routing.registerRoute(
    /http:\/\/baiyi\.gaodun\.com\/dist\/vendor\.js\?aaa0916add7e5bb82680/,
    workbox.strategies.networkFirst({
        cacheName: 'cros:javascript',
        cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 7 * 24 * 60 * 60
        },
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            new workbox.expiration.Plugin({
                maxEntries: 30,
                maxAgeSeconds: 12 * 60 * 60
            })
        ]
    })
)