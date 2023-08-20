var weatherReport;

setTimeout(function () {
  getWeatherData();
}, 100);

window.addEventListener("focus", getWeatherData);

setTimeout(function () {
  updateSunlowInterval();
}, 200);

setInterval(
  function () {
    getWeatherData();
  },
  30 * 60 * 1000 // 30 minutes
);

function updateSunlowInterval() {
  const currentTime = Date.now();
  const mins15 = 15 * 60 * 1000;
  const sunrise = weatherReport.sunrise;
  const sunset = weatherReport.sunset;

  switch (true) {
    case sunrise - mins15 > currentTime:
      {
        setTimeout(function () {
          getWeatherData();
        }, sunrise - mins15 - currentTime);
        console.log("sli 1");
      }
      break;
    case sunrise - mins15 < currentTime && currentTime < sunrise + mins15:
      {
        setTimeout(function () {
          getWeatherData();
        }, sunrise + mins15 - currentTime);
        console.log("sli 2");
      }
      break;
    case sunrise + mins15 < currentTime && currentTime < sunset - mins15:
      {
        setTimeout(function () {
          getWeatherData();
        }, sunset - mins15 - currentTime);
        console.log("sli 3");
      }
      break;
    case sunset - mins15 < currentTime && currentTime < sunrise + mins15:
      {
        setTimeout(function () {
          getWeatherData();
        }, sunset + mins15 - currentTime);
        console.log("sli 4");
      }
      break;
    default:
      {
        console.log(
          "should be night at this case so get next day" + weatherReport
        );
        const hours24 = 24 * 60 * 60 * 1000;
        setTimeout(() => {
          getWeatherData();
        }, sunrise + hours24 - mins15);
      }
      break;
  }
}

// Make a request to the API and store the data in localStorage
async function getWeather() {
  const apiKey = "b021ada393635608f94eccaf86824dd1";
  const lat = 54.9596;
  const lon = -7.734439;

  const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=&appid=${apiKey}&units=metric`;

  await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("weatherData", JSON.stringify(data));
      console.log("Weather data saved to localStorage:", data);
    })
    .catch((error) => console.error(error));
}

// Get the relevant weather data from localStorage
async function getWeatherData() {
  const data = JSON.parse(localStorage.getItem("weatherData"));

  if (data == null) {
    await getWeather();
    return null;
  }

  const currentTime = new Date().getTime();
  const currentDate = new Date(Date.now()).getDate();
  const weatherReportDate = new Date(data.daily[0].dt * 1000).getDate();
  const earliestHourlyData = data.hourly[0].dt;

  if (currentDate !== weatherReportDate) {
    getWeather();
    return null;
  }
  const currentHourEntry = Math.round(
    (Date.now() - earliestHourlyData * 1000) / 3600000
  );
  const currentData = data.hourly[currentHourEntry];

  // Get current rain fall, wind speed, temperature, snow , etc...
  const rainfall = currentData.rain ? currentData.rain["1h"] : 0;
  const windSpeed = currentData.wind_speed;
  const temperature = currentData.feels_like;
  const snow = currentData.snow ? currentData.snow["1h"] : 0;
  const clouds = currentData.clouds;
  const visiblity = currentData.visibility;
  const windDirection = currentData.wind_deg;

  //returns boolean for some
  const sunrise = data.current.sunrise * 1000;
  const sunset = data.current.sunset * 1000;
  const isDay = currentTime > sunrise && currentTime < sunset;

  // const isCloudy = data.current.clouds > 70;
  // const isGreyDay = isDay && isCloudy;

  let sunlow = false;
  const mins15 = 15 * 60 * 1000;
  if (
    (data.current.sunrise - mins15 < currentTime &&
      currentTime < data.current.sunrise + mins15) ||
    (data.current.sunset - mins15 < currentTime &&
      currentTime < data.current.sunrise + mins15)
  ) {
    sunlow = true;
  }

  weatherReport = {
    daytime: isDay,
    sunrise: sunrise,
    sunset: sunset,
    sunlow: sunlow,
    rainfall: rainfall,
    windSpeed: windSpeed,
    temperature: temperature,
    snow: snow,
    clouds: clouds,
    visiblity: visiblity,
    windDirection: windDirection,
    //add weather yellow orange red alerts too, might need to use String.prototype.includes()
  };
  setDay();
}

//dayset
function setDay() {
  resetDay();
  setTide();
  switch (true) {
    case weatherReport.sunlow:
      sunlow();
      break;
    case weatherReport.daytime && weatherReport.clouds > 70:
      greyday();
      break;
    case weatherReport.daytime:
      daytime();
      break;
    case weatherReport.daytime == false:
      night();
      break;
    default:
      console.log("Unknown parameter: " + weatherReport);
      break;
  }
  setWeather();
}

function resetDay() {
  document.querySelector("#container").className = "";
  document.querySelector("#cloud-container").classList.remove("remove");
  const sky = document.getElementById("sky-canvas");
  sky.getContext("2d").clearRect(0, 0, sky.width, sky.height);
  document.querySelectorAll(".clouds").forEach((cloud) => {
    cloud.classList.remove("sunset-clouds", "grey-clouds", "day-clouds");
  });
  document.querySelector("#sky-background").className = "";
  document.querySelector("#shooting-star").classList.add("remove");
  document.querySelector("#clare").classList.remove("clare-night");
  document.querySelector("#wave-container").classList.remove("grey-sea");
  document.querySelector("#front-wave-container").classList.remove("grey-sea");
}

function sunlow() {
  document.querySelector("#container").className = "day-container";
  document.querySelector("#sky-background").className = "sunset-sky";
  document.querySelectorAll(".clouds").forEach((cloud) => {
    cloud.classList.add("sunset-clouds");
  });
}

function greyday() {
  document.querySelector("#container").className = "grey-container";
  document.querySelector("#sky-background").className = "grey-sky";
  document.querySelectorAll(".clouds").forEach((cloud) => {
    cloud.classList.add("grey-clouds");
  });
  document.querySelector("#clare").classList.remove("clare-night");
  document.querySelector("#wave-container").classList.add("grey-sea");
  document.querySelector("#front-wave-container").classList.add("grey-sea");
}

function daytime() {
  document.querySelector("#container").className = "day-container";
  document.querySelector("#sky-background").className = "day-sky";
  document.querySelectorAll(".clouds").forEach((cloud) => {
    cloud.classList.add("day-clouds");
  });
}

function night() {
  nightSky();
  document.querySelector("#container").className = "night-container";
  document.querySelector("#sky-background").className = "night-sky";
  document.querySelector("#shooting-star").className = "";
  document.querySelector("#cloud-container").classList.add("remove");
  document.querySelector("#clare").classList.add("clare-night");
  document.querySelector("#wave-container").classList.add("grey-sea");
  // document.querySelector("#hotchoc").classList.remove("hide");
  document.querySelector("#front-wave-container").classList.add("grey-sea");
}

function nightSky() {
  const sky = document.getElementById("sky-canvas");
  const skyContext = sky.getContext("2d");
  let stars = [];

  sky.width = sky.clientWidth;
  sky.height = sky.clientHeight;
  skyContext.clearRect(0, 0, sky.width, sky.height);
  skyContext.fillStyle = "#FFF59D";

  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * sky.width,
      y: Math.random() * sky.height,
      radius: Math.random() * 5,
    });
  }

  for (let i = 0; i < stars.length; i++) {
    skyContext.beginPath();
    skyContext.arc(stars[i].x, stars[i].y, stars[i].radius, 0, 2 * Math.PI);
    skyContext.fill();
  }
}

//season set
//weather set wind, rain, snow, weather warnings, yellow orange red bin
function setWeather() {
  resetWeatherItems();
  switch (true) {
    case weatherReport.rainfall > 0.09:
      rain();
      break;
    default:
      console.log("No sprites to be shown " + weatherReport);
      break;
  }
}

function resetWeatherItems() {
  document.querySelector("#precipitation-container").className = "";
  document.querySelector("#umbrella").classList.add("hide");
}

function rain() {
  document.querySelector("#precipitation-container").classList.add("rain");
  document.querySelector("#umbrella").classList.remove("hide");
}

//tide set

async function getTide() {
  const tideApiKey =
    "48220c4c-beb2-11ed-92e6-0242ac130002-48220ce2-beb2-11ed-92e6-0242ac130002";
  const lat = 54.9596;
  const lon = -7.734439;

  const apiUrl = `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}`;

  await fetch(apiUrl, {
    headers: {
      Authorization: tideApiKey,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("tideData", JSON.stringify(data));
      console.log("Tide data saved to localStorage:", data);
    })
    .catch((error) => console.error(error));
}

// Find the nearest past and future tide events
function findNearestTides(referenceTime, tideData) {
  let prevTide = null;
  let nextTide = null;

  for (const tide of tideData) {
    const tideTime = new Date(tide.time).getTime();

    if (tideTime <= referenceTime) {
      if (!prevTide || tideTime > new Date(prevTide.time).getTime()) {
        prevTide = tide;
      }
    } else {
      if (!nextTide || tideTime < new Date(nextTide.time).getTime()) {
        nextTide = tide;
      }
    }
  }

  return { prevTide, nextTide };
}

// Calculate the estimated tide height and direction
function estimateTideStatus(referenceTime) {
  let tideData = JSON.parse(localStorage.getItem("tideData")).data;

  if (tideData == undefined) {
    const estimatedHeight = 0;
    const tideDirection = "rising";
    return { estimatedHeight, tideDirection };
  }

  const { prevTide, nextTide } = findNearestTides(referenceTime, tideData);

  const prevTime = new Date(prevTide.time).getTime();
  const nextTime = new Date(nextTide.time).getTime();
  const timeDiff = nextTime - prevTime;
  const currentDiff = referenceTime - prevTime;

  const prevHeight = prevTide.height;
  const nextHeight = nextTide.height;
  const heightDiff = nextHeight - prevHeight;

  const estimatedHeight = (heightDiff / timeDiff) * currentDiff + prevHeight;
  const tideDirection = estimatedHeight > prevHeight ? "rising" : "falling";

  weatherReport = {
    ...weatherReport,
    tidalHeight: estimatedHeight,
    tidalDirection: tideDirection,
  };

  return { estimatedHeight, tideDirection };
}

function setTide() {
  const tideData = localStorage.getItem("tideData");
  if (
    tideData.data != undefined &&
    864000000 >
      new Date(tideData.data[35].time).getTime() - new Date().getTime()
  ) {
    let referenceTime = new Date().getTime();
    const { estimatedHeight, tideDirection } =
      estimateTideStatus(referenceTime);

    if (tideDirection == "falling") {
      document.getElementById("front-wave").style.animation =
        "waves 50s linear infinite reverse";
      document.getElementById("wave-texture").style.animation =
        "waves 50s linear infinite reverse";
    } else if (tideDirection == "rising") {
      document.getElementById("front-wave").style.animation =
        "waves 50s linear infinite ";
      document.getElementById("wave-texture").style.animation =
        "waves 50s linear infinite ";
    }

    let tideHeight = estimatedHeight * 45 + 120 + "px";
    document.getElementById("front-wave-container").style.marginBottom =
      tideHeight;
  } else {
    getTide();
  }
}
