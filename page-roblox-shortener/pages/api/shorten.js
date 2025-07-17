import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Generate random 10-digit key
function generateRandom10Digit() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Check if key exists
async function keyExists(key) {
  const q = query(collection(db, 'urls'), where('key', '==', key));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Parse private server URL
function parsePrivateServerUrl(originalUrl) {
  try {
    const url = new URL(originalUrl);
    const pathnameParts = url.pathname.split('/').filter(Boolean);
    const gameId = pathnameParts[1];
    const gameName = pathnameParts[2];
    const privateServerLinkCode = url.searchParams.get('privateServerLinkCode');
    return { gameId, gameName, privateServerLinkCode };
  } catch (err) {
    return {};
  }
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
    const { gameName, privateServerLinkCode } = parsePrivateServerUrl(originalUrl);
    if (!gameName || !privateServerLinkCode) {
      res.status(400).json({ error: 'Missing gameName or privateServerLinkCode' });
      return;
    }
    shortUrl = `https://page-roblox.com/games/${key}/${gameName}?privateServerLinkCode=${privateServerLinkCode}`;
  } else if (tab === 'group') {
    shortUrl = `https://page-roblox.com/communities/${key}/`;
  }

  res.status(200).json({
    shortUrl,
  });
}
