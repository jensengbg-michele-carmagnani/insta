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

window.addEventListener("load", () => {
  console.log("navigator", navigator);
  if ("mediaDevices" in navigator) {
    cameraSettings();
  }
});

function cameraSettings() {
  let btnShowCamera = document.querySelector(".show-camera");
  let btnSnapshot = document.querySelector(".snapshot");
  let btnStopCamera = document.querySelector(".stop-camera");
  let errorMsg = document.querySelector(".error-msg");
  let gallery = document.querySelector(".gallery");

  let stream;

  btnShowCamera.addEventListener("click", async () => {
    errorMsg.innerHTML = "";
    try {
      const md = navigator.mediaDevices;
      stream = await md.getUserMedia({ video: { width: 320, height: 320 } });

      const video = document.querySelector(".camera > .video-camera");
      video.srcObject = stream;
      btnShowCamera.disabled = true;
      btnSnapshot.disabled = false;
      btnStopCamera.disabled = false;
    } catch (e) {
      errorMsg.innerHTML = ("It is not possible to use the camera", e);
    }
  });
  btnStopCamera.addEventListener("click", () => {
    errorMsg.innerHTML = "";
    if (!stream) {
      errorMsg.innerHTML = "No video to stop";
      return;
    }
    let tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    btnStopCamera.disabled = true;
    btnShowCamera.disabled = false;
    btnSnapshot.disabled = true;
  });
  btnSnapshot.addEventListener("click", async () => {
    errorMsg.innerHTML = "";
    if (!stream) {
      errorMsg.innerHTML = " No video awailable for pictures";
      return;
    }
    let tracks = stream.getTracks();
    console.log("tracks", tracks);
    let videoTrack = tracks[0];
    let capture = new ImageCapture(videoTrack);
    let blob = await capture.takePhoto();
    let photo = document.createElement("img");
    imgUlr = URL.createObjectURL(blob);
    photo.src = imgUlr;
    gallery.appendChild(photo);
  });
}
