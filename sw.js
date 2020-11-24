self.addEventListener("install", (event) => {
  console.log("Service worker: install" + new Date().toTimeString());
  // Attempt to load cached files'
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "./index.html",
        "./style.css",
        "./manifest.webmanifest",
        "./img/inst-512.png",
      ]);
    })
  );
});
self.addEventListener("activate", (event) => {
  console.log("Service worker: activates at" + new Date().toTimeString());
  // Attempt to load cached files
});

self.addEventListener("fetch", (event) => {
  console.log("Service worker: fetching resource ", event.request.url);
  // om vi är online - gör ett vanligt request + spara resultatet
  // om vi är offline - leta efter ett sparat response
  if (navigator.onLine) {
    event.respondWith(
      fetch(event.request).then((response) => {
        // Innan vi skickar tillbaka response till webbläsaren - spara en kopia av response i cache
        let clone = response.clone();
        caches.open("v1").then((cache) => {
          cache.put(event.request, clone);
          console.log("clone of response", clone);
        });
        return response;
      })
    );
  } else {
    console.log("Fetch: offline, request url is:", event.request.url);
    // Vi är offline. Leta först efter ett matchande request i cache. Om det inte finns, returnera en offline-sida.
    event.respondWith(
      caches.match(event.request).then((maybeResponse) => {
        if (maybeResponse !== undefined) {
          // Tur! Vi har sparat resultatet från ett liknande request tidigare
          console.log("Fetch: maybeResponse=", maybeResponse);
          return maybeResponse;
        } else {
          console.log("Return a new Response");
          return new Response("<h1>No internet </h1>", {
            headers: { "Content-Type": "text/html" },
          });
        }
      })
    );
  }
});

// Session storage - försvinner när vi startar om appen
// Local storage - är till för att spara data
// Cache - är till för att spara filer
