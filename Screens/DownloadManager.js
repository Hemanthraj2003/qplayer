import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import Downloads from './Components/Downloads';
import {addDownloadDetails, generateNewId} from './Functions/downloadFunctions';
const DownloadManager = ({
  navigation,
  downloadDetailsList,
  setDownloadDetailsList,
}) => {
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    const item = {
      id: 2,
      title: 'new01.mp4',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      status: null,
      resumeData: null,
      flag: 0,
      downloadedSize: 0,
      totalSize: 1,
      downloadedFilePath: null,
    };
    const fun = async () => {
      await addDownloadDetails(item);
    };
    // fun();
    const reset = async () => {
      const test = await AsyncStorage.getItem('downloadDetails');
      setDownloadDetailsList(JSON.parse(test));
    };

    reset();
  }, []);

  const renderItem = ({item}) => {
    return (
      <Downloads
        navigation={navigation}
        item={item}
        setDownloadDetailsList={setDownloadDetailsList}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerColor}>DOWNLOAD MANAGER</Text>
      </View>
      <View>
        {downloadDetailsList && downloadDetailsList.length !== 0 ? (
          <FlatList
            data={downloadDetailsList}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.flatList}
            extraData={downloadDetailsList}
          />
        ) : (
          <View style={styles.noDownloads}>
            <Text style={{fontSize: 14, fontStyle: 'italic'}}>
              NO DOWNLOADED FILES
            </Text>
          </View>
        )}
        {/* <Downloads navigation={navigation} item={item} /> */}
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
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 28,
    paddingBottom: 18,
  },
  headerColor: {
    color: '#957500',
    fontSize: 20,
    fontWeight: '600',
  },
  flatList: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  noDownloads: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DownloadManager;
