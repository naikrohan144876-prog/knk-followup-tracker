// src/App.jsx
import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import TaskList from "./components/TaskList";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [view, setView] = useState("dashboard"); // "dashboard" | "tasks"

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("knk_tasks_v4");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {
        console.warn("Could not parse tasks");
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("knk_tasks_v4", JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: "Pending",
      followUps: [],
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowTaskModal(false);
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Add follow-up
  const addFollowUp = (taskId, followUp) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              followUps: [
                ...t.followUps,
                { ...followUp, createdAt: new Date().toISOString() },
              ],
            }
          : t
      )
    );
    setShowFollowUpModal(false);
  };

  // Delete follow-up
  const deleteFollowUp = (taskId, identifier) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              followUps: t.followUps.filter(
                (fu) => (fu.createdAt || fu.id) !== identifier
              ),
            }
          : t
      )
    );
  };

  // Toggle task status Pending/Completed
  const toggleTaskStatus = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === "Completed" ? "Pending" : "Completed",
            }
          : t
      )
    );
  };

  // Open follow-up modal for a task
  const openFollowUpModalFor = (taskId) => {
    setActiveTaskId(taskId);
    setShowFollowUpModal(true);
  };

  return (
    <div className="container">
      {/* Top navigation buttons */}
      <div className="top-nav">
        <button
          className={view === "dashboard" ? "active" : ""}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={view === "tasks" ? "active" : ""}
          onClick={() => setView("tasks")}
        >
          Tasks
        </button>
      </div>

      {/* Main view */}
      <div className="main-content">
        {view === "dashboard" ? (
          <Dashboard tasks={tasks} />
        ) : (
          <TaskList
            tasks={tasks}
            onOpenFollowUpModal={openFollowUpModalFor}
            onDeleteTask={deleteTask}
            onDeleteFollowUp={deleteFollowUp}
            onToggleTaskStatus={toggleTaskStatus}
          />
        )}
      </div>

      {/* Floating add button */}
      <button className="fab" onClick={() => setShowTaskModal(true)}>
        +
      </button>

      {/* Add Task Modal */}
      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={addTask}
        />
      )}

      {/* Add Follow-Up Modal */}
      {showFollowUpModal && (
        <AddFollowUpModal
          onClose={() => setShowFollowUpModal(false)}
          onSave={(fu) => addFollowUp(activeTaskId, fu)}
        />
      )}
    </div>
  );
};

export default App;
