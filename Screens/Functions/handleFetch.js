import {db} from '../config/firebaseConfig';
import {doc, getDoc} from 'firebase/firestore';

export const handleFetch = async rawUrl => {
  const id = rawUrl.substring(rawUrl.lastIndexOf('/') + 1);
  console.log(id);
  const docRef = doc(db, 'urls', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const {url, title} = docSnap.data();
    console.log('URL:', url);
    console.log('Title:', title);
    return {url, title};
  } else {
    console.log('Document does not exist!');
  }
};
