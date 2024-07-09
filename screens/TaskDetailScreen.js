import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KText from "../components/KText";

const screenWidth = Dimensions.get("window").width;

export default function TaskDetailScreen({ route, navigation }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { task } = route.params || {};

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      const taskTime = new Date(task.time);
      setDate(taskTime);
      setTime(taskTime);
    }
  }, [task]);

  const saveTask = async () => {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <KText style={styles.taskHeader}>Create Task</KText>
      </View>
      <KeyboardAvoidingView>
        <View style={styles.greyContainer}>
          <KText style={styles.label}>Task Title</KText>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        </View>
        <View style={styles.greyContainer}>
          <KText style={styles.label}>Select Date</KText>
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
            <KText style={styles.dateTimeButtonText}>{date.toDateString()}</KText>
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
          <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
            <KText style={styles.dateTimeButtonText}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <TouchableOpacity style={styles.addTaskButton} onPress={saveTask}>
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
    minHeight: 150,
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
  },
  addTaskButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
});
