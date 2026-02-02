import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [messages, setMessages] = useEffect([])

  useEffect(() => {
    fetch("http://localhost:3000/api/messages")
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.error(err))
  }, [])
  return(
    <>
      <h1>Welcome dipshit</h1>
      <h2>If all this text comes up then I AM TO GOOD AND I WILL BE DO BE DOING BE DO SMOKING METANFETAMIN BABY!!!</h2>
      {messages.map(msg => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </>
  )
}

export default App
