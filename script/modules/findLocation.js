export function findLocation(onSuccess) {
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