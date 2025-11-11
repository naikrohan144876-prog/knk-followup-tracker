import React, { useState, useEffect } from "react";

/**
 * AddFollowUpModal
 * Shows task name and allows adding follow-up details
 */
const AddFollowUpModal = ({ isOpen, onClose, onSave, tasks = [], presetTaskId }) => {
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (isOpen && presetTaskId) {
      const t = tasks.find((x) => x.id === presetTaskId);
      setTask(t);
      setTitle("");
      setNotes("");
      setDate("");
      setStatus("Pending");
    }
  }, [isOpen, presetTaskId]);

  const handleSave = () => {
    if (!task) return;
    if (!title.trim()) return alert("Enter follow-up title");

    const payload = {
      taskId: task.id,
      title: title.trim(),
      notes: notes.trim(),
      date,
      status,
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

        <input
          type="text"
          placeholder="Follow-Up Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Follow-Up Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <textarea
          placeholder="Details / Notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

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
