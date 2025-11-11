
import React, { useState } from "react";

const AddTaskModal = ({ isOpen, onClose, onSave }) => {
  const [taskName, setTaskName] = useState("");
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!taskName.trim()) return;
    onSave({ name: taskName, project, department, notes });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add New Task</h2>
        <input type="text" placeholder="Task Name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
        <select value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">Select Project</option>
          <option value="Greenland">Greenland</option>
          <option value="Sriniketan">Sriniketan</option>
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">Select Department</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Admin">Admin</option>
          <option value="Legal">Legal</option>
          <option value="Accounts">Accounts</option>
          <option value="Liaisoning">Liaisoning</option>
        </select>
        <textarea placeholder="Notes / Comments" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
