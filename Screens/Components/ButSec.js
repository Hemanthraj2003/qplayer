import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Icons from 'react-native-vector-icons/MaterialIcons';

import Icon2 from 'react-native-vector-icons/AntDesign';
import {InterstitialAd, TestIds} from 'react-native-google-mobile-ads';

const ButSec = ({navigation, toggleOnlineVisibility}) => {
  const goLocal = () => {
    navigation.navigate('Local');
  };
  const goDownloads = () => {
    navigation.navigate('History');
  };
  return (
    <View style={styles.size}>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={{alignItems: 'center'}}
          onPress={toggleOnlineVisibility}>
          <Icon2
            name="earth"
            size={50}
            color="#ffc903"
            style={{marginBottom: 5}}
          />
          <Text>Online</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={goLocal}>
          <Icon
            name="folder-video"
            size={50}
            color="#ffc903"
            style={{marginBottom: 5}}
          />
          <Text>My Videos</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={goDownloads}>
          <Icons
            name="history"
            size={50}
            color="#ffc903"
            style={{marginBottom: 5}}
          />
          <Text>History</Text>
        </TouchableOpacity>
      </View>

      {/* Render Online component if isOnlineVisible is true */}
    </View>
  );
};

const styles = StyleSheet.create({
  size: {
    height: 120,
    marginHorizontal: 10,
    marginVertical: '5%',
    backgroundColor: '#3B3B3B',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  buttons: {
    marginHorizontal: 3,
    height: '100%',
    width: '38%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  images: {
    flex: 1,
    height: '70%',
    width: '70%',
  },
});

export default ButSec;
