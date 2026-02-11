import { useState, useRef, useEffect } from "react";

function UserSearch({ users }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false); // 👈 is dropdown visible?
  const wrapperRef = useRef(null);         // 👈 reference to the whole component

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  // 👇 close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      <input
        ref={wrapperRef}
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)} // 👈 show list when input is focused
        style={{ width: "200px", padding: "5px" }}
      />

      {open && (
        <div
          id="searchDiv"
          className="backWrapSearch"
          ref={wrapperRef}
        >
          <div style={{ backgroundcolor: "#313131"}}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <h4
                  key={user.id}
                  style={{ border: "1px solid #5f5f5f", backgroundColor: "#444444" }}
                >
                  {user.name} ({user.email})
                </h4>
              ))
            ) : (
              <p style={{ color: "#aaa" }}>No users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSearch;