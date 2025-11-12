import React from "react";

const MenuModal = ({ open, onClose, onExport, onImportClick, onOpenSettings, version }) => {
  if (!open) return null;

  return (
    <div className="menu-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="menu-drawer">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <h3 style={{margin:0, color:'#1e88e5'}}>Menu</h3>
          <button className="btn-small" onClick={onClose}>Close</button>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <button className="btn-primary" onClick={() => { onExport(); onClose(); }}>Export Backup</button>
          <button className="btn-primary" onClick={() => { onImportClick(); onClose(); }}>Import Backup</button>
          <button className="btn-primary" onClick={() => { onOpenSettings(); onClose(); }}>Settings</button>
        </div>

        <div style={{marginTop:20, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <small style={{color:'#6b7280'}}>Version</small>
          <div style={{padding:'6px 8px', background:'#fff', borderRadius:8, border:'1px solid #eee'}}>{version}</div>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
