import React, { useState } from "react";

const AddTaskModal = ({
  isOpen,
  onClose,
  onSave,
  projects,
  departments,
  setProjects,
  setDepartments,
}) => {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [followUpDate, setFollowUpDate] = useState("");
  const [showProjModal, setShowProjModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newProj, setNewProj] = useState("");
  const [newDept, setNewDept] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return alert("Enter task name");
    const payload = {
      name: name.trim(),
      project,
      department,
      notes,
      followUpDate,
      status,
      contact: contactName || contactPhone ? { name: contactName || null, phone: contactPhone || null } : null,
    };
    onSave(payload);
    onClose();
    setName("");
    setProject("");
    setDepartment("");
    setNotes("");
    setFollowUpDate("");
    setStatus("Pending");
    setContactName("");
    setContactPhone("");
  };

  const addNewProject = () => {
    if (!newProj.trim()) return;
    setProjects((p) => [...p, newProj.trim()]);
    setProject(newProj.trim());
    setShowProjModal(false);
    setNewProj("");
  };

  const addNewDepartment = () => {
    if (!newDept.trim()) return;
    setDepartments((d) => [...d, newDept.trim()]);
    setDepartment(newDept.trim());
    setShowDeptModal(false);
    setNewDept("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog">
      <div className="modal-container">
        <h2>Add Task</h2>

        <input type="text" placeholder="Task Name" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="inline-flex">
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">Select Project</option>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="add-mini" onClick={() => setShowProjModal(true)}>+</button>
        </div>

        <div className="inline-flex">
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="add-mini" onClick={() => setShowDeptModal(true)}>+</button>
        </div>

        <label>Next Follow-Up Date & Time</label>
        <input type="datetime-local" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />

        <textarea placeholder="Notes / Details" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <label>Contact (optional)</label>
        <div style={{display:'flex', gap:8}}>
          <input type="text" placeholder="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <input type="tel" placeholder="Phone number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Pending</option>
          <option>Completed</option>
        </select>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save</button>
        </div>

        {showProjModal && (
          <div className="mini-modal">
            <div className="mini-box">
              <h4>Add Project</h4>
              <input type="text" value={newProj} placeholder="Project name" onChange={(e) => setNewProj(e.target.value)} />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn-primary" onClick={addNewProject}>Save</button>
                <button className="btn-cancel" onClick={() => setShowProjModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showDeptModal && (
          <div className="mini-modal">
            <div className="mini-box">
              <h4>Add Department</h4>
              <input type="text" value={newDept} placeholder="Department name" onChange={(e) => setNewDept(e.target.value)} />
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn-primary" onClick={addNewDepartment}>Save</button>
                <button className="btn-cancel" onClick={() => setShowDeptModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTaskModal;
