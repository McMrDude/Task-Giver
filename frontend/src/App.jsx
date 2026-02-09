import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [query, setQuery] = useState(""); // what the user types

  // Filter users in real time
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
  fetch("/api/me", { credentials: "include" })
    .then(res => res.json())
    .then(user => setCurrentUser(user))
    .catch(err => console.error(err));
  }, []);



  return(
    <>
      <h1>Welcome dipshit</h1>
      <h2>If all this text comes up then I AM TO GOOD AND I WILL BE DO BE DOING BE DO SMOKING METANFETAMIN BABY!!!</h2>
      
      <Link to="/register"><div className="backWrap"><button>Register</button></div></Link>

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
      
      {currentUser && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          Logged in as {currentUser.name}
        </div>
      )}
    </>
  )
}

export default App
