import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";

const FivePageSlider = () => {
  return (
    <Swiper style={styles.wrapper} showsButtons={true}>
      <View style={styles.slide}>
        <Text style={styles.text}>Page 1</Text>
      </View>
      <View style={styles.slide}>
        <Text style={styles.text}>Page 2</Text>
      </View>
      <View style={styles.slide}>
        <Text style={styles.text}>Page 3</Text>
      </View>
      <View style={styles.slide}>
        <Text style={styles.text}>Page 4</Text>
      </View>
      <View style={styles.slide}>
        <Text style={styles.text}>Page 5</Text>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default FivePageSlider;
