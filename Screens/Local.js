import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import * as MediaLibrary from 'expo-media-library';

const Local = ({navigation}) => {
  const [allVideos, setAllVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const loadVideos = async () => {
      const localVideoString = await AsyncStorage.getItem('LocalVideos');

      if (localVideoString !== null) {
        const localVideos = JSON.parse(localVideoString);
        setAllVideos(localVideos);
      } else {
        console.log('No data found in AsyncStorage');
      }
      scanForVideoFiles();
      fetchAlbums();
    };
    loadVideos();
  }, []);

  useEffect(() => {
    console.log(allVideos);
  }, [allVideos]);

  // SCAN FOR VIDEO FILES USING EXPO-MEDIA-LIBRARY
  const scanForVideoFiles = async () => {
    try {
      setIsLoading(true);
      const {status} = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
        setIsLoading(false);
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 100,
      });

      const videoFiles = media.assets.map(asset => asset.uri);
      setAllVideos(videoFiles);

      await AsyncStorage.setItem('LocalVideos', JSON.stringify(videoFiles));
      setIsLoading(false);
    } catch (error) {
      console.error('Error scanning for video files:', error);
      setIsLoading(false);
    }
  };

  // FETCH ALBUMS USING EXPO-MEDIA-LIBRARY
  const fetchAlbums = async () => {
    try {
      const {status} = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert(
          'Permission to access media library is required to fetch albums!',
        );
        return;
      }

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const renderVideoItem = ({item}) => {
    const fileName = item.split('/').pop();
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VideoPlayer', {videoName: item})}>
        <View style={styles.thumbNail}>
          <Icons name="play-circle-outline" size={30} color="#957500" />
        </View>
        <View
          style={{flex: 1, paddingHorizontal: 10, justifyContent: 'center'}}>
          <Text
            style={{color: '#9c9c9c'}}
            numberOfLines={2}
            ellipsizeMode="tail">
            {fileName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerColor}>LOCAL VIDEOS</Text>
        <View>
          {isLoading ? (
            <ActivityIndicator size={25} color="#957500" />
          ) : (
            <TouchableOpacity onPress={scanForVideoFiles}>
              <Icons name="refresh" size={25} color="#957500" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View>
        {allVideos.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
            <Text>LOADING...</Text>
          </View>
        ) : (
          <FlatList
            data={allVideos}
            renderItem={renderVideoItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 80}}
            extraData={allVideos}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#242424',
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  headerColor: {
    color: '#957500',
    fontSize: 20,
    fontWeight: '600',
  },
  flatList: {
    flexGrow: 1,
  },
  thumbNail: {
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 15,
    marginEnd: '10',
  },
  button: {
    margin: 10,
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
  },
  albumsContainer: {
    backgroundColor: '#333',
    padding: 10,
  },
  albumsHeader: {
    color: '#957500',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  albumItem: {
    paddingVertical: 8,
  },
  albumTitle: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Local;
