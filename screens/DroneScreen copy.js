// import React from "react";
// import { Button, StyleSheet, View } from "react-native";
// import dgram from "react-native-udp";
// import KText from "../components/KText";

// export default function DroneScreen() {
//   const client = dgram.createSocket('udp4');
//   client.bind(8889); // Tello SDK commands are sent from this port

//   const sendCommand = (command) => {
//     client.send(command, 0, command.length, 8889, '192.168.10.1', (err) => {
//       if (err) {
//         console.error('Failed to send command', err);
//       } else {
//         console.log('Command sent: ' + command);
//       }
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <KText>Drone Screen</KText>
//       <Button title="Connect" onPress={() => sendCommand('command')} />
//       <Button title="Take Off" onPress={() => sendCommand('takeoff')} />
//       <Button title="Land" onPress={() => sendCommand('land')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#0F110E",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });