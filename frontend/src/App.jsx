import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
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
      
      {currentUser && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          Logged in as {currentUser.name}
        </div>
      )}
    </>
  )
}

export default App
