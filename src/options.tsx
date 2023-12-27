import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getThemes } from "./theme";
import "./themes"

const Options = () => {
  const [token, setToken] = useState<string>("");
  const [theme, setTheme] = useState<string>("green");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    chrome.storage.sync.get(
      {
        theme: "green",
        isDark: false,
        token: ""
      },
      (items) => {
        setTheme(items.theme);
        setToken(items.token);
        setIsDark(items.isDark);
      }
    );
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        theme: theme,
        isDark: isDark,
        token: token
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div>
        Theme: <select
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          { getThemes().map((val,i)=><option key={i} value={val}>{val}</option>) }
        </select>
      </div>
      <div>
        Dark Mode: <input type="checkbox" onChange={(event)=>setIsDark(event.target.checked)} checked={isDark} />
      </div>
      <div>
        Github Token: <input type="text" value={token} onChange={(event)=> setToken(event.target.value)} />
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
