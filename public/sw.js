// Service worker mínimo: permite instalar la app en el celular y usarla
// sin señal. Guarda en caché lo que se va abriendo.
const CACHE = "reporte-turno-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, copia)).catch(() => {});
        return respuesta;
      })
      .catch(() =>
        caches.match(e.request).then((guardado) => guardado || caches.match("/"))
      )
  );
});
