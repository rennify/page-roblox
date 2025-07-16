import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function getServerSideProps({ params, res }) {
  const key = params.key;

  const q = query(collection(db, 'urls'), where('key', '==', key));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    res.statusCode = 404;
    return { props: { error: 'Not found' } };
  }

  const doc = querySnapshot.docs[0];
  const urlData = doc.data();

  res.writeHead(302, { Location: urlData.originalUrl });
  res.end();

  return { props: {} };
}

export default function RedirectPage() {
  return null;
}
