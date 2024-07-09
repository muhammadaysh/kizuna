import React, { useState, useContext, useEffect } from "react";
import { View, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import HomeScreen from "../screens/HomeScreen";
import TaskScreen from "../screens/TaskScreen";
import TaskDetailScreen from "../screens/TaskDetailScreen";
import WateringScreen from "../screens/WateringScreen";
import DroneScreen from "../screens/DroneScreen";
import { StreamingContext } from "./StreamingContext";


const Tab = createBottomTabNavigator();

export default function TabNavigation({ route }) {
  const [homeAnimation, setHomeAnimation] = useState(new Animated.Value(0));
  const [taskAnimation, setTaskAnimation] = useState(
    new Animated.Value(0)
  );
  const [wateringAnimation, setWateringAnimation] = useState(
    new Animated.Value(0)
  );
  const [droneAnimation, setDroneAnimation] = useState(new Animated.Value(0));
  const { isStreaming } = useContext(StreamingContext);

  console.log("Streaming: " + isStreaming);

  const startAnimation = (animation, toValue) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: toValue + 0.2,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animation, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animatedStyles = (animation) => ({
    borderRadius: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    }),
    transform: [
      {
        scale: animation,
      },
    ],
  });

  useEffect(() => {
    console.log("Current route:", route);
  }, [route]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0F110E" }}>
      {isStreaming ? (
        <DroneScreen />
      ) : (
        <>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              height: 80,
              width: "100%",
              backgroundColor: "#0F110E",
              zIndex: 1,
            }}
          />
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let animation;

                if (route.name === "Home") {
                  iconName = "home";
                  animation = homeAnimation;
                } else if (route.name === "Task") {
                  iconName = "calendar";
                  animation = taskAnimation;
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
                    <View
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <Animated.View
                        style={[
                          {
                            position: "absolute",
                            width: size * 3,
                            height: size * 2.8,
                            backgroundColor: "#4B8E4B",
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          animatedStyles(animation),
                        ]}
                      />
                      <MaterialCommunityIcons
                        name={iconName}
                        size={size}
                        color="#FFFFFF"
                      />
                    </View>
                  );
                } else {
                  animation.setValue(0);
                  startAnimation(animation, 0.85);
                  return (
                    <View
                      style={{
                        padding: 11,
                        paddingBottom: 9,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={iconName}
                        size={size}
                        color={"#FFFFFF"}
                      />
                    </View>
                  );
                }
              },
              tabBarActiveTintColor: "green",
              tabBarInactiveTintColor: "385442",
              tabBarStyle: {
                backgroundColor: "#242424",
                borderRadius: 20,
                margin: 10,
                paddingHorizontal: 20,
                height: 55,
                position: "absolute",
                bottom: 0,
                elevation: 2,
                borderTopWidth: 0,
                zIndex: 2,
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
            <Tab.Screen
              name="Task"
              component={TaskScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Watering"
              component={WateringScreen}
              options={{ headerShown: false }}
            />
            <Tab.Screen
              name="Drone"
              component={DroneScreen}
              options={{ headerShown: false }}
              initialParams={{ isStreaming: false }}
            />
             {/* <Tab.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ headerShown: false }}
              initialParams={{ isStreaming: false }}
            /> */}
          </Tab.Navigator>
        </>
      )}
    </View>
  );
}
