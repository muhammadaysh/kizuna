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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import dgram from "react-native-udp";
import KText from "../components/KText";
import { VLCPlayer } from "react-native-vlc-media-player";
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
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';

const screenWidth = Dimensions.get("window").width;

export default function DroneScreen({ navigation, route }) {
  const { isStreaming, connectAndStartStreaming } =
    useContext(StreamingContext);
  const { client, server, videoServer, encodedStream } = useContext(SocketContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialScreen, setIsInitialScreen] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [moveInterval, setMoveInterval] = useState(null);

  const playerRef = useRef(null);

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

  const startFFmpegStream = () => {
    const ffmpegCommand = `-loglevel debug -i udp://0.0.0.0:11111 -c:v libx264 -r 30 -s 960x720 -f mpegts udp://0.0.0.0:49152`;
  
    // Delay before starting FFmpeg stream
    setTimeout(() => {
      FFmpegKit.execute(ffmpegCommand).then(async (session) => {
        const returnCode = await session.getReturnCode();
  
        if (ReturnCode.isSuccess(returnCode)) {
          console.log("FFmpeg process completed successfully");
        } else if (ReturnCode.isCancel(returnCode)) {
          console.log("FFmpeg process was cancelled");
        } else {
          console.log("FFmpeg process failed with returnCode:", returnCode);
        }
      });
    }, 5000); 
  };
  
  const handleConnectAndStartStreaming = () => {
    setIsLoading(true);
    sendCommand("command");
  
    let receivedResponse = false;
  
    const messageListener = (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  
      if (msg) {
        receivedResponse = true;
        sendCommand("streamon");
        setIsLoading(false);
        connectAndStartStreaming();
        startFFmpegStream(); // Start the FFmpeg stream
  
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
    }, 5000); 
  };
  
  const startMoving = (dpad, direction) => {
    let command;
    if (dpad === "left") {
      command = `${direction} 50`;
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
            <Animated.Image
              source={require("../assets/tello-img.png")}
              style={{
                width: screenWidth * 1.3,
                resizeMode: "contain",
                position: "absolute",
                opacity: fadeAnim,
              }}
            />
            <View style={styles.greyContainer}>
              <TouchableOpacity
                style={[
                  styles.connectButton,
                  { bottom: 120, flexDirection: "row" },
                ]}
                onPress={handleConnectAndStartStreaming}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <KText style={styles.connectButtonText}>Connecting..</KText>
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
        </>
      ) : (
        <>
          <VLCPlayer
            style={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 0,
            }}
            source={{ uri: "udp://@:49152" }}
            autoplay={true}
            isLive={true}
            autoReloadLive={true}
            initOptions={[
              "--network-caching=1000",
            ]}
            onError={(e) => {
              console.log("onError", e);
            }}
            onOpen={(e) => console.log("onOpen", e)}
            onBuffering={(e) => console.log("onBuffering", e)}
            onPlaying={(e) => console.log("onPlaying", e)}
            onStopped={(e) => console.log("onStopped", e)}
            onEndReached={(e) => console.log("onEndReached", e)}
            ref={playerRef}
          />
          {/* <View style={styles.buttonGroup}>
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
          </View> */}
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
    margin: 10,
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
  },
  greyContainer: {
    position: "absolute",
    width: screenWidth,
    height: "100%",
    backgroundColor: "#0F110E",
    alignItems: "center",
    justifyContent: "center",
  },
  dpadGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
    width: "60%",
  },
  dpadButton: {
    backgroundColor: "#4B8E4B",
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,}
});

