import {View, Text, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import Online from './Components/Online';
import Header from './Components/Header';
import MidSec from './Components/MidSec';
import ButSec from './Components/ButSec';
import DownloadManager from './DownloadManager';
import {useRoute} from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  const [isOnlineVisible, setIsOnlineVisible] = useState(false);
  const [downloadDetailsList, setDownloadDetailsList] = useState([]);

  const route = useRoute();
  console.log();
  useEffect(() => {
    if (route.params) setDownloadDetailsList(route.params.download);
  }, [route.params]);

  const toggleOnlineVisibility = () => {
    setIsOnlineVisible(!isOnlineVisible);
  };
  return (
    <View style={styles.white}>
      {isOnlineVisible && (
        <Online
          navigation={navigation}
          isVisible={isOnlineVisible}
          setIsVisible={setIsOnlineVisible}
          toggleOnlineVisibility={toggleOnlineVisibility}
        />
      )}
      <Header />
      <ButSec
        navigation={navigation}
        toggleOnlineVisibility={toggleOnlineVisibility}
      />
      <DownloadManager
        navigation={navigation}
        downloadDetailsList={downloadDetailsList}
        setDownloadDetailsList={setDownloadDetailsList}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  white: {
    backgroundColor: 'black',
    height: '100%',
  },
});

export default HomeScreen;
