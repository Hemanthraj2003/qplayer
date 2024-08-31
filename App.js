import React, {useEffect, useState} from 'react';
import mobileAds, {
  AdEventType,
  AppOpenAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import {Linking} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import HomeScreen from './Screens/HomeScreen';
import Local from './Screens/Local';
import DownloadManager from './Screens/DownloadManager';
import VideoPlayer from './Screens/VideoPlayer';
import Downloads from './Screens/Components/Downloads';
import * as MediaLibrary from 'expo-media-library';
import MidSec from './Screens/Components/MidSec';

const Stack = createNativeStackNavigator();
const appOpenAd = AppOpenAd.createForAdRequest(TestIds.APP_OPEN);
const App = () => {
  const [loaded, setLoaded] = useState(false);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (loaded) {
      appOpenAd.show();
    }
  }, [loaded]);
  useEffect(() => {
    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    appOpenAd.load();
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('ads online', adapterStatuses);
      });
    const requestPermissions = async () => {
      const {status} = await MediaLibrary.requestPermissionsAsync();
      console.log('Permission status:', status);
    };

    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('Initial URL:', initialUrl);
        const videoUrl = initialUrl.replace('qdisk://', ''); // Update based on your URL scheme
        navigationRef.current?.navigate('VideoPlayer', {videoUrl});
      }
    };

    const handleUrl = event => {
      console.log('Received URL:', event.url);
      const videoUrl = event.url.replace('qdisk://', ''); // Update based on your URL scheme
      navigationRef.current?.navigate('VideoPlayer', {videoUrl});
    };

    // Request permissions
    requestPermissions();

    // Add event listener for incoming URLs
    Linking.addEventListener('url', handleUrl);

    // Handle initial URL
    handleInitialURL();

    // Clean up event listener on component unmount
    return () => {
      Linking.removeEventListener('url', handleUrl);
    };
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Local" component={Local} />
        <Stack.Screen name="DownloadManager" component={DownloadManager} />
        <Stack.Screen name="Downloads" component={Downloads} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
        <Stack.Screen name="History" component={MidSec} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
