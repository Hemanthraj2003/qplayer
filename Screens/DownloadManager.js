import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import Downloads from './Components/Downloads';

const DownloadManager = ({navigation}) => {
  const [downloadDetailsList, setDownloadDetailsList] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  useEffect(() => {
    const reset = async () => {
      const test = await AsyncStorage.getItem('downloadDetails');
      setDownloadDetailsList(JSON.parse(test));
    };

    reset();
  }, []);

  useEffect(() => {
    const update = async () => {
      const test = await AsyncStorage.getItem('downloadDetails');
      setDownloadDetailsList(JSON.parse(test));
      setIsUpdated(false);
    };
    if (isUpdated) {
      update();
    }
  }, [isUpdated]);

  const renderItem = ({item}) => {
    const status = item.DownloadStatus;
    return (
      <View>
        <Downloads
          navigation={navigation}
          title={item.Title}
          source={item.Source}
          DownloadStatu={status}
          FilePath={item.ResponseFilePath}
          Size={item.Size}
          setIsUpdated={setIsUpdated}
        />
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerColor}>DOWNLOAD MANAGER</Text>
      </View>
      <View>
        {downloadDetailsList.length !== 0 ? (
          <FlatList
            data={downloadDetailsList}
            renderItem={renderItem}
            keyExtractor={item => item.Source}
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
    paddingVertical: 20,
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
