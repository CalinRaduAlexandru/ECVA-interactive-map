import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import * as Font from "expo-font";

import SlidersView from "./components/SlidersView";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/Logo.png")} // Adjust the path and filename as necessary
        style={styles.topImage}
      />
      <Text style={styles.headerText}>
        Lista celor <Text style={styles.emphasizedText}>2/51 de virtuți!</Text>
      </Text>
      <SlidersView />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  topImage: {
    width: "50%", // Full width of the screen
    height: 200,
    marginTop: 80, // Fixed height, adjust as needed
    resizeMode: "cover", // Cover the width of the container without losing aspect ratio
  },
  headerText: {
    marginVertical: 20,
    fontSize: 18, // Adjust as needed
    color: "#38626C", // Default color for "Lista celor"
    // Specify the font family for "Lista celor" if you want it different from the default
  },
  emphasizedText: {
    color: "#0D2B33", // Different color for "51 de virtuți"
    fontWeight: "800", // Example of making it bold, adjust as needed
    fontSize: 22, // Slightly larger font size for emphasis
    // Specify the font family for "51 de virtuți" if you have a specific one in mind
  },
});
