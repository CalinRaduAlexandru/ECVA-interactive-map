import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";

// Calculate the width of each item to show 2.5 items on the screen
const windowWidth = Dimensions.get("window").width;
const itemWidth = windowWidth / 2.5;

const RecommendationsSlider = ({ recommendations, onPressItem }) => (
  <FlatList
    data={recommendations}
    horizontal
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => onPressItem(item.title)}>
        <Image
          source={{ uri: item.image }}
          style={{ width: itemWidth, height: itemWidth, marginHorizontal: 5 }}
        />
      </TouchableOpacity>
    )}
    keyExtractor={(item) => item.id}
    // This prevents the FlatList from scrolling automatically
    scrollEnabled={true}
    snapToInterval={itemWidth} // Optional: if you want a "snap" effect when scrolling
    decelerationRate="fast" // Optional: if you want a "snap" effect when scrolling
  />
);

export default RecommendationsSlider;
