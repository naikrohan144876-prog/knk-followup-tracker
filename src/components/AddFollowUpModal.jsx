// src/components/AddFollowUpModal.jsx
import React, { useEffect, useState } from "react";

/*
Props:
- isOpen: boolean
- onClose(): close modal
- onSave(payload): save follow-up payload
- presetTaskId: id of task to attach follow-up to (optional)
- tasks: array of tasks
*/
export default function AddFollowUpModal({
  isOpen,
  onClose,
  onSave,
  presetTaskId = null,
  tasks = []
}) {
  const [taskId, setTaskId] = useState(presetTaskId || (tasks[0] ? tasks[0].id : ""));
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (isOpen) {
      setTaskId(presetTaskId || (tasks[0] ? tasks[0].id : ""));
      // if preset task has a followUpDate, prefill the date/time
      const t = tasks.find(x => x.id === presetTaskId);
      if (t && t.followUpDate) {
        // try to normalize: if stored iso string, keep; else empty
        setDateTime(t.followUpDate);
      }
    } else {
      // reset on close
      setTitle("");
      setDateTime("");
      setNotes("");
      setContactName("");
      setContactPhone("");
      setStatus("Pending");
    }
  }, [isOpen, presetTaskId, tasks]);

  if (!isOpen) return null;

  const selectedTask = tasks.find(t => t.id === taskId);

  const handleSave = () => {
    if (!taskId) return alert("Please select a task");
    if (!title.trim()) return alert("Enter follow-up title");
    const payload = {
      title: title.trim(),
      date: dateTime || null,
      notes: notes || "",
      contact: contactName || contactPhone ? { name: contactName || null, phone: contactPhone || null } : null,
      status: status || "Pending",
      createdAt: new Date().toISOString()
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container addfollow-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="modal-title">Add Follow-Up</h2>

        <div className="form-row">
          <label className="form-label">Task</label>
          <select
            className="form-select"
            value={taskId}
            onChange={(e) => {
              // select value may be string; tasks id may be number — keep type consistent
              const v = e.target.value;
              const parsed = Number(v);
              setTaskId(Number.isNaN(parsed) ? v : parsed);
            }}
          >
            <option value="">Select task</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="selected-task-summary">{selectedTask ? `Task: ${selectedTask.name}` : ""}</div>
        </div>

        <div className="form-row two-col">
          <div>
            <label className="form-label">Follow-Up Title</label>
            <input className="form-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter title" />
          </div>
          <div>
            <label className="form-label">Follow-Up Date & Time</label>
            <input className="form-input" type="datetime-local" value={dateTime || ""} onChange={(e)=>setDateTime(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Details / Notes</label>
          <textarea className="form-textarea" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Enter notes (optional)" />
        </div>

        <div className="form-row two-col">
          <div>
            <label className="form-label">Contact (optional)</label>
            <input className="form-input" value={contactName} onChange={(e)=>setContactName(e.target.value)} placeholder="Contact name" />
          </div>
          <div>
            <label className="form-label" style={{visibility:'hidden'}}>phone</label>
            <input className="form-input" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} placeholder="Phone number" />
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
          <button className="btn-primary" onClick={handleSave}>Save Follow-Up</button>
        </div>
      </div>
    </div>
  );
}
