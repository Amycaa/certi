import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function formatDT(dt) {
  if (!dt) return '—'
  return String(dt).replace('T', ' ').replace('.000Z', '')
}

export default function Certs() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cert, setCert] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Tanúsítvány adatai
    fetch('/api/certifications')
      .then(r => r.json())
      .then(data => setCert(data.find(c => String(c.id) === String(id)) || null))

    // Kísérletek
    fetch(`/api/attempts/certification/${id}`)
      .then(r => r.json())
      .then(data => { setAttempts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <button onClick={() => navigate('/')} style={styles.back}>← Vissza</button>

        {cert && (
          <div style={styles.certHeader}>
            {cert.image && (
              <div style={styles.certImgWrap}>
                <img
                  src={cert.image}
                  alt={cert.name}
                  style={styles.certImg}
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
            <div>
              <h1 style={styles.title}>{cert.name}</h1>
              <div style={styles.meta}>
                <span style={styles.metaItem}>🎯 Min: {cert.min_percentage_to_pass}%</span>
                <span style={styles.metaItem}>💵 ${cert.cost_in_usd}</span>
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" style={styles.link}>
                    🔗 Részletek
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <h2 style={styles.subtitle}>Vizsgakísérletek</h2>

        {loading ? (
          <p style={styles.info}>Betöltés...</p>
        ) : attempts.length === 0 ? (
          <p style={styles.info}>Ehhez a tanúsítványhoz nincs kísérlet.</p>
        ) : (
          <div style={styles.grid}>
            {attempts.map(a => (
              <div key={a.attempt_id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <strong style={styles.name}>{a.full_name}</strong>
                    <div style={styles.dates}>
                      📅 {formatDT(a.start_datetime)}<br />
                      {a.end_datetime ? `⏹ ${formatDT(a.end_datetime)}` : '⏳ folyamatban'}
                    </div>
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
                <div style={styles.provRow}>
                  <span style={styles.prov}>{a.provider_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: '#f5f6fa',
    padding: '32px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: '1100px',
  },
  back: {
    background: '#e8f0fe',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 18px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#1a73e8',
    fontWeight: 600,
    marginBottom: '24px',
    display: 'inline-block',
  },
  certHeader: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  certImgWrap: {
    width: '120px',
    height: '80px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    flexShrink: 0,
  },
  certImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: '10px',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  metaItem: {
    fontSize: '13px',
    color: '#555',
    background: '#eee',
    borderRadius: '4px',
    padding: '4px 10px',
  },
  link: {
    fontSize: '13px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#555',
    fontWeight: 400,
    marginBottom: '20px',
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
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  },
  name: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
    display: 'block',
    marginBottom: '6px',
  },
  dates: {
    fontSize: '12px',
    color: '#666',
    lineHeight: 1.6,
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
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
  provRow: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '8px',
  },
  prov: {
    fontSize: '12px',
    color: '#888',
  },
  info: {
    color: '#888',
    padding: '40px 0',
    textAlign: 'center',
  },
}
