import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  ProgressBarAndroid,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import * as FileSystem from 'expo-file-system';
import {formatBytes, saveToGallary} from '../Functions/downloadFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

const Downloads = ({navigation, item, setDownloadDetailsList}) => {
  const [downloadProgress, setDownloadProgress] = useState(item.downloadedSize);
  const [download, setDownload] = useState();
  const [downloadStart, setDownloadStart] = useState(null);
  const [retry, setRetry] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFinished, setDownloadFinished] = useState(false);
  const [fileSize, setFileSize] = useState(item.totalSize);
  const [fileUri, setFileUri] = useState(item.downloadedFilePath);
  const [isSaved, setIsSaved] = useState(false);

  const deleteItemById = async () => {
    if (!paused && isDownloading) {
      const downloadSnapshot = await download.pauseAsync();
      console.log('Download paused:', downloadSnapshot);
    }
    try {
      const storedList = await AsyncStorage.getItem('downloadDetails');
      const parsedList = storedList ? JSON.parse(storedList) : [];
      console.log('h');
      const updatedList = parsedList.filter(
        listItem => listItem.id !== item.id,
      );

      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedList),
      );
      setDownloadDetailsList(updatedList);

      console.log('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  const unlinkFile = async () => {
    try {
      await FileSystem.deleteAsync(FileSystem.documentDirectory + item.title, {
        idempotent: true,
      });
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  const updateDownloadList = async (id, uri) => {
    const data = await AsyncStorage.getItem('downloadDetails');
    const dataParsed = JSON.parse(data) || [];

    // Update the specific item in the list
    const updatedList = dataParsed.map(items =>
      items.id === id
        ? {
            ...items,
            status: 'finished',
            downloadedFilePath: uri,
            totalSize: fileSize,
          }
        : items,
    );

    // Save the updated list back to AsyncStorage
    await AsyncStorage.setItem('downloadDetails', JSON.stringify(updatedList));
  };
  const initialize = () => {
    if (item.status === 'finished') {
      setDownloadFinished(true);
      setDownloadProgress(item.totalSize);
    }
    if (item.status == null && item.flag == 0) {
      setDownloadStart(true);
    }
    if (item.status === 'paused' && item.flag == 1) {
      setIsDownloading(true);
      setPaused(true);
    }
    if (item.status === 'downloading' && item.flag == 0) {
      setRetry(true);
      setDownloadStart(true);
    }
  };
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
            setFileSize(progress.totalBytesExpectedToWrite);
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
            setFileSize(progress.totalBytesExpectedToWrite);
          },
        );
        setDownload(downloadResumable);
      }
    };
    if (fileUri === `${RNFS.DownloadDirectoryPath}/${item.title}.mp4`) {
      setIsSaved(true);
    }
    getDownloadable();
    initialize();
  }, []);

  const downloadFile = async () => {
    try {
      setIsDownloading(true);
      setDownloadStart(false);

      const data = await AsyncStorage.getItem('downloadDetails');
      const dataParsed = JSON.parse(data) || [];
      const updatedList = dataParsed.map(items =>
        items.id === item.id ? {...items, status: 'downloading'} : items,
      );

      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedList),
      );

      const {uri} = await download.downloadAsync();
      if (uri) {
        setIsDownloading(false);
        setPaused(false);
        setDownloadFinished(true);
        updateDownloadList(item.id, uri);
        setFileUri(uri);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  const pauseDownloading = async () => {
    try {
      const downloadSavable = await download.pauseAsync();
      console.log(downloadSavable);
      console.log(download.savable());
      setPaused(true);
      const data = await AsyncStorage.getItem('downloadDetails');
      const dataParsed = JSON.parse(data) || [];
      const updatedList = dataParsed.map(res =>
        res.id === item.id
          ? {
              ...res,
              resumeData: download.savable(),
              flag: 1,
              status: 'paused',
              totalSize: fileSize,
              downloadedSize: downloadProgress,
            }
          : res,
      );

      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedList),
      );
      console.log('paused');
    } catch (error) {
      console.error('Pausing error:', error);
    }
  };
  const resumeDownloading = async () => {
    try {
      setPaused(false);

      const data = await AsyncStorage.getItem('downloadDetails');
      const dataParsed = JSON.parse(data) || [];
      const updatedList = dataParsed.map(items =>
        items.id === item.id ? {...items, flag: 0} : items,
      );

      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedList),
      );

      const {uri} = await download.resumeAsync();
      if (uri) {
        setDownloadStart(false);
        setPaused(false);
        setIsDownloading(false);
        setDownloadFinished(true);
        updateDownloadList(item.id, uri);
        setFileUri(uri);
      }
    } catch (error) {
      console.error('Resuming error:', error);
    }
  };
  const cancel = () => {
    deleteItemById();
  };
  const cancelDelete = () => {
    deleteItemById();
    unlinkFile();
  };

  const handleSave = async () => {
    const savedPath = await saveToGallary(item.title, fileUri);
    await updateDownloadList(item.id, savedPath);
    setFileUri(savedPath);
    Alert.alert('success', savedPath + '.mp4');
    setIsSaved(true);
    console.log(savedPath);
  };
  const renderDownload = () => {
    return (
      <View style={styles.card}>
        <View style={styles.startDownloadPlaybutton}>
          <Icons name={'play-circle-outline'} size={50} color="#ffc903" />
        </View>
        <View style={styles.startDownloadDetails}>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <View style={styles.downloadAndCancel}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={downloadFile}>
              <View>
                <Text style={{color: 'black'}}>
                  {retry ? 'Retry' : 'Download'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelDelete} onPress={cancel}>
              <View>
                <Text>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDownloading = () => {
    return (
      <View style={styles.downloadingCard}>
        <View
          style={{
            height: 30,
            marginTop: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                marginStart: 22,
                fontSize: 12,
                color: '#737272',
              }}>
              {formatBytes(downloadProgress)} / {formatBytes(fileSize)}
            </Text>
            {paused ? (
              <Text
                style={{
                  marginStart: 22,
                  fontSize: 12,
                  color: '#737272',
                }}>
                Paused
              </Text>
            ) : (
              <Text
                style={{
                  marginStart: 22,
                  fontSize: 12,
                  color: '#737272',
                }}>
                Downlading
              </Text>
            )}

            <View
              style={{
                flexDirection: 'row',
                width: 120,
                justifyContent: 'space-evenly',
              }}>
              {paused == true ? (
                <TouchableOpacity onPress={resumeDownloading}>
                  <Icons name={'play-arrow'} size={30} color="#957500" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={pauseDownloading}>
                  <Icons name={'pause'} size={30} color="#957500" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={cancelDelete}>
                <Icons name={'cancel'} size={30} color="#957500" />
              </TouchableOpacity>
            </View>
          </View>
          <ProgressBarAndroid
            style={{marginHorizontal: 15}}
            styleAttr="Horizontal"
            indeterminate={false}
            progress={downloadProgress / fileSize}
            color="#957500" // Background color of the progress bar
          />
        </View>
      </View>
    );
  };

  const renderDownloaded = () => {
    return (
      <View style={styles.downloadedCard}>
        {/* PLAY BUTTON */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('VideoPlayer', {videoName: fileUri});
          }}>
          <View style={styles.downloadedPlayButton}>
            <Icons name={'play-circle-outline'} size={30} color="#ffc903" />
          </View>
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            height: 60,
            paddingHorizontal: 10,

            justifyContent: 'space-evenly',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingEnd: 18,
            }}>
            <View style={{justifyContent: 'center'}}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text>{formatBytes(downloadProgress)}</Text>
            </View>
            {isSaved === false && (
              <TouchableOpacity onPress={handleSave}>
                <View
                  style={{
                    fontSize: 14,
                    padding: 10,
                    paddingHorizontal: 13,
                    borderRadius: 5,

                    backgroundColor: '#bf9808',
                  }}>
                  <Text style={{color: '#212121', fontWeight: '700'}}>
                    Save
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* DELETE BUTTON */}
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            width: 32,
            marginEnd: 10,
          }}
          onPress={cancelDelete}>
          <Icons name={'delete'} size={32} color="#bf9808" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {downloadStart == true && renderDownload()}
      {isDownloading == true && renderDownloading()}
      {downloadFinished == true && renderDownloaded()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  downloadingCard: {
    height: 100,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  downloadedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  startDownloadPlaybutton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    width: 80,
    borderRadius: 10,

    backgroundColor: '#242424',
  },
  downloadedPlayButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 60,
    borderRadius: 10,

    backgroundColor: '#242424',
  },
  startDownloadDetails: {
    flex: 1,
    height: 80,
    paddingHorizontal: 10,
  },
  downloadAndCancel: {
    paddingTop: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#ffc903',
    width: 90,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cancelDelete: {
    backgroundColor: '#3B3B3B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    width: 90,
    alignItems: 'center',
  },
});

export default Downloads;
