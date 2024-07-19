import {StyleSheet, View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

const Header = () => {
  return (
    <View style={styles.basic}>
      <Text style={styles.color}>Q-player</Text>
      <Icon name="info-with-circle" size={22} color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  basic: {
    height: '8%',
    marginBottom: '3%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: '5%',
  },
  color: {
    color: '#ffc903',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default Header;
