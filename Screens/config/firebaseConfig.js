import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyDfe7OgOCmBlVs3lrQLaRb_OZI1xUiRCis',
  authDomain: 'dummyapi-33957.firebaseapp.com',
  databaseURL: 'https://dummyapi-33957-default-rtdb.firebaseio.com',
  projectId: 'dummyapi-33957',
  storageBucket: 'dummyapi-33957.appspot.com',
  messagingSenderId: '992285813622',
  appId: '1:992285813622:web:5fa2c8aae2ec3eb3eb2857',
  measurementId: 'G-21GDL4XCZ4',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
