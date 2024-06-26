import React, { useRef, useState } from "react";
import { View, Animated, PanResponder } from "react-native";
import KText from "./KText";

export const JoystickLeft = ({ onMove }) => {
  const panLeft = useRef(new Animated.ValueXY({ x: 25, y: 25 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponderLeft = useRef(
    PanResponder.create({
      maxPointers: 1,
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        panLeft.setOffset({
          x: panLeft.x._value,
          y: panLeft.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panLeft.x, dy: panLeft.y }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            const leftRight = Math.max(
              -100,
              Math.min(100, gestureState.dx / 2)
            ); // Normalize to -100 to 100
            const forwardBackward = Math.max(
              -100,
              Math.min(100, -(gestureState.dy / 2))
            ); // Normalize to -100 to 100 and invert Y-axis
            onMove({ leftRight, forwardBackward });
          },
        }
      ),
      onPanResponderRelease: () => {
        setIsDragging(false);
        panLeft.flattenOffset();
        Animated.spring(panLeft, {
          toValue: { x: 25, y: 25 },
          friction: 5,
          useNativeDriver: false,
        }).start();
        onMove({ leftRight: 0, forwardBackward: 0 });
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  return (
    <View style={styles.joystickContainer}>
      <View style={styles.fixedCircle}>
        <Animated.View
          {...panResponderLeft.panHandlers}
          style={[
            panLeft.getLayout(),
            styles.joystick,
            isDragging && styles.dragging,
          ]}
        />
      </View>
    </View>
  );
};

export const JoystickRight = ({ onMove }) => {
  const panRight = useRef(new Animated.ValueXY({ x: 25, y: 25 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponderRight = useRef(
    PanResponder.create({
      maxPointers: 1,
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        panRight.setOffset({
          x: panRight.x._value,
          y: panRight.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panRight.x, dy: panRight.y }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            const upDown = Math.max(
              -100,
              Math.min(100, -(gestureState.dy / 2))
            ); // Normalize to -100 to 100 and invert Y-axis
            const yaw = Math.max(-100, Math.min(100, gestureState.dx / 2)); // Normalize to -100 to 100
            onMove({ upDown, yaw });
          },
        }
      ),
      onPanResponderRelease: () => {
        setIsDragging(false);
        panRight.flattenOffset();
        Animated.spring(panRight, {
          toValue: { x: 25, y: 25 },
          friction: 5,
          useNativeDriver: false,
        }).start();
        onMove({ upDown: 0, yaw: 0 });
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;
  return (
    <View style={styles.joystickContainer}>
      <View style={styles.fixedCircle}>
        <Animated.View
          {...panResponderRight.panHandlers}
          style={[
            panRight.getLayout(),
            styles.joystick,
            isDragging && styles.dragging,
          ]}
        />
      </View>
    </View>
  );
};

const styles = {
  joystickContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
  },
  fixedCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(75, 142, 75, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  joystick: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(75, 142, 75, 0.5)",
    position: "absolute",
  },
  dragging: {
    backgroundColor: "rgba(75, 142, 75, 0.8)",
  },
};
