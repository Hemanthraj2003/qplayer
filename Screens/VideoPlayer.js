import {useRoute} from '@react-navigation/native';
import {handleFetch} from './Functions/handleFetch';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Video, {Orientation} from 'react-native-video';
import Icons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {saveHistory} from './Functions/History';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateNewId} from './Functions/downloadFunctions';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const rewardAd01 = RewardedAd.createForAdRequest(TestIds.REWARDED);
const rewardAd02 = RewardedAd.createForAdRequest(TestIds.REWARDED);

const VideoPlayer = ({navigation}) => {
  const [load01, setLoad01] = useState(false);

  const [rotationFlag, setRotationFlag] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const videoRef = useRef(null);
  const [videoUri, setVideoUri] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [audioTracks, setAudioTracks] = useState([]);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [subtitleModalVisible, setSubtitleModalVisible] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState({type: 'index', value: 0});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState({
    type: 'index',
    value: -1,
  });
  const [isHttp, setIsHttp] = useState(false);

  const route = useRoute();

  const languageMap = {
    ta: 'Tamil',
    te: 'Telugu',
    hi: 'Hindi',
    en: 'English',
    kn: 'Kannada',
    // Add more languages as needed
  };
  const handleAudioTrackChange = index => {
    setSelectedAudio({type: 'index', value: index});
    setAudioModalVisible(false);
  };

  const handleSubtitleTrackChange = index => {
    setSelectedSubtitle({type: 'index', value: index});
    setSubtitleModalVisible(false);
    console.log('....');
  };
  const onLoad = data => {
    setAudioTracks(data.audioTracks || []);
    setSubtitleTracks(data.textTracks || []);
  };
  const extractTitle = filePath => {
    // Split the path by '/' and get the last part
    const parts = filePath.split('/');
    return parts.pop(); // Returns the last element
  };
  useEffect(() => {
    if (load01) {
      setLoad01(false);
      rewardAd01.show();
    }
  }, [load01]);
  useEffect(() => {
    rewardAd01.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoad01(true);
    });
    rewardAd01.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log(reward);
    });
    rewardAd02.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log(load01);
    });
    rewardAd02.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log(reward);
    });
    rewardAd01.load();
    rewardAd02.load();

    const fetchData = async () => {
      if (route.params.videoName) {
        setVideoUri('file://' + route.params.videoName);
        const videoName = route.params.videoName;
        const videoTitle = extractTitle(videoName);
        setVideoTitle(videoTitle);
      } else if (route.params.videoUrl) {
        try {
          const {url, title} = await handleFetch(route.params.videoUrl);
          setVideoUri(url);
          setIsHttp(true);
          setVideoTitle(title);
        } catch (error) {
          console.log(error);
          alert('VIDEO NOT FOUND!!');
        }
      } else if (route.params.histroyVideo) {
        try {
          const {link, title} = route.params.histroyVideo;
          const isHttps = /^https:\/\//.test(link);
          setIsHttp(isHttps);

          console.log('link: ' + link);
          setVideoUri(link);
          setVideoTitle(title);
        } catch (error) {
          console.log('error: ' + error);
        }
      }
    };

    fetchData();

    console.log(isHttp);
  }, [route.params.videoName, route.params.videoUrl]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    StatusBar.setHidden(!isFullScreen);
  };

  const seekVideo = value => {
    videoRef.current.seek(value);
  };

  const renderTime = timeInSeconds => {
    const pad = num => {
      return ('0' + num).slice(-2);
    };
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 5, duration);
    seekVideo(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 5, 0);
    seekVideo(newTime);
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsVisible) {
      setControlsVisible(false);
    } else {
      setControlsVisible(true);
    }
  };

  const setRotationToggle = () => {
    if (!rotationFlag) {
      setRotationFlag(true);
      setIsFullScreen(true);
      navigation.setOptions({
        orientation: 'landscape_right',
      });

      setTimeout(() => {
        // Set to 'all' after the delay
        navigation.setOptions({
          orientation: 'all',
        });
      }, 10000);
    } else {
      setIsFullScreen(false);
      setRotationFlag(false);
      navigation.setOptions({
        orientation: '',
      });
    }
  };

  const handleDownload = async () => {
    setPaused(true);
    const newId = await generateNewId();
    const downloadDetail = [
      {
        id: newId,
        title: videoTitle,
        url: videoUri,
        status: null,
        resumeData: null,
        flag: 0,
        downloadedSize: 0,
        totalSize: 1,
        downloadedFilePath: null,
      },
    ];
    const updateDownloadDetails = async () => {
      const downloadDetailsString = await AsyncStorage.getItem(
        'downloadDetails',
      );

      const downloadDetailsArray = downloadDetailsString
        ? JSON.parse(downloadDetailsString)
        : [];
      const updatedArray = [...downloadDetail, ...downloadDetailsArray];
      await AsyncStorage.setItem(
        'downloadDetails',
        JSON.stringify(updatedArray),
      );
      navigation.navigate('Home', {download: updatedArray});
      rewardAd02.show();
    };
    Alert.alert(
      'Do you want to download?',
      videoTitle,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Download cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: updateDownloadDetails, // Call the download function if OK is pressed
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={showControls}
      activeOpacity={1}>
      <Video
        ref={videoRef}
        source={{uri: videoUri}}
        onProgress={data => {
          setCurrentTime(data.currentTime);
          () => setIsBuffering(false);
        }}
        onLoad={data => {
          setDuration(data.duration);
          onLoad(data);
          setIsLoading(false);
          saveHistory(videoUri, videoTitle);
        }}
        onBuffer={({isBuffering}) => setIsBuffering(isBuffering)}
        resizeMode="contain"
        onFullscreenPlayerWillPresent={() => toggleFullScreen()}
        onFullscreenPlayerWillDismiss={() => toggleFullScreen()}
        style={isFullScreen ? styles.fullScreenVideo : styles.video}
        selectedAudioTrack={selectedAudio}
        selectedTextTrack={selectedSubtitle}
        paused={paused}
      />

      {controlsVisible && (
        <>
          <View style={styles.overlayBottom}>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => setPaused(!paused)}>
              <Icons
                name={paused ? 'play-arrow' : 'pause'}
                size={25}
                color="#fff"
              />
            </TouchableOpacity>

            <Text style={styles.currentTimeText}>
              {renderTime(currentTime)}
            </Text>

            <Slider
              style={{flex: 1, height: 40, marginHorizontal: 10}}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={value => setCurrentTime(value)}
              onSlidingComplete={value => seekVideo(value)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FFFFFF"
            />

            <Text style={styles.durationText}>{renderTime(duration)}</Text>

            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={toggleFullScreen}>
              <Icons
                name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                size={25}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.overlay}>
            <View style={styles.audsub}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}>
                {/* AUDIO BUTTON */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setAudioModalVisible(true)}>
                  <Icons name="audiotrack" size={25} color="#fff" />
                  <Text style={styles.buttonText}>Audio</Text>
                </TouchableOpacity>
                {/* SUBTITLES BUTTON */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setSubtitleModalVisible(true)}>
                  <Icons name="closed-caption" size={25} color="#fff" />
                  <Text style={styles.buttonText}>Subtitle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setRotationToggle()}>
                  <Icons name="screen-rotation" size={25} color="#fff" />
                  <Text style={styles.buttonText}>Rotation</Text>
                </TouchableOpacity>
              </View>
              {/* DOWNLOAD BUTTON */}
              {isHttp && (
                <TouchableOpacity
                  style={styles.buttonDownload}
                  onPress={handleDownload}>
                  <Text style={styles.buttonTextDownload}>DOWNLOAD</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.overlaySeekContainer}>
            {/* FROWARD 5 sec */}
            <TouchableOpacity
              style={[styles.overlaySeekForward, styles.overlaySeek]}
              onPress={skipForward}>
              <MaterialCommunityIcons
                name="fast-forward-5"
                size={40}
                color="#fff"
              />
            </TouchableOpacity>
            {/* PLAY BUTTON IN THE CENTER OF THE SCREEN */}
            <TouchableOpacity
              style={[
                styles.pauseButton,
                styles.pauseButtonCenter,
                styles.overlaySeek,
              ]}
              onPress={() => setPaused(!paused)}>
              {isLoading || isBuffering ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              ) : (
                <Icons
                  name={paused ? 'play-arrow' : 'pause'}
                  size={40}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
            {/* REVIND 5 sec */}
            <TouchableOpacity
              style={[styles.overlaySeek, styles.overlaySeekBackward]}
              onPress={skipBackward}>
              <MaterialCommunityIcons name="rewind-5" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={audioModalVisible}
        onRequestClose={() => setAudioModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Audio Track</Text>
            <ScrollView contentContainerStyle={styles.modalControls}>
              {audioTracks.map((track, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => handleAudioTrackChange(index)}>
                  <Text style={styles.modalButtonText}>
                    {languageMap[track.language] || track.language}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAudioModalVisible(false)}>
              <Icons name="close" size={24} color="#575757" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={subtitleModalVisible}
        onRequestClose={() => setSubtitleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subtitle Track</Text>
            <ScrollView contentContainerStyle={styles.modalControls}>
              {subtitleTracks.map((track, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => handleSubtitleTrackChange(index)}>
                  <Text style={styles.modalButtonText}>
                    {languageMap[track.language] || track.language}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSubtitleModalVisible(false)}>
              <Icons name="close" size={24} color="#575757" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200, // Default height when not in full-screen
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 1,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 1, 0.65)',
    zIndex: 1, // Ensure the overlay is above the video
  },
  audsub: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
  },
  buttonTextDownload: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonDownload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6a800',
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  fullScreenButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    padding: 10,
    borderRadius: 5,
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    padding: 10,
    borderRadius: 5,
  },
  currentTimeText: {
    color: '#fff',
    fontSize: 12,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
  },
  overlaySeekContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.00001)',
    padding: 10,
    zIndex: 0.5,
    top: '25%',
    bottom: '25%',
    width: '100%',
    height: '50%',
  },

  overlaySeek: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 50,
    zIndex: 2,
  },
  overlaySeekForward: {
    right: '20%',
  },
  overlaySeekBackward: {
    left: '20%',
  },
  pauseButtonCenter: {
    borderRadius: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF',
  },
  modalControls: {
    flexGrow: 1,
  },
  modalButton: {
    paddingVertical: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default VideoPlayer;
