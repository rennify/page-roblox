import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // adjust if your firebase lib is elsewhere

export async function getServerSideProps({ params, res }) {
  const { key, gameName } = params;

  // Optional: sanity check for params presence
  if (!key || !gameName) {
    res.statusCode = 404;
    return { props: {} };
  }

  // Query Firestore for doc with matching key
  const q = query(collection(db, 'urls'), where('key', '==', key));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // No matching key found, send 404
    res.statusCode = 404;
    return { props: {} };
  }

  // Get original URL from Firestore doc
  const doc = querySnapshot.docs[0];
  const urlData = doc.data();

  // Redirect with 302 to the original URL
  res.writeHead(302, { Location: urlData.originalUrl });
  res.end();

  return { props: {} };
}

export default function RedirectPage() {
  // No UI needed because of server redirect
  return null;
}
