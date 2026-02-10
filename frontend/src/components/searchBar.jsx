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
          className="backWrap"
          ref={wrapperRef}
          style={{
            width: "25%",
            backgroundColor: "#313131",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}
        >
          <div>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <h4
                  key={user.id}
                  style={{ borderBottom: "1px solid #424242" }}
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