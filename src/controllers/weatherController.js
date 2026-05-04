const Farmer = require("../models/farmer");

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_CACHE_TTL = 15 * 60 * 1000;

const cache = new Map();

const weatherCodeLabels = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

const getWeatherCondition = (code) => {
  return weatherCodeLabels[code] || "Weather update";
};

const getCacheKey = ({ location, latitude, longitude }) => {
  if (latitude && longitude) {
    return `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`;
  }

  return location.trim().toLowerCase();
};

const round = (value) => {
  if (typeof value !== "number") return 0;
  return Math.round(value);
};

const getFarmerAdvisories = (today) => {
  const advisories = [];

  if (today.rain_chance >= 70 || today.precipitation_mm >= 20) {
    advisories.push({
      type: "warning",
      title: "Rain expected",
      message: "Avoid pesticide spraying and keep harvested crop covered.",
    });
  } else if (today.rain_chance <= 25 && today.temperature_max >= 32) {
    advisories.push({
      type: "info",
      title: "Irrigation check",
      message: "Low rain chance and warm weather. Check soil moisture before irrigation.",
    });
  }

  if (today.wind_speed_kmh >= 35) {
    advisories.push({
      type: "warning",
      title: "High wind",
      message: "Avoid spraying and be careful with light field covers or stored material.",
    });
  }

  if (today.temperature_max >= 38) {
    advisories.push({
      type: "warning",
      title: "High temperature",
      message: "Prefer morning or evening field work and keep water available for workers.",
    });
  }

  if (today.rain_chance < 40 && today.wind_speed_kmh < 25 && today.temperature_max < 36) {
    advisories.push({
      type: "success",
      title: "Good field window",
      message: "Weather looks suitable for regular field operations today.",
    });
  }

  return advisories.slice(0, 3);
};

const findLocation = async (location) => {
  const params = new URLSearchParams({
    name: `${location}, India`,
    count: "1",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to find weather location.");
  }

  const data = await response.json();
  const result = data?.results?.[0];

  if (!result) {
    throw new Error("No weather forecast found for this location.");
  }

  return {
    name: result.name,
    region: result.admin1 || result.admin2 || "",
    country: result.country || "India",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || "Asia/Kolkata",
  };
};

const getLocationFromCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error("Invalid location coordinates.");
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error("Location coordinates are out of range.");
  }

  return {
    name: "Current Location",
    region: "",
    country: "India",
    latitude: lat,
    longitude: lon,
    timezone: "Asia/Kolkata",
  };
};

const getForecast = async (locationInfo) => {
  const params = new URLSearchParams({
    latitude: String(locationInfo.latitude),
    longitude: String(locationInfo.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to fetch weather forecast right now.");
  }

  return response.json();
};

const formatForecast = (locationInfo, forecast) => {
  const daily = forecast.daily || {};
  const days = (daily.time || []).map((date, index) => ({
    date,
    condition: getWeatherCondition(daily.weather_code?.[index]),
    weather_code: daily.weather_code?.[index],
    temperature_max: round(daily.temperature_2m_max?.[index]),
    temperature_min: round(daily.temperature_2m_min?.[index]),
    precipitation_mm: round(daily.precipitation_sum?.[index]),
    rain_chance: round(daily.precipitation_probability_max?.[index]),
    wind_speed_kmh: round(daily.wind_speed_10m_max?.[index]),
  }));

  const today = days[0] || {};
  const current = forecast.current || {};

  return {
    location: locationInfo,
    current: {
      temperature: round(current.temperature_2m),
      condition: getWeatherCondition(current.weather_code),
      weather_code: current.weather_code,
      humidity: round(current.relative_humidity_2m),
      precipitation_mm: round(current.precipitation),
      wind_speed_kmh: round(current.wind_speed_10m),
      updated_at: current.time,
    },
    today,
    forecast: days,
    advisory: getFarmerAdvisories(today),
    provider: "Open-Meteo",
  };
};

exports.getWeatherForecast = async (req, res) => {
  try {
    const farmer_id = req.user.user_id;
    const profile = await Farmer.getProfile(farmer_id);
    const requestedLocation = req.query.location?.trim();
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const location = requestedLocation || profile?.farmer_village;

    if ((!latitude || !longitude) && (!location || location.length < 2)) {
      return res.status(400).send({
        success: false,
        message: "Please allow location access or enter a valid village, town, or city name.",
      });
    }

    if (location && location.length > 80) {
      return res.status(400).send({
        success: false,
        message: "Location name is too long.",
      });
    }

    const cacheKey = getCacheKey({ location, latitude, longitude });
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < WEATHER_CACHE_TTL) {
      return res.status(200).send({
        success: true,
        data: cached.data,
        message: "Weather forecast fetched successfully.",
      });
    }

    const locationInfo =
      latitude && longitude
        ? getLocationFromCoordinates(latitude, longitude)
        : await findLocation(location);
    const forecast = await getForecast(locationInfo);
    const data = formatForecast(locationInfo, forecast);

    cache.set(cacheKey, {
      createdAt: Date.now(),
      data,
    });

    return res.status(200).send({
      success: true,
      data,
      message: "Weather forecast fetched successfully.",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: error.message || "Failed to fetch weather forecast.",
    });
  }
};
