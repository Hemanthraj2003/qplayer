import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveHistory = async (link, title) => {
  try {
    const oldHistory = await AsyncStorage.getItem('history');
    let newHistory = oldHistory ? JSON.parse(oldHistory) : [];
    //if new and old history are same, preventing from duplicate histroy
    newHistory = newHistory.filter(item => item.link !== link);
    let latestHistory = [{link, title}];
    latestHistory = latestHistory.concat(newHistory);
    await AsyncStorage.setItem('history', JSON.stringify(latestHistory));
    console.log('%cSuccessfully saved history', 'color: green');
  } catch (error) {
    console.log('%c' + error, 'color: red');
  }
};

export const loadHistory = async () => {
  try {
    const history = await AsyncStorage.getItem('history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.log('%c' + error, 'color: red');
  }
};

export const deleteHistory = async link => {
  try {
    let history = await AsyncStorage.getItem('history');
    history = JSON.parse(history);
    console.log(link);
    let newHistory = history.filter(item => item.link !== link);
    await AsyncStorage.setItem('history', JSON.stringify(newHistory));
  } catch (error) {
    console.log(error);
  }
};
