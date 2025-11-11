// src/components/AddFollowUpModal.jsx
import React, { useState, useEffect } from "react";

/**
 Props:
  - isOpen: boolean
  - onClose: () => void
  - onSave: (followUpObject) => void
  - tasks: array of { id, name, ... }
  - presetTaskId: (optional) number - preselect this task
*/
const AddFollowUpModal = ({ isOpen, onClose, onSave, tasks = [], presetTaskId }) => {
  const [taskId, setTaskId] = useState("");
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [person, setPerson] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      // preselect task if provided
      if (presetTaskId) setTaskId(String(presetTaskId));
      else setTaskId("");
      // reset fields
      setProject("");
      setDepartment("");
      setPerson("");
      setDateTime("");
      setStatus("Pending");
      setNotes("");
    }
  }, [isOpen, presetTaskId]);

  const handleSubmit = () => {
    if (!taskId) {
      alert("Please select a task.");
      return;
    }
    if (!person.trim()) {
      // optionally require person; remove this check if optional
      // alert("Please enter person name.");
      // return;
    }

    const payload = {
      taskId: parseInt(taskId, 10),
      project: project || null,
      department: department || null,
      person: person.trim() || null,
      date: dateTime || null,
      status: status || "Pending",
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
    };

    onSave(payload);   // parent should add payload to that task's followUps
    onClose();

    // reset (optional)
    setTaskId("");
    setProject("");
    setDepartment("");
    setPerson("");
    setDateTime("");
    setStatus("Pending");
    setNotes("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container">
        <h2>Add Follow-Up</h2>

        <label style={{ display: "block", marginBottom: 6 }}>Select Task</label>
        <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
          <option value="">-- Select Task --</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Project</label>
        <select value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">Select Project</option>
          <option value="Greenland">Greenland</option>
          <option value="Sriniketan">Sriniketan</option>
        </select>

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Department</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Select Department</option>
          <option>Marketing</option>
          <option>Sales</option>
          <option>Admin</option>
          <option>Legal</option>
          <option>Accounts</option>
          <option>Liaisoning</option>
        </select>

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Person Name</label>
        <input type="text" placeholder="Enter person name" value={person} onChange={(e) => setPerson(e.target.value)} />

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Follow-up Date & Time</label>
        <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Pending</option>
          <option>Completed</option>
        </select>

        <label style={{ display: "block", marginTop: 10, marginBottom: 6 }}>Notes</label>
        <textarea placeholder="Add details..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
