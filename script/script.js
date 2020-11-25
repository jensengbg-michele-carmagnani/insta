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
    //get the address function
    let tracks = stream.getTracks();
    console.log("tracks", tracks);
    let videoTrack = tracks[0];
    let capture = new ImageCapture(videoTrack);
    let blob = await capture.takePhoto();
    let photo = document.createElement("img");
    let imgUlr = URL.createObjectURL(blob);
    photo.src = imgUlr;

    findLocation((city, country) => {
      gallery.innerHTML += `<div class="card-img"><img src="${imgUlr}" alt=""><p class="info-pic">${city}${country}</p><button class="remove">Delete</button></div>`;

      let btnDelete = document.querySelector(".remove");
      btnDelete.addEventListener("click", () => {
        let cardToDelete = document.querySelector(".card-img");
        cardToDelete.remove();
      });
    });
  });

  // btnDelete = document.querySelectorAll(".remove");
  //  deletePhoto(btnDelete);

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
// Delete photo

// async function deletePhoto(btnDelete) {
// for (let i = 0; i > btnDelete.length; i++)
//     btnDelete[i].addEventListener("click", () => {
//       // let cardToDelete = document.querySelector(".card-img").value();
//       let cardToDelete = btnDelete[i].value;
//       cardToDelete[i].remove();
//     });
//   }

// Function to the adress of the pictures
async function getAddress(lat, lon, onSuccess) {
  try {
    const url = `https://geocode.xyz/${lat},${lon}?json=1`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("response from geolocation", data);
    if (data.error) {
      errorMsg.innerHTML = "not possible to retrieve the location";
    } else {
      const city = data.city;
      const country = data.country;
      onSuccess(city, country);
      console.log("location steet", city + " " + country);
      return city, country;
    }
  } catch (error) {
    alert("Not possible to retrieve to fatch the city and street ");
  }
}

let geo = navigator.geolocation;
//geolocation
function findLocation(onSuccess) {
  if ("geolocation" in navigator) {
    geo.getCurrentPosition(
      (pos) => {
        let coords = pos.coords;
        let lat = coords.latitude;
        let lon = coords.longitude;
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
