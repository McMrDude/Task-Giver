import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Register from './Register'

function App() {
  const [messages, setMessages] = useState([])
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    fetch("/api/messages")
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.error(err))
  }, [])

  if (showRegister) {
    return <Register />
  }

  return(
    <>
      <h1>Welcome dipshit</h1>
      <h2>If all this text comes up then I AM TO GOOD AND I WILL BE DO BE DOING BE DO SMOKING METANFETAMIN BABY!!!</h2>
      
      <button onClick={() => setShowRegister(true)}>Register</button>

      {messages.map(msg => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </>
  )
}

export default App
