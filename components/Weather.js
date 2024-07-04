import axios from "axios";

const BASE_URL = "http://api.openweathermap.org/data/2.5";
const API_KEY = "0a4801094dc3f95be6267620986952fd"; // Replace with your actual API key
const LAT = "32.8401";
const LON = "130.7419";

export function getWeatherData() {
  const url = `${BASE_URL}/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;
  return axios
    .get(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw error; // Rethrow to allow caller to handle
    });
}

export function getWeatherDataNext5days() {
  const url = `${BASE_URL}/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;
  return axios
    .get(url)
    .then((response) => {
      return response.data.list;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

