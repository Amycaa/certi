import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Stars({ count, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < count ? '#f5a623' : '#ccc', fontSize: '16px' }}>★</span>
      ))}
    </span>
  )
}

export default function Home() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/certifications')
      .then(r => r.json())
      .then(data => { setCerts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <h1 style={styles.title}>🎓 Tanúsítványok</h1>

        {loading ? (
          <p style={styles.info}>Betöltés...</p>
        ) : (
          <div style={styles.grid}>
            {certs.map(cert => (
              <div
                key={cert.id}
                style={styles.card}
                onClick={() => navigate(`/certs/${cert.id}`)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.imgWrapper}>
                  {cert.image ? (
                    <img
                      src={cert.image}
                      alt={cert.name}
                      style={styles.img}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span style={styles.emoji}>📋</span>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h2 style={styles.certName}>{cert.name}</h2>

                  <div style={styles.starsRow}>
                    <Stars count={cert.reputation_stars} />
                  </div>

                  <div style={styles.meta}>
                    <span style={styles.metaItem}>
                      💵 ${cert.cost_in_usd}
                    </span>
                    <span style={styles.metaItem}>
                      🎯 Min: {cert.min_percentage_to_pass}%
                    </span>
                  </div>

                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.link}
                      onClick={e => e.stopPropagation()}
                    >
                      🔗 Részletek
                    </a>
                  )}
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
    backgroundImage: 'url(/backgroundImage.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
  },
  panel: {
    width: '100%',
    maxWidth: '1100px',
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '28px',
    color: '#111',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    width: '280px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
    cursor: 'pointer',
    border: '1px solid #eee',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  imgWrapper: {
    width: '100%',
    height: '150px',
    background: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '16px',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  emoji: { fontSize: '52px' },
  cardBody: { padding: '14px' },
  certName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#111',
    lineHeight: 1.3,
  },
  starsRow: {
    marginBottom: '8px',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '10px',
  },
  metaItem: {
    fontSize: '12px',
    color: '#555',
    background: '#f0f0f0',
    borderRadius: '4px',
    padding: '3px 8px',
  },
  link: {
    fontSize: '12px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 600,
  },
  info: {
    textAlign: 'center',
    color: '#888',
    padding: '40px 0',
  },
}
