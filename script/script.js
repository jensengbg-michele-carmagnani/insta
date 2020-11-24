if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../sw.js")
    .then((event) => {
      console.log("Service workder : registerd");
    })
    .catch((error) => {
      console.log("Service worker registration error:", error.event);
    });
}

let showCamera = document.querySelector(".show-camera");
let btnSnapshot = document.querySelector(".btn-snapshot");
