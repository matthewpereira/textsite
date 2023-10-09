import React, { useState, useEffect } from "react"

const ShortcutsPopup = ({ setShowShortcuts }: any) => {
  return (
    <div className="shortcutsPopup">
      <ul>
        <li><span className="shortcutCode">↓ </span><span>Scroll Down</span></li>
        <li><span className="shortcutCode">↑ </span><span>Scroll Up</span></li>
        <li><span className="shortcutCode">→ </span><span>Next Page</span></li>
        <li><span className="shortcutCode">← </span><span>Previous Page</span></li>
        <li><span className="shortcutCode">⌥↓</span><span>Top</span></li>
        <li><span className="shortcutCode">⌥↑</span><span>Bottom</span></li>
        <li><span className="shortcutCode">⌘K</span><span className="fakeLink" onClick={() => setShowShortcuts(false)}>Show/hide Hotkeys</span></li>
      </ul>
    </div>
  )
}

const ShortcutsHint = ({ setShowShortcuts }: any) => {
  let hotkey = "^";

  if (navigator.platform.indexOf("Mac") != -1) {
    hotkey = "⌘";
  }

  return (
    <div className="shortcuts">
      <span className="fakeLink" onClick={() => setShowShortcuts(true)}>Hotkeys</span> ({hotkey}K)
    </div>
  )
}

const Shortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleShortcutKeypress);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleShortcutKeypress);
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  const handleShortcutKeypress = (event: KeyboardEvent, showShortcuts: any) => {
    if (!showShortcuts && event.metaKey && event.code === "KeyK") {
      setShowShortcuts((prevState) => !prevState);
    }
  }

  const popup = showShortcuts ? 
    <ShortcutsPopup setShowShortcuts={setShowShortcuts} /> : 
    null;

  return (
    <div style={{"display": "inline"}}>
      {popup}
      <ShortcutsHint setShowShortcuts={setShowShortcuts} />
    </div>
  );
}

export default Shortcuts;