import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import getWeatherData from "./Weather"; // Import the getWeatherData function
import iconMap from "./WeatherIcons";
import { Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await getWeatherData();
      setWeatherData(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(() => {
      fetchWeatherData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchWeatherData();
    }, [])
  );

  if (error) {
    return <Text>Error: {error.message}</Text>;
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
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.location}>{weatherData.name}</Text>
      <Text style={styles.date}>{`${date} ${time}`}</Text>
      {WeatherIcon}
      <Text style={styles.temperature}>{`${Math.round(weatherData.main.temp)}°C`}</Text>
      <Text style={styles.weather}>{weatherData.weather[0].main}</Text>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4FAF6",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 0,
  },
  location: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  date: {
    fontSize: 18,
    textAlign: "center",
  },
  temperature: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
  },
  weather: {
    fontSize: 24,
    textAlign: "center",
  },
});