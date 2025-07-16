import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-j_KT0XvactSu53KegpllHbrD39ggphE",
  authDomain: "page-roblox-shortener.firebaseapp.com",
  projectId: "page-roblox-shortener",
  storageBucket: "page-roblox-shortener.appspot.com", // fix this line (not firebasestorage.app)
  messagingSenderId: "777600646909",
  appId: "1:777600646909:web:2f4d6dc14025b4e8a10894"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
