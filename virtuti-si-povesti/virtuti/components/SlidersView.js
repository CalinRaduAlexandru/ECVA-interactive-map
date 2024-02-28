import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import virtues from "../data.js";

const { width, height } = Dimensions.get("window");

const SlidersView = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [recommendationsModalVisible, setRecommendationsModalVisible] =
    useState(false);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setDetailModalVisible(false); // Add this line if you intend to close both modals with the same function
  };

  const closeMainModal = () => {
    setDetailModalVisible(false);
    setModalVisible(false);
    setDetailModalVisible(false);
    setSelectedItem(null);
    setSelectedDetailItem(null);
  };

  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
    setDetailModalVisible(true);
  };

  const handlePressItem = (title) => {
    Alert.alert("Clicked on", title);
  };

  const toggleRecommendationsModal = () => {
    setRecommendationsModalVisible(!recommendationsModalVisible);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={virtues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={styles.listItem}
          >
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedItem && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeMainModal}
                style={styles.closeButton}
              >
                <Icon name="chevron-left" size={24} color="#000" />
                <Text>Lista de virtuți</Text>
              </TouchableOpacity>
              <Image
                source={require("../assets/FadedLogo.png")}
                style={styles.logoStyle}
              />
            </View>
            <Swiper
              style={{}} // Set the carousel to take half of the screen height
              showsButtons={false}
              loop={false}
              autoplay={false}
              dotColor="#AAAAAA" // Color of the inactive dots
              activeDotColor="#336674" // Color of the active dot
            >
              {selectedItem.images.map((imageUri, index) => (
                <View key={index} style={styles.slide}>
                  <Image source={{ uri: imageUri }} style={styles.imageStyle} />
                </View>
              ))}
            </Swiper>
          </View>
          <View style={styles.recommendationsContainer}>
            <Text
              style={styles.recommendationsHeader}
              onPress={toggleRecommendationsModal}
            >
              Recomandări
            </Text>
            <Modal
              visible={recommendationsModalVisible}
              animationType="slide"
              onRequestClose={toggleRecommendationsModal}
            >
              <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={toggleRecommendationsModal}
                    style={styles.closeButton}
                  >
                    <Icon name="chevron-left" size={24} color="#000" />
                    <Text>Închide recomandările</Text>
                  </TouchableOpacity>
                  <Image
                    source={require("../assets/FadedLogo.png")}
                    style={styles.logoStyle}
                  />
                </View>
                {/* Recommendations FlatList */}
                <FlatList
                  data={selectedItem?.recommendations}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => openDetailModal(item)}
                      style={{ width: "50%", aspectRatio: 1, padding: 20 }}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                        }}
                      />
                      <Text>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  numColumns={2}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </Modal>
          </View>
        </Modal>
      )}

      {detailModalVisible && selectedDetailItem && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalView}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Icon name="chevron-left" size={24} color="#000" />
              <Text>Close</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: selectedDetailItem.image }}
              style={styles.detailImageStyle}
            />
            <Text style={styles.detailTitle}>{selectedDetailItem.title}</Text>
            {/* Description and Link can be added here */}
            <TouchableOpacity
              onPress={() => Linking.openURL(selectedDetailItem.link)}
            >
              <Text>Descoperă mai multe...</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 20,
  },
  topImage: {
    width: "100%",
    height: 200,
    marginTop: 80,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 18,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10, // Adjust the padding as needed
    paddingTop: 10,
    paddingBottom: 10, // Adjust the padding top as needed
  },

  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    // Remove alignSelf and marginLeft if they conflict with new layout
  },

  logoStyle: {
    width: 50, // Adjust the width as needed
    height: 50, // Adjust the height as needed, maintain aspect ratio
    resizeMode: "contain", // This ensures your logo maintains its aspect ratio
  },

  recommendationsHeader: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
    color: "#fff",
    backgroundColor: "#1C5E70",
    padding: 20,
    marginTop: 50,
  },
  emphasizedText: {
    color: "#0D2B33",
    fontWeight: "800",
    fontSize: 22,
  },
  headerText: {
    marginVertical: 20,
    fontSize: 18,
    color: "#38626C",
  },
  imageStyle: {
    width: width, // Use the device's full width
    height: height, // Use a height that maintains the aspect ratio or the full height
    marginLeft: 20,
    width: "100%", // Take up all available width
    height: height / 1, // Adjust based on your carousel's height requirement
    resizeMode: "contain",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  gridImageStyle: {
    width: width / 2 - 10, // Adjust as necessary
    height: width / 2 - 10, // Adjust as necessary to maintain aspect ratio
    resizeMode: "cover", // Ensure images cover the area
    margin: 5, // Add some space between images
  },
});

export default SlidersView;
