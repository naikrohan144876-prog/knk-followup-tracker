
import React from "react";

const TaskList = ({ tasks, handleAddFollowUp }) => {
  return (
    <div className="task-list-wrapper">
      <h2 className="task-header">My Tasks</h2>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span className="task-title">{task.name}</span>
            </div>
          ))
        )}
      </div>

      <button className="fab-followup" onClick={handleAddFollowUp} aria-label="Add Follow Up">+</button>
    </div>
  );
};

export default TaskList;
