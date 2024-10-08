import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

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

//save to dowloads
export const saveToGallery = async (name, path) => {
  const directoryPath = `${RNFS.DownloadDirectoryPath}/qdisk`;
  const targetPath = `${directoryPath}/${name}.mp4`;

  // Check if the 'qdisk' directory exists
  const directoryExists = await RNFS.exists(directoryPath);

  // If the directory does not exist, create it
  if (!directoryExists) {
    await RNFS.mkdir(directoryPath);
  }

  // Move the file to the target path
  await RNFS.moveFile(path, targetPath);
  return targetPath;
};
