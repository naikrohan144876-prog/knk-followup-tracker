import React, { useState, useEffect } from "react";

/**
 * AddFollowUpModal
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSave: (followUpObject) => void
 *  - tasks: array of { id, name, ... }
 *  - presetTaskId: (optional) number - if provided, the select will auto-pick this task
 */
const AddFollowUpModal = ({ isOpen, onClose, onSave, tasks = [], presetTaskId }) => {
  const [taskId, setTaskId] = useState("");
  const [person, setPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [dateTime, setDateTime] = useState("");

  // When modal opens or presetTaskId changes, preselect that task (if provided)
  useEffect(() => {
    if (isOpen) {
      if (presetTaskId) {
        setTaskId(String(presetTaskId));
      } else {
        setTaskId(""); // reset if no preset
      }
      // reset other fields when opening
      setPerson("");
      setNotes("");
      setDateTime("");
    }
  }, [isOpen, presetTaskId]);

  const handleSubmit = () => {
    if (!taskId) {
      alert("Please select a task first.");
      return;
    }
    if (!person.trim()) {
      alert("Please enter person name.");
      return;
    }

    const payload = {
      taskId: parseInt(taskId, 10),
      person: person.trim(),
      notes: notes.trim(),
      date: dateTime || null, // datetime-local string or null
      createdAt: new Date().toISOString(),
    };

    // call parent save handler
    onSave(payload);

    // reset local state (optional)
    setTaskId("");
    setPerson("");
    setNotes("");
    setDateTime("");

    // close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container">
        <h2>Add Follow-Up</h2>

        <label style={{ display: "block", marginBottom: 8 }}>
          Select Task
        </label>
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <option value="">-- Select Task --</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label style={{ display: "block", marginBottom: 8 }}>Person Name</label>
        <input
          type="text"
          placeholder="Enter person name"
          value={person}
          onChange={(e) => setPerson(e.target.value)}
        />

        <label style={{ display: "block", margin: "12px 0 8px" }}>Follow-up Date & Time</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        <label style={{ display: "block", margin: "12px 0 8px" }}>Notes</label>
        <textarea
          placeholder="Follow-up notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="btn-cancel" onClick={() => { onClose(); }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
