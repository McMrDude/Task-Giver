import { useState, useEffect } from "react";

function UserSearch({ users }) {
  const [query, setQuery] = useState(""); // what the user types

  // Filter users in real time
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={query}           // controlled input
        onChange={(e) => setQuery(e.target.value)} // update query
        style={{ width: "200px", padding: "5px" }}
      />
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}

export default UserSearch;