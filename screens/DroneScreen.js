import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import KText from "../components/KText";


export default function DroneScreen() {
  return (
    <View style={styles.container}>
      <KText>Drone Screen</KText>
      <StatusBar style="auto" />
    </View>
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
    top: 0,
  },
});
