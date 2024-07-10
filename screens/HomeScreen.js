import React, { useEffect, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getWeatherData, getWeatherDataNext5days } from "../components/Weather"; // Import the getWeatherData function
import iconMap from "../components/WeatherIcons";
import { Dimensions } from "react-native";
import KText from "../components/KText";
import Icon from "react-native-vector-icons/FontAwesome5";
import WeatherError from "../assets/weatherError";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [next24HoursData, setNext24HoursData] = useState([]);
  const [next5DaysData, setNext5DaysData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await getWeatherData();
      setWeatherData(data);

      const fiveDaysData = await getWeatherDataNext5days();
      const now = Date.now();
      const twentyFourHoursLater = now + 24 * 60 * 60 * 1000;

      const forecasts24Hours = fiveDaysData.filter((forecast) => {
        const forecastTime = new Date(forecast.dt_txt).getTime();
        return forecastTime >= now && forecastTime <= twentyFourHoursLater;
      });
      setNext24HoursData(forecasts24Hours);

      const forecasts5Days = fiveDaysData.filter((forecast) => {
        const forecastTime = new Date(forecast.dt_txt).getTime();
        return (
          forecastTime >= now && forecastTime <= now + 5 * 24 * 60 * 60 * 1000
        );
      });

      const averagedDaysData = averageDaysWeatherData(forecasts5Days);
      console.log(averagedDaysData);
      setNext5DaysData(averagedDaysData);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(
        "Failed to fetch weather data. Weather data cannot be fetched when connected to Drone"
      );
      setIsLoading(false);
    }
  };

  const averageDaysWeatherData = (forecasts5Days) => {
    const daysMap = new Map();
    forecasts5Days.forEach((forecast) => {
      const dateKey = forecast.dt_txt.split(" ")[0];
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, { temperatures: [], weatherIcons: {} });
      }
      daysMap.get(dateKey).temperatures.push(forecast.main.temp);
      const weatherIcon = forecast.weather[0].icon;
      if (!daysMap.get(dateKey).weatherIcons[weatherIcon]) {
        daysMap.get(dateKey).weatherIcons[weatherIcon] = 1;
      } else {
        daysMap.get(dateKey).weatherIcons[weatherIcon]++;
      }
    });

    const averagedDaysData = [];
    daysMap.forEach((value, key) => {
      const totalTemperatures = value.temperatures.reduce(
        (acc, temp) => acc + temp,
        0
      );
      const avgTemperature = totalTemperatures / value.temperatures.length;
      const dominantIcon = Object.keys(value.weatherIcons).reduce((a, b) =>
        value.weatherIcons[a] > value.weatherIcons[b] ? a : b
      );

      const date = new Date(key);
      const formattedDate = date
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
        .replace(",", "");

      averagedDaysData.push({
        date: formattedDate,
        avgTemperature: avgTemperature.toFixed(1),
        dominantIcon,
      });
    });

    return averagedDaysData;
  };
  // useEffect(() => {
  //   fetchWeatherData();
  //   const interval = setInterval(() => {
  //     fetchWeatherData();
  //   }, 100000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => startPulse());
  };

  const startRotation = () => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0);
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchWeatherData();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4B8E4B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <WeatherError width={250} height={250} />
        </Animated.View>
        <KText style={{ textAlign: "center", fontWeight: "bold" }}>
          {error}
        </KText>
      </View>
    );
  }

  if (!weatherData) {
    return null;
  }

  const WeatherIcon = iconMap[weatherData.weather[0].icon];
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchWeatherData} />
      }
    >
      <View style={styles.weatherContainer}>
        <KText style={styles.location}>Koshi, Kumamoto</KText>
        <KText style={styles.date}>{`${date} ${time}`}</KText>
        <Animated.View
          style={{
            transform: [
              { scale: pulseAnim },
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity onPress={startRotation}>
            <WeatherIcon width="200" height="200" />
          </TouchableOpacity>
        </Animated.View>
        <KText style={styles.temperature}>{`${Math.round(
          weatherData.main.temp
        )}°C`}</KText>
        <KText style={styles.weather}>{weatherData.weather[0].main}</KText>
      </View>
      <View style={styles.greyContainer}>
        <View style={styles.row}>
          <View style={styles.greenContainer}>
            <Icon name="wind" size={30} color="#FFFFFF" />
            <View style={styles.textContainer}>
              <KText style={styles.iconText}>
                {weatherData.wind.speed} m/s
              </KText>
              <KText style={styles.iconText}>Wind Speed</KText>
            </View>
          </View>
          <View style={styles.greenContainer}>
            <Icon name="compass" size={30} color="#FFFFFF" />
            <View style={styles.textContainer}>
              <KText style={styles.iconText}>{weatherData.wind.deg}°</KText>
              <KText style={styles.iconText}>Wind Direction</KText>
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.greenContainer}>
            <Icon name="tint" size={30} color="#FFFFFF" />
            <View style={styles.textContainer}>
              <KText style={styles.iconText}>
                {weatherData.main.humidity}%
              </KText>
              <KText style={styles.iconText}>Humidity</KText>
            </View>
          </View>
          <View style={styles.greenContainer}>
            <Icon name="circle" size={30} color="#FFFFFF" />
            <View style={styles.textContainer}>
              <KText style={styles.iconText}>
                {weatherData.main.pressure} hPa
              </KText>
              <KText style={styles.iconText}>Air Pressure</KText>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.hourlyContainer}>
        <KText style={styles.forecastTitle}>3-hour Forecast</KText>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {next24HoursData.map((hourData, index) => {
            const timePart = hourData.dt_txt.split(" ")[1];
            const hourMinute = timePart.split(":").slice(0, 2).join(":");
            const roundedTemp = Math.round(hourData.main.temp);
            const HourlyWeatherIcon = iconMap[hourData.weather[0].icon];

            return (
              <View key={index} style={styles.tempSegment}>
                <KText
                  style={{ ...styles.iconText, fontWeight: "bold" }}
                >{`${roundedTemp}°C`}</KText>
                <HourlyWeatherIcon width="35" height="35" />
                <KText style={styles.iconText}>{hourMinute}</KText>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.dailyContainer}>
        <KText style={styles.forecastTitle}>5-day Forecast</KText>
        {next5DaysData.map((dayData, index) => {
          const roundedTemp = Math.round(parseFloat(dayData.avgTemperature));
          const DailyWeatherIcon = iconMap[dayData.dominantIcon];
          const displayDate = index === 0 ? "Today" : dayData.date;

          return (
            <View key={index} style={styles.dailySegment}>
              <View style={styles.dateSegmentPart}>
                <KText style={styles.iconText}>{displayDate}</KText>
              </View>
              <View style={styles.segmentPart}>
                <DailyWeatherIcon width="35" height="35" />
              </View>
              <View style={styles.segmentPart}>
                <KText style={styles.iconText}>{`${roundedTemp}°C`}</KText>
              </View>
              
            </View>
          );
        })}
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    position: "absolute",
    top: -30,
  },
  location: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  date: {
    marginBottom: -15,
    fontSize: 18,
    textAlign: "center",
  },
  temperature: {
    marginTop: -15,
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
  },
  weather: {
    fontSize: 24,
    textAlign: "center",
  },
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 80,
    backgroundColor: "#0F110E",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  weatherContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  greyContainer: {
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 10,
    height: 210,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 30,
  },
  hourlyContainer: {
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 10,
    height: 145,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  dailyContainer: {
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 13,
    height: 450,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  dailySegment: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#333",
    borderRadius: 10,
    height: "15%",
  },

  dateSegmentPart: {
    width: "50%",
    justifyContent: "center",
  },
  segmentPart: {
    width: "30%",
    justifyContent: "center",
  },


  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  greenContainer: {
    flexDirection: "row",
    backgroundColor: "#4B8E4B",
    borderRadius: 20,
    padding: 15,
    width: "47%",
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },
  tempSegment: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  tempText: {
    color: "#fff",
  },
  forecastTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
});
