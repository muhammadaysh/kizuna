import React, { useEffect, useState,  } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert, 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import KText from "../components/KText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import notifee from '@notifee/react-native'; 

const screenWidth = Dimensions.get("window").width;

const availableIcons = [
  { name: "water", icon: "tint", color: "#3498db" },
  { name: "sun", icon: "sun", color: "#f1c40f" },
  { name: "plant", icon: "seedling", color: "#2ecc71" },
];

export default function TaskScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadTasks = async () => {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      };
      loadTasks();

    
    }, [])
  );
  const handleDeleteTask = async (id) => {
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

        await notifee.cancelNotification(id.toString());
      },
    },
  ]);
};

  const renderItem = (item) => {
    const formatDate = (date) => {
      const now = new Date();
      const taskDate = new Date(date);
      const formatter = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (taskDate.toDateString() === now.toDateString()) {
        return `Today, ${taskDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${taskDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      } else {
        return formatter.format(taskDate);
      }
    };

    const iconDetails = availableIcons.find(icon => icon.name === item.iconName);



    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigation.navigate("TaskDetail", { task: item })}
        style={styles.taskItemContainer}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}> 
          {iconDetails && (
            <Icon name={iconDetails.icon} size={18} color={iconDetails.color} style={{ marginRight: 10 }} />
          )}
          <View style={styles.taskItem}>
            <KText style={styles.taskText}>{item.title}</KText>
            <KText style={styles.taskTime}>{formatDate(item.time)}</KText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.trashIcon}
          onPress={() => handleDeleteTask(item.id)}
        >
          <Icon name="trash" size={18} color="grey" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };


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
    paddingRight: 30,
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
    color: "grey",
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
    marginRight: 50,

  },
});
