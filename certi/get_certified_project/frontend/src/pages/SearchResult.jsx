import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function formatDT(dt) {
  if (!dt) return '—'
  return String(dt).replace('T', ' ').replace('.000Z', '')
}

export default function SearchResult() {
  const { searchedWord } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!searchedWord || searchedWord.length < 3) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/search/${encodeURIComponent(searchedWord)}`)
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [searchedWord])

  if (!searchedWord || searchedWord.length < 3) {
    return (
      <div style={styles.page}>
        <p style={styles.info}>A kereséshez legalább 3 karakter szükséges.</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Keresés: „{searchedWord}"</h1>

      {loading ? (
        <p style={styles.info}>Keresés folyamatban...</p>
      ) : results.length === 0 ? (
        <div style={styles.noResult}>„{searchedWord}" részletre nincs találat...</div>
      ) : (
        <div style={styles.grid}>
          {results.map((a, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <strong style={styles.personName}>{a.person_name}</strong>
                  <div style={styles.certName}>{a.certification_name}</div>
                  <div style={styles.provName}>{a.provider_name}</div>
                </div>
                <div style={styles.result}>
                  {a.percentage !== null && (
                    <span style={styles.pct}>{a.percentage}%</span>
                  )}
                  {a.is_passed !== null && (
                    <span style={{
                      ...styles.badge,
                      background: a.is_passed ? '#34a853' : '#ea4335'
                    }}>
                      {a.is_passed ? '✓ Sikeres' : '✗ Sikertelen'}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.dates}>
                📅 {formatDT(a.start_datetime)}
                {a.end_datetime && ` → ${formatDT(a.end_datetime)}`}
              </div>

              <button
                style={styles.viewBtn}
                onClick={() => navigate(`/certs/${a.certification_id}`)}
              >
                Vizsga megtekintése
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: '#f5f6fa',
    padding: '32px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginBottom: '24px',
    color: '#111',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '10px',
    padding: '16px',
    width: '320px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  personName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
    display: 'block',
    marginBottom: '4px',
  },
  certName: {
    fontSize: '13px',
    color: '#1a73e8',
    fontWeight: 600,
    marginBottom: '2px',
  },
  provName: {
    fontSize: '12px',
    color: '#888',
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px',
    flexShrink: 0,
  },
  pct: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#1a73e8',
  },
  badge: {
    color: '#fff',
    borderRadius: '4px',
    padding: '3px 8px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  dates: {
    fontSize: '12px',
    color: '#666',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '8px',
  },
  viewBtn: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
    alignSelf: 'flex-start',
  },
  noResult: {
    background: '#fffbe6',
    border: '1px solid #ffe58f',
    borderRadius: '8px',
    padding: '16px 20px',
    color: '#ad8b00',
    fontSize: '15px',
  },
  info: {
    color: '#888',
    padding: '40px 0',
    textAlign: 'center',
  },
}
