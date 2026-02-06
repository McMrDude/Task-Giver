import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

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

  return (
    <div style={{ padding: '20px' }}>
      <div className="backWrap" id='return'>
        <button className="backButton" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

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

        <div className="backWrap">
          <button type="submit">Register</button>
        </div>
      </form>

      <p id="msg">{msg}</p>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}
