import AsyncStorage from '@react-native-async-storage/async-storage';

// Custum function to format Bytes
export const formatBytes = bytes => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

//generate new ID for the downloadDetails
export const generateNewId = async () => {
  const jsonValue = await AsyncStorage.getItem('downloadDetails');
  const downloadDetails = jsonValue != null ? JSON.parse(jsonValue) : [];
  const newId = downloadDetails.length + 1;
  console.log(newId);
  return newId;
};

//downloadDetails update for new list
export const addDownloadDetails = async data => {
  const oldData = await AsyncStorage.getItem('downloadDetails');
  const oldDataparsed = oldData != null ? JSON.parse(oldData) : [];

  const updatedData = [data, ...oldDataparsed];

  //saving the updated data
  const newData = JSON.stringify(updatedData);
  console.log('added data: ' + newData);
  await AsyncStorage.setItem('downloadDetails', newData);
};

//update the current downloading list
export const updateDownloadList = async (id, downloaded, fileSize) => {
  console.log(downloaded + '/' + fileSize);
  const data = await AsyncStorage.getItem('downloadDetails');
  const dataParsed = JSON.parse(data) || [];

  // Update the specific item in the list
  const updatedList = dataParsed.map(item =>
    item.id === id ? {...item, resumeData: downloaded, size: fileSize} : item,
  );

  // Save the updated list back to AsyncStorage
  await AsyncStorage.setItem('downloadDetails', JSON.stringify(updatedList));

  return downloaded;
};
