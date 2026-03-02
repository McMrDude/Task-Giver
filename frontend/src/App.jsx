import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TaskSidebar from './components/TaskSideBar.jsx';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modalOpen = selectedTask || sidebarOpen;

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup safety (important)
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen])

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  const [query, setQuery] = useState(""); // what the user types

  const getNextStatus = (currentStatus) => {
    const order = ["new", "not_started", "started", "completed"];
    const currentIndex = order.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex === order.length - 1) {
      return null; // already completed
    }

    return order[currentIndex + 1];
  }

  const updateStatus = async (task) => {
    const nextStatus = getNextStatus(task.status);

    if (!nextStatus) return; // already completed

    // send the update request to the server
    const resp = await fetch(`/api/tasks/${task.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status: nextStatus }),
    });

    // optimistically update the selected task state so the modal updates immediately
    setSelectedTask(prev => prev && { ...prev, status: nextStatus });

    // refresh the task lists as well
    fetch("/api/my-tasks", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        // if the modal is open, try to keep the selectedTask in sync with the latest data
        if (selectedTask) {
          const updated = data.find(t => t.id === selectedTask.id);
          if (updated) setSelectedTask(updated);
        }
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "turquoise";
      case "not_started":
        return "red";
      case "started":
        return "yellow";
      case "completed":
        return "green";
      default:
        return "white";
    }
  };

  // Filter users in real time
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (selectedTask && selectedTask.status === "new" && currentUser && selectedTask.receiver_id === currentUser.id) {
      updateStatus(selectedTask);
    }
  })

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  return(
    <>
      <div style={{ display: "flex" }}>
        <div style={{flexBasis: "10%" }}>

        </div>
        <div style={{ flexBasis: "90%" }}>
          <h1>Welcome {currentUser ? currentUser.name : "dipshit"}</h1>
          <h2>If all this text comes up then I AM TO GOOD AND I WILL BE DO BE DOING BE DO SMOKING METANFETAMIN BABY!!!</h2>

          {currentUser && (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              Logged in as {currentUser.name}
            </div>
          )}
          
          <Link to="/register"><div className="backWrap"><button>Register</button></div></Link>

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
            <div className = "miniTaskDiv" style={{ bottom: 20, width: "100%", bottom: "20px", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <h3 style={{ border: "blue solid 2px", borderTopRightRadius: "10px", borderTopLeftRadius: "10px", width: 110, marginBottom: 0, borderBottom: "none" }}>
                Your Tasks:
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
                {tasks.map(task => (
                  <div onClick={() => setSelectedTask(task)} key={task.id} style={{ border: "2px solid blue", borderRadius: 20, width: "200px", height: "200px", backgroundColor: "#101010"}}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: "1px"}}>
                        <strong>From: {task.sender_name}</strong> 
                      </p>
                      <p style={{ margin: "1px"}}>
                        <strong>Task: {task.title}</strong> 
                      </p>
                    </div>
                    <p>{task.content}</p>
                    <strong>Due: {formatDate(task.due_date)}</strong>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                      <svg height="20" width="20">
                        <circle cx="10" cy="10" r="7" fill={getStatusColor(task.status)} />
                      </svg>
                      <p><strong>Status:</strong> {task.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sentTasks.length > 0 && (
            <div className = "miniTaskDiv" style={{ bottom: 20, width: "100%", bottom: "20px", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <h3 style={{ border: "blue solid 2px", borderTopRightRadius: "10px", borderTopLeftRadius: "10px", width: 110, marginBottom: 0, borderBottom: "none" }}>
                Tasks You Sent:
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
                {sentTasks.map(task => (
                  <div key={task.id} style={{ border: "2px solid blue", borderRadius: 20, width: "200px", height: "200px", backgroundColor: "#101010"}}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ margin: "1px"}}>
                        <strong>To: {task.receiver_name}</strong> 
                      </p>
                      <p style={{ margin: "1px"}}>
                        <strong>Task: {task.title}</strong> 
                      </p>
                    </div>
                    <p>{task.content}</p>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                      <svg height="20" width="20">
                        <circle cx="10" cy="10" r="7" fill={getStatusColor(task.status)} />
                      </svg>
                      <p><strong>Status:</strong> {task.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTask && (
            <>
              <div className='overlay show' onClick={() => setSelectedTask(null)} />
              <div className='taskModal'>
                <h2>{selectedTask.title}</h2>
                <p><strong>From:</strong> {selectedTask.sender_name} </p>
                <strong>Due: {formatDate(selectedTask.due_date)}</strong>
                <p>{selectedTask.content}</p>
                <button onClick={() => setSelectedTask(null)}>close</button>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <svg height="20" width="20">
                    <circle cx="10" cy="10" r="7" fill={getStatusColor(selectedTask.status)} />
                  </svg>
                  <p><strong>Status:</strong> {selectedTask.status}</p>
                </div>

                {getNextStatus(selectedTask.status) && (
                  <button onClick={() => updateStatus(selectedTask)}>
                    Move to {getNextStatus(selectedTask.status)}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App