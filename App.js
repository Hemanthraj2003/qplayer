import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from './Screens/HomeScreen';
const Stack = createNativeStackNavigator();
import * as MediaLibrary from 'expo-media-library';
import Local from './Screens/Local';
import DownloadManager from './Screens/DownloadManager';
import VideoPlayer from './Screens/VideoPlayer';
import Downloads from './Screens/Components/Downloads';

const App = () => {
  const requestPermissions = async () => {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    console.log('Permission status:', status);
  };

  useEffect(() => {
    requestPermissions();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Local" component={Local} />
        <Stack.Screen name="DownloadManager" component={DownloadManager} />
        <Stack.Screen name="Downloads" component={Downloads} />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{orientation: 'all'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
