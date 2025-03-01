/// <reference lib="webworker" />

(async (worker: ServiceWorkerGlobalScope) => {
  worker.addEventListener("install", (event) => {
    console.log("SW: install");
    event.waitUntil(worker.skipWaiting());
  });

  worker.addEventListener("activate", (event) => {
    console.log("SW: activate");
  });

  // worker.addEventListener("fetch", (event) => {
  //   console.log('SW: fetch', event.request.url);
  // });
})(self as any);
