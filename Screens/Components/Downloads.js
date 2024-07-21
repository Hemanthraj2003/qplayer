import {View, Text, TouchableOpacity, Button} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import * as FileSystem from 'expo-file-system';
import {formatBytes} from '../Functions/downloadFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Downloads = ({navigation, item}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [download, setDownload] = useState();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const getDownloadable = () => {
      if (item.resumeData !== null) {
        const data = item.resumeData;
        const downloadResumable = FileSystem.createDownloadResumable(
          data.url,
          data.fileUri,
          data.options,
          progress => {
            console.log(formatBytes(progress.totalBytesWritten));
            setDownloadProgress(progress.totalBytesWritten);
          },
          data.resumeData,
        );
        setDownload(downloadResumable);
      } else {
        const downloadResumable = FileSystem.createDownloadResumable(
          item.url,
          FileSystem.documentDirectory + item.title,
          {},
          progress => {
            console.log(formatBytes(progress.totalBytesWritten));
            setDownloadProgress(progress.totalBytesWritten);
          },
        );
        setDownload(downloadResumable);
      }
    };

    getDownloadable();
  }, []);

  const downloadFile = async () => {
    setIsDownloading(true);
    const {uri} = await download.downloadAsync();
    console.log(uri);
    navigation.navigate('VideoPlayer', {videoName: uri});
  };
  const pauseDownloading = async () => {
    await download.pauseAsync();
    try {
      const data = await AsyncStorage.getItem('downloadDetails');
      const dataParsed = JSON.parse(data) || [];
      // Update the specific item in the list
      const updatedList = dataParsed.map(res =>
        res.id === item.id ? {...item, resumeData: download.savable()} : item,
      );

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedList),
      );
      console.log('paused ');
    } catch (error) {
      console.log('pausing error' + error);
    }
  };
  const resumeDownloading = async () => {
    const {uri} = await download.resumeAsync();
    console.log(uri);
    navigation.navigate('VideoPlayer', {videoName: uri});
  };
  return (
    <View>
      {isDownloading && <Text>{formatBytes(downloadProgress)}</Text>}
      <Button title="Download" on onPress={downloadFile} />
      <Button title="Paused" on onPress={pauseDownloading} />
      <Button title="Resume" on onPress={resumeDownloading} />
    </View>
  );
};

export default Downloads;
