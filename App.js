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
  //code to show the ads when the app is opened
  useEffect(() => {
    if (loaded) {
      appOpenAd.show();
    }
  }, [loaded]);

  useEffect(() => {
    //adding event listner for ads
    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });
    appOpenAd.load();

    //creating ads to show
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('ads online', adapterStatuses);
      });

    // code to handle permisiion requests
    const requestPermissions = async () => {
      const {status} = await MediaLibrary.requestPermissionsAsync();
      console.log('Permission status:', status);
    };

    // handle incoming deeplinks (INITIAL URL)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('Initial URL:', initialUrl);
        const videoUrl = initialUrl.replace('qdisk://', '');
        navigationRef.current?.navigate('VideoPlayer', {videoUrl});
      }
    };

    //handling deeplink when the app is opened
    const handleUrl = event => {
      console.log('Received URL:', event.url);
      const videoUrl = event.url.replace('qdisk://', '');
      navigationRef.current?.navigate('VideoPlayer', {videoUrl});
    };

    requestPermissions();
    Linking.addEventListener('url', handleUrl);
    handleInitialURL();
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
