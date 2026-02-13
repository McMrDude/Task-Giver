import { useState } from "react";

function UserSearch({ users, onSelectUser }) {
  const [query, setQuery] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ width: "100%" }}>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "5px" }}
      />

      <div style={{ marginTop: "10px" }}>
        {filteredUsers.map(user => (
          <div
            key={user.id}
            style={{
              padding: "6px",
              cursor: "pointer",
              background: "#333",
              marginBottom: "5px"
            }}
            onClick={() => onSelectUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSearch;