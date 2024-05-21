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
import getWeatherData from "../components/Weather"; // Import the getWeatherData function
import iconMap from "../components/WeatherIcons";
import { Dimensions } from "react-native";
import KText from "../components/KText";
import Icon from "react-native-vector-icons/FontAwesome5";

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

  // useEffect(() => {
  //   fetchWeatherData();
  //   const interval = setInterval(() => {
  //     fetchWeatherData();
  //   }, 30000);
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
      // fetchWeatherData();
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
            {WeatherIcon}
            
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
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0F110E",
    alignItems: "center",
    justifyContent: "center",
  },

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
  weatherContainer: {
    position: "absolute",
    zIndex: 1,
    top: -320,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  greyContainer: {
    position: "absolute",
    backgroundColor: "#242424",
    borderRadius: 20,
    padding: 10,
    height: 210,
    top: 400,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
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
    padding: 10,
    width: "47%",
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontWeight: "bold",
  },
  textContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },
});
