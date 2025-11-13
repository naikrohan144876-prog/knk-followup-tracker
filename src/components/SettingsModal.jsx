// src/components/SettingsModal.jsx
import React, { useState } from "react";

/*
Props:
- onClose(): close modal
- projects: array of project names
- departments: array of department names
- setProjects(fn or array setter)
- setDepartments(fn or array setter)
*/
export default function SettingsModal({ onClose = () => {}, projects = [], departments = [], setProjects, setDepartments }) {
  const [newProject, setNewProject] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null); // {type:'project'|'department', name: '...'} or null

  const addProject = () => {
    const v = (newProject || "").trim();
    if (!v) return alert("Enter project name");
    if (projects.includes(v)) return alert("Project already exists");
    setProjects(prev => [...prev, v]);
    setNewProject("");
  };

  const addDepartment = () => {
    const v = (newDepartment || "").trim();
    if (!v) return alert("Enter department name");
    if (departments.includes(v)) return alert("Department already exists");
    setDepartments(prev => [...prev, v]);
    setNewDepartment("");
  };

  const requestDelete = (type, name) => {
    setConfirmingDelete({ type, name });
  };

  const doDelete = () => {
    if (!confirmingDelete) return;
    const { type, name } = confirmingDelete;
    if (type === "project") {
      setProjects(prev => prev.filter(p => p !== name));
    } else {
      setDepartments(prev => prev.filter(d => d !== name));
    }
    setConfirmingDelete(null);
  };

  const cancelDelete = () => setConfirmingDelete(null);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container settings-modal">
        <button className="settings-close" onClick={onClose} aria-label="Close settings">✕</button>

        <h2 style={{marginTop:0}}>Settings</h2>

        <div className="settings-grid">
          <section className="settings-block">
            <h3>Projects</h3>

            <div className="settings-add-row">
              <input
                className="settings-input"
                placeholder="Add project name"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              />
              <button className="btn-primary" onClick={addProject}>Add</button>
            </div>

            <div className="settings-list" role="list" aria-label="Projects list">
              {projects.length === 0 && <div className="small">No projects</div>}
              {projects.map((p) => (
                <div className="settings-item" key={p} role="listitem">
                  <div className="settings-item-left">{p}</div>
                  <div className="settings-item-right">
                    <button className="btn-small" onClick={() => requestDelete('project', p)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-block">
            <h3>Departments</h3>

            <div className="settings-add-row">
              <input
                className="settings-input"
                placeholder="Add department name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
              <button className="btn-primary" onClick={addDepartment}>Add</button>
            </div>

            <div className="settings-list" role="list" aria-label="Departments list">
              {departments.length === 0 && <div className="small">No departments</div>}
              {departments.map((d) => (
                <div className="settings-item" key={d} role="listitem">
                  <div className="settings-item-left">{d}</div>
                  <div className="settings-item-right">
                    <button className="btn-small" onClick={() => requestDelete('department', d)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:12}}>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>

        {/* Confirm delete mini */}
        {confirmingDelete && (
          <div className="mini-modal">
            <div className="mini-box">
              <h4>Confirm delete</h4>
              <p>Delete <strong>{confirmingDelete.name}</strong> from {confirmingDelete.type}s? This cannot be undone.</p>
              <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:12}}>
                <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
                <button className="btn-delete" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
