import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Button,
  ProgressBarAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {useRoute} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Icons from 'react-native-vector-icons/MaterialIcons';

import {formatBytes} from '../Functions/downloadFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Downloads = ({
  navigation,
  title,
  source,
  DownloadStatu,
  FilePath,
  Size,
  setIsUpdated,
}) => {
  console.log(DownloadStatu);
  const url = source;
  const filePath = DownloadStatu
    ? FilePath
    : `${RNFS.DocumentDirectoryPath}/videos/${title}.mp4`;
  const taskRef = useRef(null);

  const [downloaded, setDownloaded] = useState(0);

  const [fileSize, setFileSize] = useState(Size);
  const [downloadFinished, setDownloadFinished] = useState(DownloadStatu);
  const [downloading, setDownloading] = useState(false);
  const [responsePath, setResponsePath] = useState('');

  useEffect(() => {
    console.log(responsePath);
  }, [responsePath]);

  useEffect(() => {
    if (downloaded != 0)
      console.log('a:' + formatBytes(downloaded) + '/' + formatBytes(fileSize));
  }, [downloaded]);

  const downloadSuccess = async (FileSize, resPath) => {
    setDownloadFinished(true);

    const downloadDetailsString = await AsyncStorage.getItem('downloadDetails');
    let downloadDetailsArray = JSON.parse(downloadDetailsString);

    let thisDownloadDetails = downloadDetailsArray.find(
      item => item.Source === url,
    );
    thisDownloadDetails.DownloadStatus = true;
    thisDownloadDetails.Size = FileSize;
    console.log('Size: ' + FileSize);
    thisDownloadDetails.ResponseFilePath = resPath;
    console.log('ON DOWNLOAD SCUSSES' + thisDownloadDetails.DownloadStatus);
    await AsyncStorage.setItem(
      'downloadDetails',
      JSON.stringify(downloadDetailsArray),
    );
  };
  const cancel = async () => {
    const jsonData = await AsyncStorage.getItem('downloadDetails');
    const data = JSON.parse(jsonData);

    const filteredData = data.filter(item => item.Source !== source);
    setIsUpdated(true);
    await AsyncStorage.setItem('downloadDetails', JSON.stringify(filteredData));
  };
  const deleteFile = async () => {
    Alert.alert(
      'Do you want to Delete?',
      title,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: unLink, // Call the download function if OK is pressed
        },
      ],
      {cancelable: false},
    );
  };

  const cancelDownloading = async () => {
    Alert.alert(
      'Do you want to Delete?',
      title,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: unLink, // Call the download function if OK is pressed
        },
      ],
      {cancelable: false},
    );
  };
  const unLink = async () => {
    Alert.alert('Delete', 'The file was successfully Deleted.', [{text: 'OK'}]);
    try {
      const jsonData = await AsyncStorage.getItem('downloadDetails');
      if (jsonData) {
        const data = JSON.parse(jsonData);
        const filteredData = data.filter(item => item.Source !== source);
        setIsUpdated(true);
        await AsyncStorage.setItem(
          'downloadDetails',
          JSON.stringify(filteredData),
        );
        console.log('Data after removal:', filteredData);
      }
    } catch (error) {
      console.error('Error removing data:', error);
    }
    await RNFetchBlob.fs.unlink(filePath);
  };
  const downloadFile = async () => {
    const fileExists = await RNFetchBlob.fs.exists(filePath);
    if (fileExists) {
      try {
        // Delete the file
        await RNFetchBlob.fs.unlink(filePath);
        console.log('Deleted existing file:', filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    taskRef.current = RNFetchBlob.config({
      path: filePath,
    }).fetch('GET', url);

    taskRef.current
      .progress((recived, total) => {
        const dataRecived = parseInt(recived, 10);
        const dataTotal = parseInt(total, 10);
        setFileSize(dataTotal);
        setDownloaded(dataRecived);
      })
      .then(Response => {
        console.log('Download completerd');
        const size = async () => {
          const fileStats = await RNFS.stat(filePath);
          const FileSize = fileStats.size;
          const resPath = Response.path();

          await downloadSuccess(FileSize, resPath);
        };
        size();
      })
      .catch(error => {
        console.log(error);
      });
  };
  const download = async () => {
    setDownloading(true);
    const downloadingString = await AsyncStorage.getItem('downloadDetails');
    let downloadingArray = JSON.parse(downloadingString);

    let thisDownloading = downloadingArray.find(item => item.Source === url);
    thisDownloading.Downloading = true;
    await AsyncStorage.setItem(
      'downloadDetails',
      JSON.stringify(downloadingArray),
    );
    await downloadFile();
  };
  const handleDownloadPress = () => {
    Alert.alert(
      'Do you want to download?',
      'dont leave the screen while downloading',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Download cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: download, // Call the download function if OK is pressed
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <View style={styles.background}>
      {downloadFinished ? (
        <View style={styles.downloadFinished}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('VideoPlayer', {videoName: filePath})
            }>
            <View style={styles.thumbNail}>
              <Icons name="play-circle-outline" size={50} color="#957500" />
            </View>
          </TouchableOpacity>
          <View style={{width: 210, padding: 12}}>
            <Text numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                justifyContent: 'space-between',
                marginHorizontal: 2,
                alignItems: 'center',
              }}>
              <Text style={{color: '#616161', marginStart: 10}}>
                {formatBytes(fileSize)}
              </Text>
              <TouchableOpacity onPress={deleteFile}>
                <View
                  style={{
                    padding: 8,
                    backgroundColor: '#242424',
                    width: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: '#9c9c9c',
                      fontSize: 15,
                      fontWeight: '500',
                    }}>
                    Delete
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : downloading ? (
        <View>
          <View style={styles.downloadFinished}>
            <TouchableOpacity>
              <View style={styles.thumbNailDownloading}>
                <Icons name="play-circle-outline" size={30} color="#957500" />
              </View>
            </TouchableOpacity>
            <View style={{width: 210, padding: 12}}>
              <Text numberOfLines={2} ellipsizeMode="tail">
                {title}
              </Text>
            </View>
          </View>
          <View style={{marginTop: -10}}>
            {fileSize > 0 && (
              <ProgressBarAndroid
                style={{marginHorizontal: 15}}
                styleAttr="Horizontal"
                indeterminate={false}
                progress={downloaded / fileSize}
                color="#957500" // Background color of the progress bar
              />
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginEnd: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginEnd: 102,
                }}>
                <Text>
                  {formatBytes(downloaded)} /{formatBytes(fileSize)}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#242424',
                  padding: 10,
                  paddingHorizontal: 30,
                  borderRadius: 100,
                }}
                onPress={cancelDownloading}>
                <Text
                  style={{fontSize: 12, color: '#9c9c9c', fontWeight: '600'}}>
                  CANCEL
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.downloadFinished}>
          <TouchableOpacity>
            <View style={styles.thumbNail}>
              <Icons name="play-circle-outline" size={50} color="#957500" />
            </View>
          </TouchableOpacity>
          <View style={{width: 210, padding: 12}}>
            <Text numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 15,
                justifyContent: 'space-between',
                marginHorizontal: 2,
                alignItems: 'center',
              }}>
              <TouchableOpacity onPress={handleDownloadPress}>
                <View
                  style={{
                    padding: 8,
                    backgroundColor: '#957500',
                    width: 85,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 15,
                      fontWeight: '500',
                    }}>
                    Download
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancel}>
                <View
                  style={{
                    padding: 8,
                    backgroundColor: '#242424',
                    width: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: '#9c9c9c',
                      fontSize: 15,
                      fontWeight: '500',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    height: 150,
    marginHorizontal: 8,
    marginVertical: 10,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  thumbNail: {
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 110,
    borderRadius: 15,
  },
  thumbNailDownloading: {
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 15,
  },

  downloadFinished: {
    flexDirection: 'row',

    padding: 15,
  },
});

export default Downloads;
