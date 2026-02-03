import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [showMain, setShowMain] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setMsg(data.error || 'Registration failed')
        return
      }

      // On success, redirect to home
      window.location.href = '/'
    } catch (err) {
      setMsg('Network error: ' + err.message)
      console.error(err)
    }
  }

  if (showMain) {
    return <App />
  }

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => setShowMain(true)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ← Back
      </button>

      <h2>Create account</h2>

      <form onSubmit={handleSubmit}>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{ width: '200px', height: '30px' }}
        />
        <br />
        <br />

        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ width: '200px', height: '30px' }}
        />
        <br />
        <br />

        <input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          style={{ width: '200px', height: '30px' }}
        />
        <br />
        <br />

        <button type="submit">Register</button>
      </form>

      <p id="msg">{msg}</p>

      <p>
        Already have an account? <a href="/login.html">Login</a>
      </p>
    </div>
  )
}
