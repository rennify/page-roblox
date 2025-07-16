import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function generateRandom10Digit() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function keyExists(key) {
  const q = query(collection(db, 'urls'), where('key', '==', key));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { originalUrl } = req.body;

  if (!originalUrl || !originalUrl.startsWith('http')) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  let key;
  let tries = 0;
  const maxTries = 5;

  do {
    if (tries >= maxTries) {
      res.status(500).json({ error: 'Could not generate unique key.' });
      return;
    }
    key = generateRandom10Digit();
    tries++;
  } while (await keyExists(key));

  await addDoc(collection(db, 'urls'), {
    key,
    originalUrl,
    createdAt: new Date(),
  });

  res.status(200).json({
    shortUrl: `https://page-roblox.com/users/${key}/profile`,
  });
}
