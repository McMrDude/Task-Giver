import { useState } from "react";
import UserSearch from "./searchBar.jsx";

function TaskSidebar({ open, onClose, users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [content, setContent] = useState("");

  const handleSend = async () => {
    if (!selectedUser || !content) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        receiverId: selectedUser.id,
        content
      })
    });

    setContent("");
    setSelectedUser(null);
    alert("Task sent");
  };

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="backWrap">
            <button onClick={onClose} style={{ alignSelf: "flex-end" }}>
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
            placeholder="Task description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ marginTop: "10px", width: "100%", height: "80px" }}
        />

        <div className="backWrap">
            <button
                onClick={handleSend}
                style={{ marginTop: "10px" }}
            >
                Send Task
            </button>
        </div>
    </div>
  );
}

export default TaskSidebar;