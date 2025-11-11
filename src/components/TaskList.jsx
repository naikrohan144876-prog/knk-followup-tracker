import React from "react";

const formatDate = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TaskList = ({ tasks = [], onOpenFollowUpModal }) => {
  return (
    <div className="task-list-wrapper">
      <h2 className="task-header">My Tasks</h2>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Tap + to add a task.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-main">
                <div>
                  <div className="task-title">{task.name}</div>
                  <div className="task-dates">
                    <span>Created: {formatDate(task.createdAt)}</span>
                    {task.followUpDate && (
                      <span> | Next: {formatDate(task.followUpDate)}</span>
                    )}
                  </div>
                </div>

                <button
                  className="followup-btn"
                  onClick={() => onOpenFollowUpModal(task.id)}
                >
                  +
                </button>
              </div>

              {task.followUps?.length > 0 && (
                <div className="followup-list">
                  {task.followUps.map((fu, i) => (
                    <div key={i} className="followup-item">
                      <strong>{fu.title || "Follow-Up"}</strong> –{" "}
                      {formatDate(fu.date)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
