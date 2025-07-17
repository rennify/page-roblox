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

  const { originalUrl, tab } = req.body;

  if (!originalUrl || !originalUrl.startsWith('http')) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  if (!tab || !['profile', 'private-server', 'group'].includes(tab)) {
    res.status(400).json({ error: 'Invalid tab' });
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

  let shortUrl = '';
  if (tab === 'profile') {
    shortUrl = `https://page-roblox.com/users/${key}/profile`;
  } else if (tab === 'private-server') {
    shortUrl = `https://page-roblox.com/games/${key}/server`;
  } else if (tab === 'group') {
    shortUrl = `https://page-roblox.com/communities/${key}/`;
  }

  res.status(200).json({
    shortUrl,
  });
}
