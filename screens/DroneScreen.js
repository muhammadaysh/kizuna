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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import dgram from "react-native-udp";
import KText from "../components/KText";
import { VLCPlayer, VlCPlayerView } from "react-native-vlc-media-player";
import Video from "react-native-video";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome5";
import Orientation from "react-native-orientation-locker";
import {
  StreamingContext,
  StreamingProvider,
} from "../components/StreamingContext";
import { SocketContext, SocketProvider } from "../components/SocketContext";
import { AntDesign } from "@expo/vector-icons";
import {
  FFmpegKit,
  FFmpegKitConfig,
  ReturnCode,
} from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";
import DroneFly from "../assets/droneFly.svg";
import * as MediaLibrary from "expo-media-library";
const StreamingViewJava = requireNativeComponent("StreamingView");
const { TelloStreamModule } = NativeModules;

const screenWidth = Dimensions.get("window").width;
const appDirectory = FileSystem.cacheDirectory;
const outputPath = FileSystem.cacheDirectory + "output.mp4";

export default function DroneScreen({ navigation, route }) {
  const { isStreaming, connectAndStartStreaming } =
    useContext(StreamingContext);
  const { client, server, videoServer, encodedStream } =
    useContext(SocketContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialScreen, setIsInitialScreen] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [moveInterval, setMoveInterval] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [language, setLanguage] = useState("english");

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

  const handleConnectAndStartStreaming = () => {
    setIsLoading(true);
    sendCommand("command");

    let receivedResponse = false;

    const messageListener = (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

      if (msg) {
        receivedResponse = true;
        sendCommand("speed 30");
        sendCommand("streamon");
        setIsLoading(false);
        connectAndStartStreaming();

        server.current.removeListener("message", messageListener);
      }
    };

    server.current.on("message", messageListener);

    // Delay before checking for response from drone
    setTimeout(() => {
      if (!receivedResponse) {
        setIsLoading(false);
        ToastAndroid.show(
          "No response from drone. Please check if drone is connected via wifi.",
          ToastAndroid.LONG
        );
      }
    }, 500);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("Ref current value:", streamingViewRef.current);

      if (streamingViewRef.current) {
        const handle = findNodeHandle(streamingViewRef.current);
        console.log("Attempting to start stream with handle:", handle);
        try {
          TelloStreamModule.startStream(handle);
          console.log("Stream started successfully");
        } catch (error) {
          console.error("Failed to start stream:", error);
        }
      } else {
        // console.warn("streamingViewRef.current is not set");
      }
    }, 3000);

    return () => clearTimeout(timeoutId); // Cleanup function to clear the timeout
  }, [streamingViewRef.current]);

  const startMoving = (dpad, direction) => {
    let command;
    if (dpad === "left") {
      command = `${direction} 80`;
    } else {
      if (direction === "up") {
        command = "up 40";
      } else if (direction === "down") {
        command = "down 40";
      } else if (direction === "left") {
        command = "ccw 40";
      } else if (direction === "right") {
        command = "cw 40";
      }
    }

    const interval = setInterval(() => {
      sendCommand(command);
    }, 1000);
    setMoveInterval(interval);
  };

  const stopMoving = () => {
    clearInterval(moveInterval);
    setMoveInterval(null);
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
            <DroneFly width={300} height={300} style={{ marginTop: -50 }} />
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
            <View style={styles.greyContainer}>
              <View style={styles.header}>
                <KText
                  style={{
                    textAlign: "centre",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  {language === "english" ? "How to connect?" : "接続方法は？"}
                </KText>
                <TouchableOpacity
                  onPress={toggleLanguage}
                  style={styles.languageButton}
                >
                  <KText>{language === "english" ? "日本語" : "English"}</KText>
                </TouchableOpacity>
              </View>

              <KText
                style={{
                  textAlign: "left",
                  marginTop: -4,
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                {language === "english"
                  ? "\n1. Press the power button on the drone" +
                    '\n2. Connect to the "TELLO-XXXX" via Wi-Fi' +
                    '\n3. Press "Connect" button' +
                    "\n4. Start flying!"
                  : "\n1. ドローンの電源ボタンを押してください" +
                    '\n2. Wi-Fi経由で"TELLO-XXXX"に接続してください' +
                    "\n3. 「接続」ボタンを押してください" +
                    "\n4. 飛行を開始！"}
              </KText>
            </View>
          </View>
        </>
      ) : (
        <>
          <View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => sendCommand("takeoff")}
              >
                <KText style={styles.buttonText}>Take Off</KText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emergencyContainer}
                onPress={() => sendCommand("emergency")}
              >
                <KText style={styles.buttonText}>! !</KText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => sendCommand("land")}
              >
                <KText style={styles.buttonText}>Land</KText>
              </TouchableOpacity>
            </View>
            <View style={styles.dpadGroup}>
              <View style={styles.dpad}>
                <TouchableOpacity
                  style={styles.dpadButton}
                  onPressIn={() => startMoving("left", "forward")}
                  onPressOut={stopMoving}
                >
                  <AntDesign name="arrowup" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.dpadRow}>
                  <TouchableOpacity
                    style={styles.dpadButton}
                    onPressIn={() => startMoving("left", "left")}
                    onPressOut={stopMoving}
                  >
                    <AntDesign name="arrowleft" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dpadButton}
                    onPressIn={() => startMoving("left", "right")}
                    onPressOut={stopMoving}
                  >
                    <AntDesign name="arrowright" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.dpadButton}
                  onPressIn={() => startMoving("left", "back")}
                  onPressOut={stopMoving}
                >
                  <AntDesign name="arrowdown" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.dpad}>
                <TouchableOpacity
                  style={styles.dpadButton}
                  onPressIn={() => startMoving("right", "up")}
                  onPressOut={stopMoving}
                >
                  <AntDesign name="arrowup" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.dpadRow}>
                  <TouchableOpacity
                    style={styles.dpadButton}
                    onPressIn={() => startMoving("right", "left")}
                    onPressOut={stopMoving}
                  >
                    <AntDesign name="arrowleft" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dpadButton}
                    onPressIn={() => startMoving("right", "right")}
                    onPressOut={stopMoving}
                  >
                    <AntDesign name="arrowright" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.dpadButton}
                  onPressIn={() => startMoving("right", "down")}
                  onPressOut={stopMoving}
                >
                  <AntDesign name="arrowdown" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {showPlayer && (
            <View style={styles.videoContainer}>
              {console.log("Rendering StreamingViewJava")}
              <StreamingViewJava
                ref={streamingViewRef}
                style={{ width: "100%", height: 350 }}
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
    padding: 20,
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
    width: 200,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  emergencyContainer: {
    width: 70,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#bf0615",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  connectButton: {
    width: 200,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    bottom: 40,
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
    height: 200,
    backgroundColor: "#242424",
    borderRadius: 30,
    justifyContent: "center",
    padding: 35,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 0,
  },
  dpadGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginTop: 20,
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
