// src/components/AddTaskModal.jsx
import React, { useEffect, useState } from "react";

export default function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  projects = [],
  departments = [],
  setProjects = () => {},
  setDepartments = () => {},
}) {
  // form state
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [followUpDate, setFollowUpDate] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // inline add project/department
  const [showAddProjectRow, setShowAddProjectRow] = useState(false);
  const [showAddDeptRow, setShowAddDeptRow] = useState(false);
  const [tempProject, setTempProject] = useState("");
  const [tempDept, setTempDept] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // reset when modal is closed
      setName("");
      setProject("");
      setDepartment("");
      setNotes("");
      setStatus("Pending");
      setFollowUpDate("");
      setContactName("");
      setContactPhone("");
      setShowAddProjectRow(false);
      setShowAddDeptRow(false);
      setTempProject("");
      setTempDept("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = () => {
    if (!name.trim()) return alert("Please enter a task name.");
    const payload = {
      name: name.trim(),
      project: project || null,
      department: department || null,
      notes: notes || "",
      followUpDate: followUpDate || null,
      status: status || "Pending",
      contact: contactName || contactPhone ? { name: contactName || null, phone: contactPhone || null } : null,
    };
    onSave(payload);
  };

  const addProjectInline = () => {
    const v = (tempProject || "").trim();
    if (!v) return;
    setProjects(prev => [...prev, v]);
    setProject(v);
    setTempProject("");
    setShowAddProjectRow(false);
  };

  const addDeptInline = () => {
    const v = (tempDept || "").trim();
    if (!v) return;
    setDepartments(prev => [...prev, v]);
    setDepartment(v);
    setTempDept("");
    setShowAddDeptRow(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container addtask-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="modal-title">Add Task</h2>

        <div className="form-row">
          <label className="form-label">Task Name</label>
          <input className="form-input" type="text" placeholder="Enter task title" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-row two-col">
          <div>
            <label className="form-label">Project</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <select className="form-select" value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button className="btn-mini" onClick={() => setShowAddProjectRow(v => !v)}>+</button>
            </div>

            {showAddProjectRow && (
              <div className="inline-add">
                <input className="form-input" placeholder="New project name" value={tempProject} onChange={(e)=>setTempProject(e.target.value)} />
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button className="btn-primary" onClick={addProjectInline}>Save</button>
                  <button className="btn-cancel" onClick={() => { setShowAddProjectRow(false); setTempProject(""); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Department</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button className="btn-mini" onClick={() => setShowAddDeptRow(v => !v)}>+</button>
            </div>

            {showAddDeptRow && (
              <div className="inline-add">
                <input className="form-input" placeholder="New department name" value={tempDept} onChange={(e)=>setTempDept(e.target.value)} />
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button className="btn-primary" onClick={addDeptInline}>Save</button>
                  <button className="btn-cancel" onClick={() => { setShowAddDeptRow(false); setTempDept(""); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Next Follow-Up Date & Time</label>
          <input className="form-input" type="datetime-local" value={followUpDate} onChange={(e)=>setFollowUpDate(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label">Notes / Details</label>
          <textarea className="form-textarea" placeholder="Add notes or details" value={notes} onChange={(e)=>setNotes(e.target.value)} />
        </div>

        <div className="form-row two-col">
          <div>
            <label className="form-label">Contact (optional)</label>
            <input className="form-input" placeholder="Contact name" value={contactName} onChange={(e)=>setContactName(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{visibility:'hidden'}}>phone</label>
            <input className="form-input" placeholder="Phone number" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Save Task</button>
        </div>
      </div>
    </div>
  );
}
