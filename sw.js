var swVersion = "1.0.1";
const expectedCaches = ['static-v2'];
urlsToCache = [
    '/default.html',
    '/images/1.jpg'
]
this.addEventListener('install', function (event) {
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open('static-v2').then(function (cache) {
            // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
            return cache.addAll(urlsToCache);
        }).then(() => {
            //debugger;
            self.skipWaiting();
        })
    );
    //event.waitUntil(self.skipWaiting());
});

/*this.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // 来来来，代理可以搞一些代理的事情
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request, {
                headers: {
                    //withCredentials:false,
                },
                credentials: "omit",
                mode: 'cors'
            }).then(function (httpRes) {

                // http请求的返回已被抓到，可以处置了。

                // 请求失败了，直接返回失败的结果就好了。。
                if (httpRes.url == "http://localhost:8084/index.html") {
                    return httpRes;
                }

                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }
                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open('my-test-cache-v1').then(function (cache) {
                    cache.put(request, responseClone);
                });

                return httpRes;
            }).catch(() => {
                offlineRequest(request)
            });
        })
    );
});*/

self.addEventListener("fetch", event => {
        event.respondWith(
            caches.match(event.request).then(hit => {
                if (hit) {
                    return hit;
                }
                const fetchRequest = event.request.clone();
                if (navigator.onLine) {
                    return onlineRequest(fetchRequest)
                }
                return offlineRequest(fetchRequest)
            })
        )
    }
)

function offlineRequest(request) {
    if (request.url.match(/\.(png|gif|jpg)/i)) {
        return caches.match('/images/1.jpg')
    }
    //if (request.url.match(/http:\/\/localhost:8084/)) {
    if(request.url.match(/https:\/\/china-dm\.github\.io\//)){
        return caches.match('/default.html')
    }
}

function onlineRequest(fetchRequest) {
    return fetch(fetchRequest, {
        headers: {
            //withCredentials:false,
        },
        credentials: "omit",
        mode: 'cors'
    }).then(response => {
        if (!response || response.status !== 200 || response.url === "https://china-dm.github.io/") {
            return response;
        }
        const responseToCache = response.clone();
        caches.open('static-v1').then(function (cache) {
            cache.put(fetchRequest, responseToCache);
        });
        return response;
    }).catch(() => {
        offlineRequest(fetchRequest);
    });
}
this.addEventListener('message',(event)=>{
    event.waitUntil(
        Promise.all([

            // 更新客户端
            self.clients.claim(),

            // 清理旧版本
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (key) {
                        if (!expectedCaches.includes(key)) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        ])
    );
})
this.addEventListener('activate', function (event) {
    event.waitUntil(
        Promise.all([

            // 更新客户端
            self.clients.claim(),

            // 清理旧版本
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (key) {
                        if (!expectedCaches.includes(key)) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        ]).then(()=>{
            return this.clients.claim(); // 取得页面控件权
        })
    );
});
self.addEventListener('offline',()=>{
    debugger;
})
self.addEventListener('sync',event=>{
    //alert(event.tag)
    console.log(event);
})

// 安装service worker 失败时
self.addEventListener("unhandledrejection", (error) => {
    //console.log(error);
})

