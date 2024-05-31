import "react-native-gesture-handler";
import "react-native-screens";
import React, { useState, useContext, createContext, useEffect } from "react";
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
import {
  StreamingContext,
  StreamingProvider,
} from "./components/StreamingContext";
import { SocketContext, SocketProvider } from "./components/SocketContext";
import DrawerContent from "./components/DrawerContent";
import TabNavigation from "./components/TabNavigation";
import Orientation from "react-native-orientation-locker";
import * as MediaLibrary from 'expo-media-library';


const Drawer = createDrawerNavigator();

const CustomHeader = ({ route }) => {
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
      default:
        return null;
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
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);
  return (
    <SocketProvider>
      <StreamingProvider>
        <AppContent />
      </StreamingProvider>
    </SocketProvider>
  );
}

function AppContent() {
  const { isStreaming } = useContext(StreamingContext);

  return (
    <NavigationContainer>
      {isStreaming ? (
        <DroneScreen />
      ) : (
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} />}
          drawerType="slide"
          overlayColor="transparent"
          sceneContainerStyle={{ backgroundColor: "transparent" }}
          drawerContentContainerStyle={{ flex: 1 }}
          screenOptions={({ route }) => ({
            headerTitle: "",
            headerStyle: {
              backgroundColor: "#0F110E",
            },
            headerLeft: () => !isStreaming && <KebabMenu />,
            headerRight: () => !isStreaming && <CustomHeader route={route} />,
            drawerPosition: "left",
            activeBackgroundColor: "transparent",
            inactiveBackgroundColor: "transparent",
            drawerStyle: {
              borderRadius: 30,
              width: 200,
              backgroundColor: "#212822",
            },
            headerShadowVisible: false,
            // gestureEnabled: !isStreaming,
          })}
        >
          <Drawer.Screen name="Menu" component={TabNavigation} />
        </Drawer.Navigator>
      )}
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
