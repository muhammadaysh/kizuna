import "react-native-gesture-handler";
import "react-native-screens";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { BottomNavigation } from "react-native-paper";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import HomeScreen from "./screens/HomeScreen";
import MonitoringScreen from "./screens/MonitoringScreen";
import WateringScreen from "./screens/WateringScreen";
import DroneScreen from "./screens/DroneScreen";
import KText from "./components/KText";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerItem({ label, onPress, iconName }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: "row", padding: 10, alignItems: "center" }}
    >
      <MaterialCommunityIcons name={iconName} size={24} color={"#FFFFFF"} />
      <KText
        style={{
          color: "#FFFFFF",
          fontSize: 20,
          marginLeft: 10,
        }}
      >
        {label}
      </KText>
    </TouchableOpacity>
  );
}

function DrawerContent(props) {
  return (
    <View style={{ marginLeft: 5, marginTop: 30, flex: 1, alignItems: "left" }}>
      <CustomDrawerItem
        label="Home"
        iconName="home"
        labelStyle={{ color: "#FFFFFF", fontSize: 16 }}
        onPress={() => props.navigation.navigate("Home")} // Add navigation here
      />
      <CustomDrawerItem
        label="Monitoring"
        iconName="monitor"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Monitoring")} // Add navigation here
      />
      <CustomDrawerItem
        label="Watering"
        iconName="watering-can"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Watering")} // Add navigation here
      />
      <CustomDrawerItem
        label="Drone"
        iconName="drone"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Drone")} // Add navigation here
      />
    </View>
  );
}

function TabNavigation() {
  const [homeAnimation, setHomeAnimation] = useState(new Animated.Value(0));
  const [monitoringAnimation, setMonitoringAnimation] = useState(
    new Animated.Value(0)
  );
  const [wateringAnimation, setWateringAnimation] = useState(
    new Animated.Value(0)
  );
  const [droneAnimation, setDroneAnimation] = useState(new Animated.Value(0));

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

  return (
    <View style={{ flex: 1, backgroundColor: "#0F110E" }}>
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
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        width: size * 3, // Adjust this to change the size of the circle
                        height: size * 2.8, // Adjust this to change the size of the circle
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
          name="Monitoring"
          component={MonitoringScreen}
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
        />
      </Tab.Navigator>
    </View>
  );
}

const CustomHeader = () => {
  const route = useRoute();

  const getHeaderContent = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

    switch (routeName) {
      case "Monitoring":
        return (
          <KText style={{ fontWeight: "bold", fontSize: 20, margin: 10 }}>
            Monitoring
          </KText>
        );
      case "Watering":
        return (
          <KText style={{ fontWeight: "bold", fontSize: 20, margin: 10 }}>
            Watering
          </KText>
        );
      case "Drone":
        return (
          <KText style={{ fontWeight: "bold", fontSize: 20, margin: 10 }}>
            Drone
          </KText>
        );
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {getHeaderContent(route)}
    </View>
  );
};

const KebabMenu = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
      <Image
        source={require("./assets/kebabicon.png")}
        style={{ width: 45, height: 45, marginTop: 10, marginLeft: 10 }}
      />
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        drawerType="slide"
        overlayColor="transparent"
        sceneContainerStyle={{ backgroundColor: "transparent" }}
        drawerContentContainerStyle={{ flex: 1 }}
        screenOptions={{
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#0F110E",
          },
          headerLeft: () => <KebabMenu />,
          headerRight: () => <CustomHeader />,
          drawerPosition: "left",
          activeBackgroundColor: "transparent",
          inactiveBackgroundColor: "transparent",
          drawerStyle: {
            borderRadius: 30,
            width: 200,
            backgroundColor: "#212822",
          },
          headerShadowVisible: false,
        }}
      >
        <Drawer.Screen name="Menu" component={TabNavigation} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#2C332E",
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
