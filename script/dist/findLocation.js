  export function findLocation(onSuccess) {
  let geo = navigator.geolocation;
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

