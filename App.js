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
import TaskScreen from "./screens/TaskScreen";
import WateringScreen from "./screens/WateringScreen";
import DroneScreen from "./screens/DroneScreen";
import TaskDetailScreen from "./screens/TaskDetailScreen";
import KText from "./components/KText";
import {
  StreamingContext,
  StreamingProvider,
} from "./components/StreamingContext";
import { SocketContext, SocketProvider } from "./components/SocketContext";
import DrawerContent from "./components/DrawerContent";
import TabNavigation from "./components/TabNavigation";
import Orientation from "react-native-orientation-locker";
import * as MediaLibrary from "expo-media-library";
import notifee, { EventType } from "@notifee/react-native";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

notifee.onBackgroundEvent(async (event) => {
  switch (event.type) {
    case EventType.DISMISSED:
      console.log("User dismissed notification", event.notification);
      break;
    case EventType.PRESS:
      console.log("User pressed notification", event.notification);
      break;
  }
});

const CustomHeader = ({ route }) => {
  const getHeaderContent = (route) => {
    if (!route || !getFocusedRouteNameFromRoute) return null;

    const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

    switch (routeName) {
      
      case "Task":
        return (
          <KText
            style={{
              fontWeight: "bold",
              fontSize: 20,
              margin: 10,
              paddingTop: 20,
            }}
          >
            Task Reminder
          </KText>
        );
      // case "Watering":
      //   return (
      //     <KText style={{ fontWeight: "bold", fontSize: 20, margin: 10 }}>
      //       Watering
      //     </KText>
      //   );
      case "Drone":
        return (
          <KText style={{ fontWeight: "bold", fontSize: 20, margin: 10,              paddingTop: 20,
          }}>
            Drone Control
          </KText>
        );
      default:
        return null;
    }
  };

  if (!route) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0F110E",
        paddingTop: 20,
      }}
    >
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
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            header: () => <CustomHeader route={route} />,
            headerStyle: {
              backgroundColor: "#0F110E",
            },
          })}
        >
          {isStreaming ? (
            <Stack.Screen name="Drone" component={DroneScreen} />
          ) : (
            <>
              <Stack.Screen name="Menu" component={TabNavigation} />
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function DrawerNavigator() {
  const { isStreaming } = useContext(StreamingContext);

  return (
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
        headerLeft: () => !isStreaming && <KebabMenu />,
        headerRight: () => !isStreaming && <CustomHeader />,
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
