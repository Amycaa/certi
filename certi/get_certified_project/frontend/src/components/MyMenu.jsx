import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MyMenu() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim().length < 3) return
    navigate(`/search/${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <nav style={styles.nav}>
      <button onClick={() => navigate('/')} style={styles.homeBtn} title="Főoldal">
        🏠
      </button>
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Keresés (min. 3 karakter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
        <button
          type="submit"
          style={{
            ...styles.searchBtn,
            opacity: query.trim().length < 3 ? 0.5 : 1,
            cursor: query.trim().length < 3 ? 'not-allowed' : 'pointer'
          }}
          disabled={query.trim().length < 3}
        >
          Keres
        </button>
      </form>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.97)',
    borderBottom: '1px solid #ddd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  homeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '26px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  form: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    padding: '7px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    width: '220px',
  },
  searchBtn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 18px',
    fontSize: '14px',
    fontWeight: 600,
  },
}
