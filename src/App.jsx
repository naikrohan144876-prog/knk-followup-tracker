
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";
import "./styles.css";

const BottomNav = ({ active }) => {
  const navigate = useNavigate();
  return (
    <div className="bottom-nav">
      <button className={active === "tasks" ? "active" : ""} onClick={() => navigate("/")}>Tasks</button>
      <button className={active === "dashboard" ? "active" : ""} onClick={() => navigate("/dashboard")}>Dashboard</button>
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), ...newTask, followUps: [] },
    ]);
    setShowAddTask(false);
  };

  const handleSaveFollowUp = (followUp) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === followUp.taskId
          ? { ...t, followUps: [...t.followUps, followUp] }
          : t
      )
    );
    setShowAddFollowUp(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <>
              <TaskList tasks={tasks} handleAddFollowUp={() => setShowAddFollowUp(true)} />
              <BottomNav active="tasks" />
            </>
          }/>
          <Route path="/dashboard" element={
            <>
              <Dashboard tasks={tasks} />
              <BottomNav active="dashboard" />
            </>
          }/>
        </Routes>

        {showAddTask && <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} onSave={handleAddTask} />}
        {showAddFollowUp && <AddFollowUpModal isOpen={showAddFollowUp} onClose={() => setShowAddFollowUp(false)} onSave={handleSaveFollowUp} tasks={tasks} />}

        <button className="fab" onClick={() => setShowAddTask(true)}>+</button>
      </div>
    </Router>
  );
};

export default App;
