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
  notifyMe();
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
  let btnStartRecording = document.querySelector(".start-recording");
  let btnStopRecording = document.querySelector(".stop-recording");
  let downloadLink = document.querySelector(".download-link");

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
      btnStartRecording.disabled = false;
      btnStopRecording.disabled = true;
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
    btnStartRecording.disabled = true;
    btnStopRecording.disabled = true;
  });
  btnSnapshot.addEventListener("click", async () => {
    errorMsg.innerHTML = "";

    if (!stream) {
      errorMsg.innerHTML = " No video awailable for pictures";
      return;
    }
    if('ImageCapture' in window){

      let tracks = stream.getTracks();
      console.log("tracks", tracks);
      let videoTrack = tracks[0];
      let capture = new ImageCapture(videoTrack);
      let blob = await capture.takePhoto();
      let imgUlr = URL.createObjectURL(blob);
    } else {

    }
    //get the address function
    // photo.src = imgUlr;

    findLocation((city, country) => {
      gallery.innerHTML += `<section class="card-img">
                                <img class="snapShot" src="${imgUlr}" alt="">
                                <article class="info-pic">
                                    <p>City<br>${city}</p>
                                    <p>Country<br>${country}</p>
                                    <p> 
                                      <a href="${imgUlr}" download class="downloadImg ">Download</a>
                                    </p>
                                </article>
                                  <button class="remove">Delete</button>
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
    btnStopRecording.disabled = false;
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
      downloadLink.classList.remove("hidden");
      downloadLink.download = "recording.webm";
    });
    mediaRecorder.start();
  });
  btnStopRecording.addEventListener("click", async () => {
    if (mediaRecorder) {
      btnStopRecording.disabled = true;
      btnStartRecording.disabled = false;
      mediaRecorder.stop();
      mediaRecorder = null;
    } else {
      errorMsg.innerHTML = "No recording to stop.";
    }
  });
}

// notifications setting

function notifyMe() {
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
    //show notification
    let btnShowNotification = document.querySelector(".showNotificationButton");
    btnShowNotification.addEventListener("click", () => {
      if (!notificationPermission) {
        console.log("we do not have permission to show notification");
        return;
      }
      const options = {
        body: "Now you can recieve notification!",
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

// Get adreass throughout the reverese geocoding
async function getAddress(lat, lon, onSuccess) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=accf8ffee4454813b62676aeb9faa061`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(
      "response from geolocation",
      data.results[0].components.country
    );
    if (data.error) {
      errorMsg.innerHTML = "not possible to retrieve the location";
    } else {
      const city = data.results[0].components.city_district;
      const country = data.results[0].components.country;
      onSuccess(city, country);
      console.log("location steet", city + " " + country);
      return city, country;
    }
  } catch (error) {
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
