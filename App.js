import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { BottomNavigation } from "react-native-paper";
import { Animated } from "react-native";
import HomeScreen from "./components/HomeScreen";
import MonitoringScreen from "./components/MonitoringScreen";
import WateringScreen from "./components/WateringScreen";
import DroneScreen from "./components/DroneScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const [homeAnimation, setHomeAnimation] = useState(new Animated.Value(0));
  const [monitoringAnimation, setMonitoringAnimation] = useState(
    new Animated.Value(0)
  );
  const [wateringAnimation, setWateringAnimation] = useState(
    new Animated.Value(0)
  );
  const [droneAnimation, setDroneAnimation] = useState(new Animated.Value(0));

  const startAnimation = (animation) => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const animatedStyles = (animation) => ({
    backgroundColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["#FFFFFF", "#385442"],
    }),
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [55, 0], // adjust the output range to your needs
        }),
      },
    ],
  });

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let animation;

            if (route.name === "Home") {
              iconName = "home";
              animation = homeAnimation;
            } else if (route.name === "Monitoring") {
              iconName = "monitor";
              animation = monitoringAnimation;
            } else if (route.name === "Watering") {
              iconName = "watering-can";
              animation = wateringAnimation;
            } else if (route.name === "Drone") {
              iconName = "drone";
              animation = droneAnimation;
            }

            if (!focused) {
              animation.setValue(0);
              startAnimation(animation);
            }

            if (focused) {
              startAnimation(animation);
              return (
                <View style={{ height: 55, overflow: 'hidden' }}>
                  <Animated.View
                    style={[
                      {
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                        padding: 11,
                        paddingBottom: 9,
                        marginBottom: -3,
                        height: 55,
                        marginTop:4,
                      },
                      animatedStyles(animation),
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={iconName}
                      size={size}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                </View>
              );
            } else {
              return (
                <View
                  style={{
                    padding: 11,
                    paddingBottom: 9,
                    marginBottom: -3,
                  }}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={size}
                    color={"#4E674F"}
                  />
                </View>
              );
            }
          },
          tabBarActiveTintColor: "green",
          tabBarInactiveTintColor: "385442",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            margin: 10,
            paddingHorizontal: 20,
            height:55,
            position: "absolute",
            bottom: 0,
            elevation: 2,
            borderTopWidth: 0, // This will remove the border
          },
          tabBarLabelStyle: {
            display: "none",
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Monitoring" component={MonitoringScreen} />
        <Tab.Screen name="Watering" component={WateringScreen} />
        <Tab.Screen name="Drone" component={DroneScreen} />
      </Tab.Navigator>
    </NavigationContainer>
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
});
