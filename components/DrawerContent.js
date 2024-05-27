import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "react-native-vector-icons";
import KText from "./KText";

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

export default function DrawerContent(props) {
  return (
    <View style={{ marginLeft: 5, marginTop: 30, flex: 1, alignItems: "left" }}>
      <CustomDrawerItem
        label="Home"
        iconName="home"
        labelStyle={{ color: "#FFFFFF", fontSize: 16 }}
        onPress={() => props.navigation.navigate("Home")}
      />
      <CustomDrawerItem
        label="Monitoring"
        iconName="monitor"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Monitoring")}
      />
      <CustomDrawerItem
        label="Watering"
        iconName="watering-can"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Watering")}
      />
      <CustomDrawerItem
        label="Drone"
        iconName="drone"
        labelStyle={{ color: "#FFFFFF" }}
        onPress={() => props.navigation.navigate("Drone")}
      />
    </View>
  );
}