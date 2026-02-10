import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UserSearch from './components/searchBar.jsx'; 

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  const [query, setQuery] = useState(""); // what the user types

  // Filter users in real time
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  const [currentUser, setCurrentUser] = useState(null);

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

      <UserSearch users={users} />
      
      {currentUser && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          Logged in as {currentUser.name}
        </div>
      )}
    </>
  )
}

export default App
