import { useState } from "react";

function UserSearch({ users }) { // receive users as a prop
  const [query, setQuery] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "200px", padding: "5px" }}
      />
      <div style={{ width: "15%", backgroundColor: "#313131", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {filteredUsers.map(user => (
          <h4 key={user.id} style={{ borderBottom: "1px solid #424242" }}>{user.name} ({user.email})</h4>
        ))}
      </div>
    </div>
  );
}

export default UserSearch;