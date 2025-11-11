
import React, { useState } from "react";

const AddFollowUpModal = ({ isOpen, onClose, onSave, tasks }) => {
  const [taskId, setTaskId] = useState("");
  const [person, setPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!taskId || !person.trim()) return;
    onSave({
      taskId: parseInt(taskId),
      person,
      notes,
      date,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add Follow-Up</h2>
        <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
          <option value="">Select Task</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input type="text" placeholder="Person Name" value={person} onChange={(e) => setPerson(e.target.value)} />
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <textarea placeholder="Follow-Up Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
