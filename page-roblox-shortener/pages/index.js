import { useState, useEffect } from "react";

const mainTabs = ["shortener", "hyperlink"];
const tabs = ["profile", "private-server", "group"];

export default function Home() {
  const [mainTab, setMainTab] = useState("shortener");
  const [activeTab, setActiveTab] = useState("profile");
  const [input, setInput] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [hyperlink, setHyperlink] = useState("");
  const [notif, setNotif] = useState("");
  const [lastClick, setLastClick] = useState(0);

  useEffect(() => {
    document.body.style.background = "#0b0b0b";
    document.body.style.color = "#fff";
  }, []);

  function cleanInput(url) {
    return url.replace(/^https?:\/\//, "").trim();
  }

  function processUrl(tab, url) {
    url = cleanInput(url);
    const pathStartIndex = url.indexOf("/");
    if (pathStartIndex === -1) return null;
    const path = url.slice(pathStartIndex);

    if (tab === "profile") {
      if (!path.startsWith("/users/")) return null;
      return `https://${url}`;
    }
    if (tab === "private-server") {
      if (!path.startsWith("/games/") || !path.includes("privateServerLinkCode=")) return null;
      return `https://${url}`;
    }
    if (tab === "group") {
      if (!path.startsWith("/communities/")) return null;
      return `https://${url}`;
    }
    return null;
  }

  async function shorten() {
    const now = Date.now();
    if (now - lastClick < 2000) {
      showNotif("Too fast! Slow down.");
      return;
    }
    setLastClick(now);

    const processed = processUrl(activeTab, input);
    if (!processed) {
      showNotif("Invalid URL format for this tab!");
      setShortUrl("");
      return;
    }

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: processed,
          tab: activeTab,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShortUrl(data.shortUrl);
        showNotif("Shortened!");
      } else {
        showNotif(data.error || "Error shortening");
      }
    } catch (err) {
      console.error(err);
      showNotif("Server error");
    }
  }

 function makeHyperlink() {
  const url = input.trim();
  if (!url) {
    showNotif("Enter a link!");
    return;
  }
  let cleanUrl = url.startsWith("http://") || url.startsWith("https://")
    ? url.replace(/^https?:\/\//, "")
    : url;

  const finalUrl = `https://${cleanUrl}`;
  const mdLink = `[https*:*//${cleanUrl}](${finalUrl})`;
  setHyperlink(mdLink);
  showNotif("Hyperlink created!");
}

  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showNotif("Copied!");
  }

  function showNotif(text) {
    setNotif(text);
    setTimeout(() => setNotif(""), 2000);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0b0b0b; color: #fff; }
        .container {
          max-width: 520px; margin: 40px auto; background: #111;
          padding: 24px 32px; border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        h1 { text-align: center; margin-bottom: 24px; color: #1d4dff; }
        .main-tabs, .tabs {
          display: flex; justify-content: space-around; margin-bottom: 24px; border-bottom: 2px solid #333;
        }
        .tab, .main-tab {
          padding: 10px 20px; cursor: pointer; font-weight: 600;
          border-bottom: 3px solid transparent; transition: all 0.3s ease;
        }
        .tab.active, .main-tab.active {
          color: #1d4dff; border-color: #1d4dff;
          background: #222; border-radius: 6px 6px 0 0;
        }
        input[type="text"] {
          width: 100%; padding: 14px 18px; font-size: 1rem;
          border-radius: 8px; border: 1.8px solid #333;
          background: #1a1a1a; color: #fff;
        }
        input[type="text"]:focus {
          outline: none; border-color: #1d4dff; box-shadow: 0 0 10px #1d4dfaa;
        }
        button {
          margin-top: 20px; width: 100%; background-color: #1d4dff;
          border: none; color: white; font-weight: 700;
          font-size: 1.1rem; padding: 14px 0; border-radius: 8px;
          cursor: pointer; transition: background-color 0.3s ease;
        }
        button:hover { background-color: #3a66ff; }
        .short-url {
          margin-top: 16px; padding: 14px 18px; background: #222;
          border-radius: 8px; display: flex; justify-content: space-between; align-items: center;
          word-break: break-all;
        }
        .copy-btn {
          background: #1d4dff; border: none; color: white; font-weight: 600;
          padding: 8px 14px; border-radius: 6px; cursor: pointer;
        }
        .notif {
          position: fixed; bottom: 20px; left: 50%;
          transform: translateX(-50%); background: #1d4dff;
          color: white; padding: 12px 28px; border-radius: 40px;
          font-weight: 700; opacity: 0.9; z-index: 1000;
          animation: fadeInOut 2s ease;
        }
        @keyframes fadeInOut {
          0% { transform: translateX(-50%) translateY(20px); opacity: 0; }
          20% { transform: translateX(-50%) translateY(0); opacity: 1; }
          80% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(20px); opacity: 0; }
        }
        .footer {
          margin-top: 24px; text-align: center; font-size: 0.8rem; color: #777;
        }
      `}</style>

      <div className="container">
        <h1>Page-Roblox Shortener</h1>

        <div className="main-tabs">
          {mainTabs.map((tab) => (
            <div
              key={tab}
              onClick={() => {
                setMainTab(tab);
                setInput("");
                setShortUrl("");
                setHyperlink("");
              }}
              className={`main-tab ${mainTab === tab ? "active" : ""}`}
            >
              {tab === "shortener" ? "Shortener" : "Hyperlink"}
            </div>
          ))}
        </div>

        {mainTab === "shortener" && (
          <>
            <div className="tabs">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab ${activeTab === tab ? "active" : ""}`}
                >
                  {tab === "profile"
                    ? "Profile"
                    : tab === "private-server"
                    ? "Private Server"
                    : "Group"}
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder={
                activeTab === "profile"
                  ? "roblox.com/users/123456789/profile"
                  : activeTab === "private-server"
                  ? "roblox.com/games/123456789/game-name?privateServerLinkCode=..."
                  : "roblox.com/communities/123456789/"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") shorten();
              }}
            />

            <button onClick={shorten}>Shorten URL</button>

            {shortUrl && (
              <div className="short-url">
                <span>{shortUrl}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(shortUrl)}>Copy</button>
              </div>
            )}
          </>
        )}

        {mainTab === "hyperlink" && (
          <>
            <input
              type="text"
              placeholder="rations.com or https://rations.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") makeHyperlink();
              }}
            />

            <button onClick={makeHyperlink}>Create Hyperlink</button>

            {hyperlink && (
              <div className="short-url">
                <span>{hyperlink}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(hyperlink)}>Copy</button>
              </div>
            )}
          </>
        )}

        {notif && <div className="notif">{notif}</div>}

        <div className="footer">
          V3 Made by renn, dc @notrennify and @rennreborn
        </div>
      </div>
    </>
  );
}
