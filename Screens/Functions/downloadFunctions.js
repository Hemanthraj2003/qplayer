import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
//temp URL and Destination path
export const url =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
export const filePath = `${RNFS.DocumentDirectoryPath}/videos/Sinteltest019.mp4`;

// Custum function to format Bytes
export const formatBytes = bytes => {
  const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

//list of all the files in the directory
export const ls = async () => {
  const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
  files.forEach((file, index) => {
    console.log(`>>  Name: ${file.name}`);
  });
};

//PauseDownload
export const pauseFileDownload = async refernce => {
  if (refernce.current) {
    refernce.current.cancel(error => {
      console.log(error);
    });
  }
};

//saveDwonloadProgress
export const saveDownloadProgress = async (
  downloaded,
  totalDownloadedBytes,
  fileSize,
) => {
  console.log('save progress');
  const data = downloaded + totalDownloadedBytes;
  const downloadDetails = [{recived: data, Size: fileSize}];
  console.log(downloadDetails);
  try {
    await AsyncStorage.setItem(
      'downloadDetails',
      JSON.stringify(downloadDetails),
    );
  } catch (error) {
    console.log(error);
  }
};

//load Dwonload Progress
export const loaddownloadProgressData = async (
  setTotalDownloadedBytes,
  setFileSize,
) => {
  try {
    const downloadedProgressData = await AsyncStorage.getItem(
      'downloadDetails',
    );

    if (downloadedProgressData !== null) {
      console.log('load progress');
      const data = JSON.parse(downloadedProgressData);
      console.log('Recived ' + data[0].recived);
      setTotalDownloadedBytes(data[0].recived);
      setFileSize(data[0].Size);
    }
  } catch (error) {
    console.log(error);
  }
};
