import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const Online = ({
  navigation,
  isVisible,
  setIsVisible,
  toggleOnlineVisibility,
}) => {
  const [text, setText] = useState('');
  const playIsUrl = () => {
    if (text) {
      navigation.navigate('VideoPlayer', {videoUrl: text});
      setIsVisible(false);
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => toggleOnlineVisibility()}>
      <View style={styles.container}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText.title}>PASTE THE LINK BELOW</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.textInput}
              multiline={true}
              numberOfLines={1}
              onChangeText={text => setText(text)}
              value={text}
              placeholder="Example: http://"
              placeholderTextColor="#A9A9A9"
            />
          </View>
          <View style={styles.botbut}>
            <TouchableOpacity
              style={styles.buttonRed}
              onPress={() => playIsUrl()}>
              <Text style={styles.buttonText}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonRed}
              onPress={() => toggleOnlineVisibility()}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#3B3B3B',
    borderRadius: 10,
    padding: 20,
    height: '35%',
    width: '90%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  botbut: {
    width: '100%',
    paddingHorizontal: '10%',
    paddingVertical: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  buttonRed: {
    backgroundColor: 'red',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    title: {
      fontSize: 22,
    },
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    // minHeight: 100, // optional: minimum height of the text input
  },
  inputView: {
    width: '100%',
  },
});

export default Online;
