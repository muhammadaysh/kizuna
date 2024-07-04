import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  Button,
  StyleSheet,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  ToastAndroid,
  requireNativeComponent,
  NativeModules,
  findNodeHandle,
  PanResponder,
  Text,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import KText from "../components/KText";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome5";
import Orientation from "react-native-orientation-locker";
import {
  StreamingContext,
  StreamingProvider,
} from "../components/StreamingContext";
import { SocketContext, SocketProvider } from "../components/SocketContext";
import { AntDesign } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import DroneFly from "../assets/droneFly.svg";
import { MaterialIcons } from "@expo/vector-icons";
const StreamingViewJava = requireNativeComponent("StreamingView");
const { TelloStreamModule } = NativeModules;
import { JoystickLeft, JoystickRight } from "../components/Joystick";

const screenWidth = Dimensions.get("window").width;

export default function DroneScreen({ navigation, route }) {
  const { isStreaming, connectAndStartStreaming, stopStreaming } =
    useContext(StreamingContext);
  const { client, server, videoServer, encodedStream } =
    useContext(SocketContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialScreen, setIsInitialScreen] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [moveInterval, setMoveInterval] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [language, setLanguage] = useState("english");
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const openWifiSettings = async () => {
    if (Platform.OS === "android") {
      try {
        await Linking.openURL("android.settings.WIFI_SETTINGS");
      } catch (e) {
        console.error(
          "Failed to open Wi-Fi settings directly, opening app settings as fallback.",
          e
        );
        Linking.openSettings();
      }
    } else if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:root=WIFI");
    }
  };

  const handlePress = (prop) => {
    if (prop === "off") {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to stop streaming?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => handleStopStreaming() },
        ],
        { cancelable: true }
      );
    } else if (prop === "emergency") {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to proceed with emergency?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => sendCommand("emergency") },
        ],
        { cancelable: true }
      );
    }
  };
  const toggleLanguage = () => {
    setLanguage((prevLanguage) =>
      prevLanguage === "english" ? "japanese" : "english"
    );
  };

  const playerRef = useRef(null);
  const streamingViewRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  useEffect(() => {
    if (isStreaming) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  }, [isStreaming]);

  useEffect(() => {
    console.log("isStreaming changed:", isStreaming);
  }, [isStreaming]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setShowPlayer(true);
    }, 600);

    return () => clearTimeout(delay);
  }, []);

  function parseState(state) {
    return state
      .split(";")
      .map((x) => x.split(":"))
      .reduce((data, [key, value]) => {
        data[key] = value;
        return data;
      }, {});
  }

  const sendCommand = (command) => {
    if (!command) {
      console.error("Command is undefined");
      return;
    } else {
      client.current.send(
        command,
        0,
        command.length,
        8889,
        "192.168.10.1",
        (err) => {
          if (err) {
            console.error("Failed to send command", err);
            setIsConnected(false);
          } else {
            console.log("Command sent: " + command);
          }
        }
      );
    }
  };

  useEffect(() => {
    const sendInitialCommand = () => {
      sendCommand("command");

      const messageListener = (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        if (msg) {
          sendCommand("speed 30");
          setIsConnected(true);
          server.current.removeListener("message", messageListener);
          clearInterval(autoConnectInterval);
        }
      };

      server.current.on("message", messageListener);
    };

    const autoConnectInterval = setInterval(() => {
      if (!isConnected) {
        sendInitialCommand();
      } else {
        clearInterval(autoConnectInterval);
      }
    }, 3000);
    return () => clearInterval(autoConnectInterval);
  }, [sendCommand, setIsConnected, setIsLoading, isConnected]);

  const handleConnectAndStartStreaming = () => {
    if (!isConnected) {
      setIsLoading(true);
      sendCommand("command");

      let receivedResponse = false;

      const messageListener = (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        if (msg) {
          setIsConnected(true);
          receivedResponse = true;
          sendCommand("speed 30");
          sendCommand("streamon");
          setIsLoading(false);
          connectAndStartStreaming();

          server.current.removeListener("message", messageListener);
        }
      };

      server.current.on("message", messageListener);

      setTimeout(() => {
        if (!receivedResponse) {
          setIsLoading(false);
          ToastAndroid.show(
            "No response from drone. Please check if drone is connected via wifi.",
            ToastAndroid.LONG
          );
        }
      }, 500);
    } else {
      sendCommand("streamon");
      connectAndStartStreaming();
    }
  };

  const handleStopStreaming = () => {
    if (isConnected) {
      sendCommand("streamoff");
      stopStreaming();
      Orientation.lockToPortrait();
      // navigation.navigate("DroneScreen");
      console.log("Streaming stopped.");
    } else {
      console.log("Not connected. Cannot stop streaming.");
    }
  };

  useEffect(() => {
    if (isStreaming && streamingViewRef.current) {
      const timeoutId = setTimeout(() => {
        console.log("Ref current value:", streamingViewRef.current);
        const handle = findNodeHandle(streamingViewRef.current);
        console.log("Attempting to start stream with handle:", handle);
        try {
          TelloStreamModule.startStream(handle);
          console.log("Stream started successfully");
        } catch (error) {
          console.error("Failed to start stream:", error);
        }
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [streamingViewRef.current, isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      const batteryCheckInterval = setInterval(() => {
        sendCommand("battery?");
      }, 5000);

      const messageListener = (msg) => {
        handleDroneMessage(msg);
      };

      client.current.on("message", messageListener);

      return () => {
        clearInterval(batteryCheckInterval);
        client.current.removeListener("message", messageListener);
      };
    }
  }, [isStreaming]);

  const handleDroneMessage = (msg) => {
    const messageString = msg.toString().trim();
    console.log(messageString);
    const batteryLevel = parseInt(messageString, 10);
    setBatteryPercentage(batteryLevel);
  };

  const getBatteryIcon = (batteryPercentage) => {
    if (batteryPercentage >= 75) return "battery-full";
    if (batteryPercentage >= 50) return "battery-3-bar";
    if (batteryPercentage >= 25) return "battery-2-bar";
    return "battery-1-bar";
  };

  const handleLeftMove = ({ leftRight, forwardBackward }) => {
    sendRCCommand({ leftRight, forwardBackward });
  };

  const handleRightMove = ({ upDown, yaw }) => {
    sendRCCommand({ upDown, yaw });
  };

  const sendRCCommand = ({
    leftRight = 0,
    forwardBackward = 0,
    upDown = 0,
    yaw = 0,
  }) => {
    const command = `rc ${leftRight} ${forwardBackward} ${upDown} ${yaw}`;
    sendCommand(command);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isStreaming ? (
        <>
          {console.log("StreamingContext values in DroneScreen:", {
            isStreaming,
            connectAndStartStreaming,
          })}
          <View style={styles.innerContainer}>
            <DroneFly width={300} height={300} style={{ marginTop: -70 }} />

            <View style={styles.greyContainer}>
              <View style={{ justifyContent: "center" }}>
                <View style={styles.header}>
                  <KText
                    style={{
                      textAlign: "center", // Corrected typo from "centre" to "center"
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    {language === "english"
                      ? "How to connect?"
                      : "接続方法は？"}
                  </KText>
                  <TouchableOpacity
                    onPress={toggleLanguage}
                    style={styles.languageButton}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon name="language" size={20} color="#fff" />
                      <KText>
                        {language === "english" ? " 日本語" : " English"}
                      </KText>
                    </View>
                  </TouchableOpacity>
                </View>

                <View>
                  <KText
                    style={{
                      textAlign: "left",
                      marginTop: -8,
                      fontSize: 15,
                    }}
                  >
                    {language === "english"
                      ? "\n1. Press the power button on the drone"
                      : "\n1. ドローンの電源ボタンを押してください"}
                  </KText>
                  <KText
                    style={{
                      textAlign: "left",
                      marginTop: -8,
                      fontSize: 15,
                    }}
                  >
                    {"\n2. Connect to the "}
                    <Text
                      onPress={openWifiSettings}
                      style={{
                        fontWeight: "bold",
                        textDecorationLine: "underline",
                        color: "lightblue",
                      }}
                    >
                      {"TELLO-XXX"}
                    </Text>
                    {language === "english" ? " via Wi-Fi" : " Wi-Fi経由で"}
                  </KText>
                  <KText
                    style={{
                      textAlign: "left",
                      marginTop: -8,
                      fontSize: 15,
                    }}
                  >
                    {language === "english"
                      ? '\n3. Press "Connect" button'
                      : "\n3. 「Connect」ボタンを押してください"}
                  </KText>
                  <KText
                    style={{
                      textAlign: "left",
                      marginTop: -8,
                      fontSize: 15,
                    }}
                  >
                    {language === "english"
                      ? "\n4. Start flying!"
                      : "\n4. 飛行を開始！"}
                  </KText>
                </View>
              </View>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={[styles.connectButton]}
                  onPress={handleConnectAndStartStreaming}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                    </>
                  ) : (
                    <>
                      <Icon name="link" size={20} color="#fff" />
                      <KText style={styles.connectButtonText}>Connect</KText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={[styles.buttonGroup, { flexDirection: "row" }]}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[styles.buttonContainer, { backgroundColor: "#bf0615" }]}
                onPress={() => handlePress("off")}
              >
                <MaterialIcons name="power" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonContainer, { backgroundColor: "orange" }]}
                onPress={() => handlePress("emergency")}
              >
                <MaterialIcons name="warning" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => sendCommand("takeoff")}
              >
                <MaterialIcons name="flight-takeoff" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => sendCommand("land")}
              >
                <MaterialIcons name="flight-land" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: -20,
                marginLeft: "auto",
              }}
            >
              <KText>{batteryPercentage}%</KText>
              <MaterialIcons
                name={getBatteryIcon(batteryPercentage)}
                size={24}
                color="white"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              />
            </View>
          </View>
          <View style={styles.dpadGroup}>
            {console.log("Rendering Joysticks")}
            <JoystickLeft onMove={handleLeftMove} />
            <JoystickRight onMove={handleRightMove} />
          </View>
          {showPlayer && (
            <View style={styles.videoContainer}>
              {console.log("Rendering StreamingViewJava")}
              <StreamingViewJava
                ref={streamingViewRef}
                style={{ width: 600, height: 350 }}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const handleProgress = (progress) => {
  console.log("Progress:", progress);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F110E",
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    flex: 1,
    width: screenWidth * 0.9,
    margin: 30,
    borderWidth: 1,
    height: 300,
    zIndex: -1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  buttonContainer: {
    width: 50,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    marginTop: -20,
  },

  connectButton: {
    width: 200,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    margin: 20,
  },
  connectButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  greyContainer: {
    width: screenWidth * 0.9,
    height: 310,
    backgroundColor: "#242424",
    borderRadius: 30,
    padding: 35,
  },
  buttonGroup: {
    flexDirection: "row",
    paddingHorizontal: 0,
    top: -40,
    marginLeft: 0,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: 580,
  },
  dpadGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    bottom: -30,
    width: 580,
  },
  dpad: {
    alignItems: "center",
    width: screenWidth / 2,
  },
  dpadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  dpadButton: {
    backgroundColor: "rgba(75, 142, 75, 0.5)",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageButton: {
    padding: 10,
    backgroundColor: "#4B8E4B",
    borderRadius: 10,
  },
});
