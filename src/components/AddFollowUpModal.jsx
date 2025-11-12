import React, { useState, useEffect } from "react";

const AddFollowUpModal = ({ isOpen, onClose, onSave, tasks = [], presetTaskId }) => {
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (isOpen && presetTaskId) {
      const t = tasks.find((x) => x.id === presetTaskId);
      setTask(t || null);
      setTitle("");
      setNotes("");
      setDate("");
      setStatus("Pending");
      setContactName("");
      setContactPhone("");
    }
  }, [isOpen, presetTaskId, tasks]);

  const handleSave = () => {
    if (!task) return;
    if (!title.trim()) return alert("Enter follow-up title");
    const payload = {
      taskId: task.id,
      title: title.trim(),
      notes: notes.trim(),
      date,
      status,
      contact: contactName || contactPhone ? { name: contactName || null, phone: contactPhone || null } : null,
      createdAt: new Date().toISOString(),
    };
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog">
      <div className="modal-container">
        <h2>Add Follow-Up</h2>

        {task && (
          <div className="readonly-field">
            <strong>Task:</strong> {task.name}
          </div>
        )}

        <input type="text" placeholder="Follow-Up Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Follow-Up Date & Time</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />

        <textarea placeholder="Details / Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

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
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
