import { useState, useEffect } from "react"

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
        <li><span className="shortcutCode">⌘K</span><a className="fakeLink" href="#" onClick={() => setShowShortcuts(false)}>Show/hide Hotkeys</a></li>
      </ul>
    </div>
  )
}

const ShortcutsHint = ({ setShowShortcuts }: any) => {
  let hotkey = "^";

  const userAgent = window.navigator.userAgent;
  
  if (userAgent.includes("Macintosh")) {
    hotkey = "⌘";
  }

  return (
    <div className="shortcuts">
      <a className="fakeLink" href="#" onClick={() => setShowShortcuts(true)}>Hotkeys</a> ({hotkey}K)
    </div>
  )
}

const Shortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const keypressWrapper = (event: KeyboardEvent) => {
    handleShortcutKeypress(event, showShortcuts);
  }

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", keypressWrapper);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", keypressWrapper);
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