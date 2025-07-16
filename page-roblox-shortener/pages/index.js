import { useState } from 'react';

export default function Home() {
  const [inputUrl, setInputUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setShortUrl('');

    if (!inputUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with http or https');
      return;
    }

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: inputUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h1>Page-Roblox URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter URL to shorten"
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          style={{ width: '100%', padding: 10, fontSize: 16 }}
          required
        />
        <button type="submit" style={{ marginTop: 10, padding: '10px 20px', fontSize: 16 }}>
          Shorten
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {shortUrl && (
        <p>
          Short URL:{' '}
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </p>
      )}
    </div>
  );
}
