import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import dgram from "react-native-udp";
import KText from "../components/KText";
import { VLCPlayer } from "react-native-vlc-media-player";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome5";

const screenWidth = Dimensions.get("window").width;

export default function DroneScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialScreen, setIsInitialScreen] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  const clientRef = useRef(null);
  const serverRef = useRef(null);
  const videoServerRef = useRef(null);
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
    clientRef.current = dgram.createSocket("udp4");
    serverRef.current = dgram.createSocket("udp4");
    videoServerRef.current = dgram.createSocket("udp4");

    try {
      clientRef.current.bind(8889);
      serverRef.current.bind(8890);
      videoServerRef.current.bind(11111);
    } catch (err) {
      console.error("Failed to bind socket", err);
      return;
    }

    let timeoutId = null;
    let intervalId = null;

    let state = null;
    let rinfo = null;

    serverRef.current.on("message", (msg, rinfo) => {
      state = parseState(msg.toString());
      rinfo = rinfo;
      setIsConnected(true);
    });

    intervalId = setInterval(() => {
      if (state && rinfo) {
        console.log(`server got: ${state} from ${rinfo.address}:${rinfo.port}`);
      }
    }, 15000);

    videoServerRef.current.on("message", (msg, rinfo) => {
      setIsStreaming(true);
    });

    timeoutId = setTimeout(() => {
      setIsConnected(false);
    }, 5000);

    return () => {
      clientRef.current.close();
      serverRef.current.close();
      videoServerRef.current.close();

      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
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
    clientRef.current.send(
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
  };

  const connectAndStartStreaming = () => {
    setIsLoading(true);
    sendCommand("command");
    setTimeout(() => {
      sendCommand("streamon");
      setIsInitialScreen(false);
      setIsLoading(false);
    }, 5000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isInitialScreen || !isConnected ? (
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
              onPress={connectAndStartStreaming}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="link" size={20} color="#fff" />
                  <KText style={styles.connectButtonText}>Connect</KText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {isStreaming &&
            (console.log("isStreaming:", isStreaming),
            (
              <VLCPlayer
                style={{ width: "100%", height: "100%" }}
                source={{ uri: "udp://@0.0.0.0:11111" }}
                autoplay={true}
                isLive={true}
                autoReloadLive={true}
                initOptions={["--network-caching=150", "--rtsp-tcp"]}
                onError={(e) => {
                  console.log("onError", e);
                  setIsConnected(false);
                  setIsStreaming(false);
                }}
                onOpen={(e) => console.log('onOpen', e)}
                onBuffering={(e) => console.log('onBuffering', e)}
                onPlaying={(e) => console.log('onPlaying', e)}
                onStopped={(e) => console.log('onStopped', e)}
                onEndReached={(e) => console.log('onEndReached', e)}
                ref={playerRef}
              />
            ))}
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => sendCommand("takeoff")}
            >
              <KText style={styles.buttonText}>Take Off</KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => sendCommand("land")}
            >
              <KText style={styles.buttonText}>Land</KText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => sendCommand("streamoff")}
            >
              <KText style={styles.buttonText}>Off Stream</KText>
            </TouchableOpacity>
          </View>
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
  },

  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: -200,
  },
  greyContainer: {
    position: "absolute",
    backgroundColor: "#242424",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 10,
    top: 139,
    height: 400,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: -1,
  },
});
