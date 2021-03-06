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
import { findLocation } from "./dist/findLocation.js";
import { notifyPic } from "./dist/notification.js";

let btnShowCamera = document.querySelector(".show-camera");
let btnSnapshot = document.querySelector(".snapshot");
let btnStopCamera = document.querySelector(".stop-camera");
let errorMsg = document.querySelector(".error-msg");
let gallery = document.querySelector(".gallery");
let btnStartRecording = document.querySelector(".start-recording");
let btnStopRecording = document.querySelector(".stop-recording");
let downloadLink = document.querySelector(".download-link");
let btnChangeFacing = document.querySelector(".change-facing");
window.addEventListener("load", () => {
  console.log("navigator", navigator);
  if ("mediaDevices" in navigator) {
    cameraSettings();
  }
});

notifyPic();

export function cameraSettings() {
  let stream;
  let facing = "environment";

  btnShowCamera.addEventListener("click", async () => {
    errorMsg.innerHTML = "";
    try {
      const md = navigator.mediaDevices;
      stream = await md.getUserMedia({
        video: { width: 320, height: 320, facingMode: facing },
      });

      const video = document.querySelector(".camera > .video-camera");
      video.srcObject = stream;
      btnShowCamera.disabled = true;
      btnShowCamera.classList.remove("btn-active");
      btnShowCamera.classList.add("btn-inactive");
      btnSnapshot.disabled = false;
      btnSnapshot.classList.remove("btn-inactive");
      btnSnapshot.classList.add("btn-active");
      btnStopCamera.disabled = false;
      btnStopCamera.classList.remove("btn-inactive");
      btnStopCamera.classList.add("btn-active");
      btnStartRecording.disabled = false;
      btnStartRecording.classList.remove("btn-inactive");
      btnStartRecording.classList.add("btn-active");
      btnStopRecording.disabled = true;
      btnChangeFacing.classList.remove("btn-inactive");
      btnChangeFacing.classList.add("btn-active");
      btnChangeFacing.disabled = false;
    } catch (e) {
      errorMsg.innerHTML = ("It is not possible to use the camera", e);
    }
  });

  btnChangeFacing.addEventListener("click", () => {
    if (facing == "environment") {
      (facing = "user"), (btnChangeFacing.innerHTML = "Show environment");
    } else {
      (facing = "environment"), (btnChangeFacing.innerHTML = "Show User ");
    }
    btnStopCamera.click();
    btnShowCamera.click();
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
    btnStopCamera.classList.remove("btn-active");
    btnStopCamera.classList.add("btn-inactive");
    btnShowCamera.disabled = false;
    btnShowCamera.classList.remove("btn-inactive");
    btnShowCamera.classList.add("btn-active");
    btnSnapshot.disabled = true;
    btnSnapshot.classList.remove("btn-active");
    btnSnapshot.classList.add("btn-inactive");
    btnStartRecording.disabled = true;
    btnStartRecording.classList.remove("btn-active");
    btnStartRecording.classList.add("btn-inactive");
    btnStopRecording.disabled = true;
    btnChangeFacing.classList.remove("btn-active");
    btnChangeFacing.classList.add("btn-inactive");
    btnChangeFacing.disabled = true;
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
    let imgUrl = URL.createObjectURL(blob);

    findLocation((city, country) => {
      gallery.innerHTML += `<section class="card-img">
                                <div class="aspect-ratio-box">
                                  <img class="snap-shot" src="${imgUrl}" alt="">
                                </div>
                                <article class="info-pic">
                                    <p><span class="location-info">City</span><br>${city}</p>
                                    <p><span class="location-info">Country</span><br>${country}</p>
                                    <p> 
                                      <a href="${imgUrl}" download class="downloadImg ">Download</a>
                                    </p>
                                </article>
                                  <button class="remove btn-active-delete">Delete</button>
                              </section>`;
      let downloadImg = document.querySelector(".downloadImg");
      downloadImg.download = "img.jpeg";
      console.log("find location", city + "" + country);

      // remove photos
      let buttons = document.querySelectorAll(".remove");

      buttons.forEach((btn) =>
        btn.addEventListener("click", async () => {
          btn.parentElement.remove();
        })
      );
    });
  });

  // Media recording section

  let mediaRecorder;
  btnStartRecording.addEventListener("click", async () => {
    if (!stream) {
      errorMessage.innerHTML = "No video available";
      return;
    }
    btnStartRecording.disabled = true;
    btnStartRecording.classList.remove("btn-active");
    btnStartRecording.classList.add("btn-inactive");
    btnStopRecording.disabled = false;
    btnStopRecording.classList.remove("btn-inactive");
    btnStopRecording.classList.add("btn-active");
    mediaRecorder = new MediaRecorder(stream);
    let chunks = [];
    mediaRecorder.addEventListener("dataavailable", (event) => {
      console.log("mediaRecorder.dataavailable: ", event);
      const blob = event.data;
      if (blob.size > 0) {
        chunks.push(blob);
      }
    });
    mediaRecorder.addEventListener("stop", (event) => {
      console.log("mediaRecorder.stop: ", event);
      const blob = new Blob(chunks, { type: "video/webm" });
      // WEBM-formatet fungerar i Chrome och Firefox
      // Använd gärna MP4 som fallback
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.classList.toggle("hidden");
      downloadLink.download = "recording.webm";

      downloadLink.addEventListener("click", () => {
        downloadLink.classList.toggle("hidden");
      });
    });
    mediaRecorder.start();
  });
  btnStopRecording.addEventListener("click", async () => {
    if (mediaRecorder) {
      btnStopRecording.disabled = true;
      btnStartRecording.classList.remove("btn-inactive");
      btnStartRecording.classList.add("btn-active");
      btnStartRecording.disabled = false;
      btnStopRecording.classList.remove("btn-active");
      btnStopRecording.classList.add("btn-inactive");
      mediaRecorder.stop();
      mediaRecorder = null;
    } else {
      errorMsg.innerHTML = "No recording to stop.";
    }
  });
}
