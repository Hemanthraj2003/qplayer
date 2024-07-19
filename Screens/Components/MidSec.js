import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {loadHistory, deleteHistory} from '../Functions/History';
import {useEffect, useState} from 'react';
import Icons from 'react-native-vector-icons/MaterialIcons';

const MidSec = ({navigation}) => {
  const [reload, setReload] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const history = async () => {
    const data = await loadHistory();
    setHistoryData(data);
    console.log('%c' + JSON.stringify(data, null, 2), 'color: blue');
  };
  const toggleReload = () => {
    setReload(!reload);
  };
  const videoPlay = item => {
    console.log(item);
    navigation.navigate('VideoPlayer', {histroyVideo: item});
  };
  useEffect(() => {
    history();
    console.log('reloaded');
    if (reload) setReload(false);
  }, [reload]);

  const renderItem = ({item}) => (
    <View style={styles.item}>
      <TouchableOpacity style={styles.item} onPress={() => videoPlay(item)}>
        <Icons name="play-arrow" size={40} color="white" />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.itemText} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{alignItems: 'flex-end', marginEnd: 10}}>
        <TouchableOpacity
          onPress={async () => {
            await deleteHistory(item.link);
            setReload(true);
          }}>
          <Icons name="delete-outline" size={25} color="#d6a800" />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={styles.layout}>
      <View style={styles.head}>
        <Text style={styles.text}>Recent Videos</Text>
        <TouchableOpacity onPress={() => toggleReload()}>
          <Text style={styles.text.red}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.nrc}>
        {historyData.length > 0 ? (
          <FlatList
            data={historyData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>NO RECENT VIDEOS</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    marginTop: '2%',
  },

  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: '6%',
    marginTop: 18,
    marginBottom: 25,
  },

  text: {
    color: '#d6a800',
    fontSize: 19,
  },
  nrc: {
    flex: 1,
    marginHorizontal: '3%',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    padding: 5,
    height: 70,
    width: '100%',
    marginVertical: 10,
  },
  itemText: {
    width: '100%',
    color: 'white',
    fontSize: 17,
    paddingStart: 10,
    marginEnd: 40,
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'white',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
});
export default MidSec;
