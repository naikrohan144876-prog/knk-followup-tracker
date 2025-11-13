// src/components/MenuModal.jsx
import React from "react";

/*
Props:
- open (boolean)
- onClose()
- onExport()
- onImportClick()
- onOpenSettings()
*/
export default function MenuModal({ open, onClose = () => {}, onExport = () => {}, onImportClick = () => {}, onOpenSettings = () => {} }) {
  if (!open) return null;

  // Stop overlay click from closing when clicking inside the card
  const stop = (e) => e.stopPropagation();

  return (
    <div className="menu-overlay" onClick={onClose} role="presentation" aria-hidden="true">
      <div className="menu-popover" onClick={stop} role="menu" aria-label="App menu">
        <div className="menu-arrow" aria-hidden="true" />
        <div className="menu-items">
          <button className="menu-item" onClick={() => { onOpenSettings(); onClose(); }}>
            <span className="menu-item-left">⚙️</span>
            <span className="menu-item-label">Settings</span>
          </button>

          <button className="menu-item" onClick={() => { onExport(); onClose(); }}>
            <span className="menu-item-left">📤</span>
            <span className="menu-item-label">Export Data</span>
          </button>

          <button className="menu-item" onClick={() => { onImportClick(); onClose(); }}>
            <span className="menu-item-left">📥</span>
            <span className="menu-item-label">Import Data</span>
          </button>

          <button className="menu-item" onClick={() => { alert("KNK Followup Tracker v1.0.0"); }}>
            <span className="menu-item-left">ℹ️</span>
            <span className="menu-item-label">About</span>
          </button>

          <div className="menu-divider" />

          <button className="menu-item menu-close" onClick={onClose}>
            <span className="menu-item-left">✖️</span>
            <span className="menu-item-label">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
