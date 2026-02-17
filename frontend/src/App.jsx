import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UserSearch from './components/searchBar.jsx'; 
import TaskSidebar from './components/TaskSideBar.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = () => {
      fetch("/api/my-tasks", { credentials: "include" })
        .then(res => res.json())
        .then(data => setTasks(data));
  };

  fetchTasks(); // initial load

  const interval = setInterval(fetchTasks, 5000); // every 5 sec

  return () => clearInterval(interval);
}, []);

const [sentTasks, setSentTasks] = useState([]);

  useEffect(() => {
    fetch("/api/sent-tasks", { credentials: "include" })
      .then(res => res.json())
      .then(data => setSentTasks(data));
  }, []);

  return(
    <>
      <h1>Welcome {currentUser ? currentUser.name : "dipshit"}</h1>
      <h2>If all this text comes up then I AM TO GOOD AND I WILL BE DO BE DOING BE DO SMOKING METANFETAMIN BABY!!!</h2>
      
      <Link to="/register"><div className="backWrap"><button>Register</button></div></Link>
      
      {currentUser && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          Logged in as {currentUser.name}
        </div>
      )}

      <div className="backWrap">
        <button onClick={() => setSidebarOpen(true)}>
          Create Task
        </button>
      </div>

      {sidebarOpen && (
        <div
          className={`overlay ${sidebarOpen ? "show" : "hide"}`} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <TaskSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        users={users}
      />

      {tasks.length > 0 && (
        <div style={{ bottom: 20, width: "100%" }}>
          <h3>Your Tasks:</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexDirection: "column" }}>
            {tasks.map(task => (
              <div style={{ border: "2px solid blue", borderRadius: 20, width: "200px", height: "200px", backgroundColor: "#101010"}}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p key={task.id}>
                    <strong>From: {task.sender_name}</strong> 
                  </p>
                  <p key={task.id}>
                    <strong>Task: {task.title}</strong> 
                  </p>
                </div>
                <p key={task.id}>{task.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sentTasks.length > 0 && (
        <div>
          <h3>Tasks You Sent:</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexDirection: "column" }}>
            {sentTasks.map(task => (
              <div style={{ border: "2px solid blue", borderRadius: 20, width: "200px", height: "200px", backgroundColor: "#101010"}}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p key={task.id}>
                    <strong>To: {task.receiver_name}</strong> 
                  </p>
                  <p key={task.id}>
                    <strong>Task: {task.title}</strong> 
                  </p>
                </div>
                <p key={task.id}>{task.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default App
