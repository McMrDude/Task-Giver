import { useState, useRef, useEffect } from "react";

function UserSearch({ users }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [task, setTask] = useState("");

  const wrapperRef = useRef(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!selectedUser || !task) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        receiverId: selectedUser.id,
        content: task
      })
    });

    setTask("");
    alert("Task sent");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div ref={wrapperRef} style={{ width: "292px" }}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          style={{ width: "100%", padding: "5px" }}
        />

        {open && (
          <div className="backWrapSearch">
            <div>
              {filteredUsers.map(user => (
                <h4
                  key={user.id}
                  style={{
                    border: "2px solid #5f5f5f",
                    backgroundColor: "#444444",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setSelectedUser(user);
                    setOpen(false);
                    setQuery(user.name);
                  }}
                >
                  {user.name} ({user.email})
                </h4>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div style={{ marginTop: "20px", width: "292px" }}>
          <p>Create task for<strong>{selectedUser.name}</strong></p>
          
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Type task..."
            style={{ width: "100%", height: "80px" }}
          />

          <button onClick={handleSend} style={{ marginTop: "10px" }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default UserSearch;