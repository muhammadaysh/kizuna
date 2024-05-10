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
} from "react-native";
import getWeatherData from "../components/Weather"; // Import the getWeatherData function
import iconMap from "../components/WeatherIcons";
import { Dimensions } from "react-native";
import KText from "../components/KText";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

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
    duration: 1000,
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

  if (error) {
    return <KText>Error: {error.message}</KText>;
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
      <KText style={styles.location}>Koshi, Kumamoto</KText>
      <KText style={styles.date}>{`${date} ${time}`}</KText>
      <Animated.View
        style={{
          transform: [
            { scale: pulseAnim },
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity onPress={startRotation}>
          {WeatherIcon}
        </TouchableOpacity>
      </Animated.View>
      <KText style={styles.temperature}>{`${Math.round(
        weatherData.main.temp
      )}°C`}</KText>
      <KText style={styles.weather}>{weatherData.weather[0].main}</KText>
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
    margin:10,
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