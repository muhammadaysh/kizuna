import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert, // Import Alert for confirmation popup
} from "react-native";
import KText from "../components/KText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";

const screenWidth = Dimensions.get("window").width;

export default function TaskScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    };
    loadTasks();
  }, []);

  const handleDeleteTask = (id) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          const updatedTasks = tasks.filter((task) => task.id !== id);
          setTasks(updatedTasks);
          await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
        },
      },
    ]);
  };

  const renderItem = (item) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate("TaskDetail", { task: item })}
      style={styles.taskItemContainer}
    >
      <View style={styles.taskItem}>
        <KText style={styles.taskText}>{item.title}</KText>
        <KText style={styles.taskTime}>
          {new Date(item.time).toLocaleString()}
        </KText>
      </View>
      <TouchableOpacity
        style={styles.trashIcon}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Icon name="trash" size={18} color="grey" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {tasks.map((item) => renderItem(item))}
      </ScrollView>
      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => navigation.navigate("TaskDetail")}
      >
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#0F110E",
    justifyContent: "space-between",
  },
  taskItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: screenWidth * 0.9,
    backgroundColor: "#242424",
    borderRadius: 30,
    padding: 20,
    marginVertical: 10,
    alignSelf: "center",
  },
  taskItem: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
  },
  taskTime: {
    color: "#888",
    marginTop: 5,
  },
  addTaskButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4B8E4B",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
  },
  trashIcon: {
    marginLeft: 10,
  },
});