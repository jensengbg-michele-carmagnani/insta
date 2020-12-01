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

function cameraSettings() {
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
                                <img class="snapShot" src="${imgUrl}" alt="">
                                <article class="info-pic">
                                    <p><span class="location-info">City</span><br>${city}</p>
                                    <p><span class="location-info">Country</span><br>${country}</p>
                                    <p> 
                                      <a href="${imgUrl}" download class="downloadImg ">Download</a>
                                    </p>
                                </article>
                                  <button class="remove btn-active-delete">Delete</button>
                              </section>`;
      downloadImg = document.querySelector(".downloadImg");
      downloadImg.download = "img.jpeg";

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

// notifications setting

function notifyPic() {
  console.log("you are in notify funk");
  let notificationPermission = false;

  const btnAskPermission = document.querySelector(".askPermissionBtn");

  // allow notification
  btnAskPermission.addEventListener("click", async () => {
    console.log("permission");
    const answer = await Notification.requestPermission();
    if (answer == "granted") {
      notificationPermission = true;
      console.log("notification permission Granted");
    } else if (answer == "denied") {
      console.log("Notification : user denied notification");
    } else {
      // default
      console.log("Notification: user decline to answer");
    }
    getSubsciption();
    //show notification for recording

    btnStartRecording.addEventListener("click", async () => {
      if (!notificationPermission) {
        console.log("we do not have permission to show notification");
        return;
      }

      const options = {
        body: "You are now recording!",
        icon: "./img/inst-512.png",
      };
      let notif = new Notification("Hello Michele", options);
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification("Reminder", options)
      );
      notif.addEventListener("show", () => {
        console.log("Show notification");
      });
      notif.addEventListener("click", () => {
        console.log("user clicked on notification");
      });
    });

    //show notification for pic
    let btnSnapshotNotify = document.querySelector(".snapshot");
    btnSnapshotNotify.addEventListener("click", async () => {
      if (!notificationPermission) {
        console.log("we do not have permission to show notification");
        return;
      }

      const options = {
        body: "This is your Snapshot",
        icon: "./img/inst-512.png",
      };
      let notif = new Notification("Hello Michele", options);
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification("Reminder", options)
      );
      notif.addEventListener("show", () => {
        console.log("Show notification");
      });
      notif.addEventListener("click", () => {
        console.log("user clicked on notification");
      });
    });
  });
}

async function getSubsciption() {
  const subscription = {
    endpoint: "https://push-notifications-api.herokuapp.com/api/notifications/save",
    keys: {
      auth: ".....",
      p256dh: ".....",
    },
  };
  try {
    const response = await fetch(
      "https://push-notifications-api.herokuapp.com/api/notifications/send",
      {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.json();
    console.log("subscripiton", data);
  } catch (error) {
    alert("It was not possible to get the subscription", error);
  }
}
// Get adreass throughout the reverese geocoding
async function getAddress(lat, lon, onSuccess) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=accf8ffee4454813b62676aeb9faa061`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(
      "response from geolocation",
      data.results[0].components.country +
        "" +
        data.results[0].components.city_district
    );
    if (data.error) {
      errorMsg.innerHTML = "not possible to retrieve the location";
    } else {
      const city = data.results[0].components.city_district;
      const country = data.results[0].components.country;
      onSuccess(city, country);
      return city, country;
    }
  } catch (error) {
    console.log("erroro in city and country", error);
    alert("Not possible retrieve the city and street ");
  }
}

// Geolocation of the photo
let geo = navigator.geolocation;

function findLocation(onSuccess) {
  if ("geolocation" in navigator) {
    geo.getCurrentPosition(
      (pos) => {
        let coords = pos.coords;
        let lat = coords.latitude;
        let lon = coords.longitude;
        console.log("lat lon", lat, lon);
        getAddress(lat, lon, onSuccess);
      },
      (error) => {
        console.log("Could not get position", error);
        console.log("it is not possible to retrieve the position.");
        errorMsg.innerHTML =
          "It is not possible to retrieve the position please allow the geolocalisation .";
      }
    );
  } else {
    console.log(`the device doesen't access to the geolocation.`);
  }
}
