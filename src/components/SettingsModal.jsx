// src/components/SettingsModal.jsx
import React, { useState } from "react";

const SettingsModal = ({ projects = [], departments = [], setProjects, setDepartments, onClose, onDeleteProject, onDeleteDepartment }) => {
  const [pName, setPName] = useState("");
  const [dName, setDName] = useState("");

  const addProject = () => {
    if (!pName.trim()) return;
    setProjects(prev => [...prev, pName.trim()]);
    setPName("");
  };

  const addDepartment = () => {
    if (!dName.trim()) return;
    setDepartments(prev => [...prev, dName.trim()]);
    setDName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Settings</h2>

        <h4>Projects</h4>
        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="New project" />
          <button className="btn-primary" onClick={addProject}>Add</button>
        </div>
        <div style={{marginBottom:12}}>
          {projects.map((p,i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'#fff', borderRadius:8, marginBottom:6}}>
              <div>{p}</div>
              <div>
                <button className="btn-small" onClick={() => onDeleteProject && onDeleteProject(p)} style={{background:'#fff', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <h4>Departments</h4>
        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <input value={dName} onChange={(e) => setDName(e.target.value)} placeholder="New department" />
          <button className="btn-primary" onClick={addDepartment}>Add</button>
        </div>
        <div>
          {departments.map((d,i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'#fff', borderRadius:8, marginBottom:6}}>
              <div>{d}</div>
              <div>
                <button className="btn-small" onClick={() => onDeleteDepartment && onDeleteDepartment(d)} style={{background:'#fff', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
