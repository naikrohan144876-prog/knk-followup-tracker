// src/components/TaskList.jsx
import React from "react";

/**
 Props:
  - tasks: array of tasks
  - onOpenFollowUpModal: function(taskId)  // opens modal to add follow-up for that task
*/
const TaskList = ({ tasks = [], onOpenFollowUpModal }) => {
  return (
    <div className="task-list-wrapper">
      <h2 className="task-header">My Tasks</h2>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Tap + to add a task.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item row">
              <div style={{flex: 1}}>
                <div className="task-title">{task.name}</div>
              </div>

              {/* plus button at the right to add follow-up */}
              <div style={{marginLeft: 12}}>
                <button
                  className="followup-btn"
                  title={`Add follow-up for ${task.name}`}
                  onClick={() => onOpenFollowUpModal && onOpenFollowUpModal(task.id)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
