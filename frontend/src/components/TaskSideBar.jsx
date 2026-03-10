import { useState } from "react";
import UserSearch from "./searchBar.jsx";

function TaskSidebar({ open, onClose, users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [due_date, setDueDate] = useState("");
  const [priority, setPriority] = useState("");

  const handleSend = async () => {
    if (!selectedUser || !title || !content || !due_date || !priority) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        receiverId: selectedUser.id,
        title,
        content,
        due_date,
        priority
      })
    });

    setContent("");
    setTitle("");
    setSelectedUser(null);
    alert("Task sent");
  };

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="backWrap" style={{ alignSelf: "flex-end" }}>
            <button onClick={onClose}>
                ✕
            </button>
        </div>

        <h3>Create Task</h3>

        <UserSearch users={users} onSelectUser={setSelectedUser} />

        {selectedUser && (
            <p style={{ marginTop: "10px" }}>
            Selected: <strong>{selectedUser.name}</strong>
            </p>
        )}

        <textarea
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginTop: "10px", width: "100%", height: "25px" }}
        />

        <label>Due Date:</label>

        <input
            type="date"
            value={due_date}
            onChange={(e) => setDueDate(e.target.value)}
            required
        />

        <select 
        name="priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}>
            <option value={"low"}>Low</option>
            <option value={"medium"}>Medium</option>
            <option value={"high"}>High</option>
        </select>

        <textarea
            placeholder="Task description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ marginTop: "10px", width: "100%", height: "80px" }}
        />

        <div className="backWrap" style={{ alignSelf: "flex-end" }}>
            <button
                onClick={handleSend}
            >
                Send Task
            </button>
        </div>
    </div>
  );
}

export default TaskSidebar;