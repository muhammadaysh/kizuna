import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ToastAndroid,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KText from "../components/KText";
import notifee, { TimestampTrigger, TriggerType } from "@notifee/react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const screenWidth = Dimensions.get("window").width;

const availableIcons = [
  { name: "water", icon: "tint", color: "#3498db" },
  { name: "sun", icon: "sun", color: "#f1c40f" },
  { name: "plant", icon: "seedling", color: "#2ecc71" },
];

export default function TaskDetailScreen({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedIconName, setSelectedIconName] = useState(
    availableIcons[0].name
  );
  const { task } = route.params || {};

  useEffect(() => {
    createNotificationChannel();

    if (task) {
      setTitle(task.title);
      const taskTime = new Date(task.time);
      setDate(taskTime);
      setTime(taskTime);
    }
  }, [task]);

  const scaleAnim = useRef(
    availableIcons.reduce((acc, item) => {
      acc[item.name] = new Animated.Value(1);
      1;
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    Animated.spring(scaleAnim[selectedIconName], {
      toValue: 1.2,
      friction: 3,
      useNativeDriver: true,
    }).start();

    Object.keys(scaleAnim).forEach((key) => {
      if (key !== selectedIconName) {
        scaleAnim[key].setValue(1);
      }
    });
  }, [selectedIconName, scaleAnim]);

  const createNotificationChannel = async () => {
    await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      sound: "default",
    });
  };

  const renderIconPicker = () => (
    <View style={styles.iconPickerContainer}>
      {availableIcons.map((item) => (
        <Animated.View
          key={item.name}
          style={{
            width: 50,
            height: 50,
            transform: [{ scale: scaleAnim[item.name] }],
            borderRadius: 25,
            backgroundColor:
              selectedIconName === item.name ? "#505050" : "transparent",
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => setSelectedIconName(item.name)}>
            <Icon name={item.icon} size={20} color={item.color} />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const canSaveTask = () => {
    const now = new Date();
    const selectedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    return title.trim() !== "" && selectedDateTime > now;
  };

  const saveTask = async () => {
    if (!canSaveTask()) {
      ToastAndroid.show(
        "Please fill all fields and ensure the date is in the future.",
        ToastAndroid.LONG
      );
      return;
    }
    const newTask = {
      id: task ? task.id : Date.now(),
      title,
      time: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      ),
      iconName: selectedIconName,
    };
    const storedTasks = await AsyncStorage.getItem("tasks");
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    if (task) {
      const index = tasks.findIndex((t) => t.id === task.id);
      tasks[index] = newTask;
    } else {
      tasks.push(newTask);
    }
    await AsyncStorage.setItem("tasks", JSON.stringify(tasks));

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: newTask.time.getTime(),
    };

    try {
      await notifee.createTriggerNotification(
        {
          id: String(newTask.id),
          title: "Task Reminder",
          body: `${newTask.title}`,
          android: {
            channelId: "default",
            showTimestamp: true,
          },
        },
        trigger
      );
      console.log("Notification successfully created for task:", newTask.title);
      ToastAndroid.show("Task created.", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }

    navigation.goBack();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <KText style={styles.taskHeader}>Create Task</KText>
      </View>
      <KeyboardAvoidingView>
        <View style={styles.greyContainer}>
          <KText style={styles.label}>Task Title</KText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View style={styles.greyContainer}>
          <KText style={styles.label}>Select Date</KText>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <KText style={styles.dateTimeButtonText}>
              {date.toDateString()}
            </KText>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <KText style={styles.label}>Select Time</KText>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <KText style={styles.dateTimeButtonText}>
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </KText>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
        <View style={styles.greyContainer}>
          <KText style={styles.label}>Pick Icon</KText>
          {renderIconPicker()}
        </View>
        <TouchableOpacity
          style={[styles.addTaskButton, !canSaveTask() && { opacity: 0.5 }]}
          onPress={saveTask}
          disabled={!canSaveTask()}
        >
          <KText style={styles.addTaskButtonText}>Save</KText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F110E",
    width: "100%",
    height: "100%",
    position: "relative",
    padding: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    top: 30,
    left: 0,
    width: "100%",
    padding: 20,
    zIndex: 2,
    backgroundColor: "#0F110E",
    marginBottom: 20,
  },
  taskHeader: {
    fontSize: 30,
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    color: "white",
    fontSize: 15,
  },
  dateTimeButton: {
    backgroundColor: "#505050",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  dateTimeButtonText: {
    color: "white",
    fontSize: 16,
  },
  greyContainer: {
    width: screenWidth * 0.85,
    minHeight: 120,
    backgroundColor: "#242424",
    borderRadius: 30,
    padding: 30,
    margin: 15,
  },
  addTaskButton: {
    width: 150,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 40
  },
  addTaskButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  iconPickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
