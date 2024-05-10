import axios from 'axios';

export default function getWeatherData() {
  return new Promise((resolve, reject) => {
    axios.get('http://api.openweathermap.org/data/2.5/weather?lat=32.8401&lon=130.7419&units=metric&appid=0a4801094dc3f95be6267620986952fd')
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
}