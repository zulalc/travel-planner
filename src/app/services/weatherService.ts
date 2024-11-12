import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY!;
const GEO_URL = "http://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "http://api.openweathermap.org/data/2.5/forecast";

const getDatesBetween = (startDate: Date, endDate: Date) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dates;
};

interface DailyForecast {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: Array<{ main: string; description: string; icon: string }>;
}

export const fetchWeather = async (city: string, dateRange: string) => {
  if (!city) {
    throw new Error("City is required"); // Handle empty city input
  }

  const [startDateStr, endDateStr] = dateRange.split(" to ");
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const dates = getDatesBetween(startDate, endDate);

  try {
    console.log("Fetching weather for city:", city);

    //coordinates of the city using Geo API
    const geoResponse = await axios.get(
      `${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`
    );
    const { lat, lon } = geoResponse.data[0];

    //Fetch the weather data for the city
    const weatherDataArray: DailyForecast[] = [];
    const url = `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await axios.get(url);

    // Step 3: Filter the data for each day within the range
    for (const date of dates) {
      const dayData = response.data.list.filter((item: DailyForecast) => {
        // Convert dt_txt to a Date object and only consider the date (ignoring time)
        const itemDate = new Date(item.dt_txt).toLocaleDateString();
        return itemDate === date.toLocaleDateString();
      });

      if (dayData.length > 0) {
        weatherDataArray.push(dayData[4]); // get weather data of 12.00 pm
      }
    }

    console.log(weatherDataArray);

    return weatherDataArray;
  } catch (error) {
    console.log("Error fetching weather data", error);
    throw error;
  }
};
