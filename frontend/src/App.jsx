import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import WorkOrder from './components/WorkOrder'
import EmergencyRoute from './components/EmergencyRoute'

const TABS = ['Upload', 'Dashboard', 'Emergency Route']

export default function App() {
  const [tab, setTab] = useState('Upload')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [healthStatus, setHealthStatus] = useState({ ok: false, cuda: false, real_ai: false })

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthStatus({ ok: data.status === 'ok', cuda: data.cuda_available, real_ai: data.is_real_ai })
      })
      .catch(() => setHealthStatus({ ok: false, cuda: false, real_ai: false }))
  }, [])

  return (
    <div className="app">
      <nav>
        <span className="logo">🏗️ CivicAI</span>
        {TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => { setTab(t); setSelectedIncident(null) }}
          >
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: '0.8rem' }}>
          <span className={`badge ${healthStatus.ok ? 'low' : 'critical'}`}>
            API: {healthStatus.ok ? 'ONLINE' : 'OFFLINE'}
          </span>
          {healthStatus.ok && (
            <>
              <span className={`badge ${healthStatus.cuda ? 'low' : 'none'}`}>CUDA: {healthStatus.cuda ? 'ON' : 'OFF'}</span>
              <span className={`badge ${healthStatus.real_ai ? 'low' : 'medium'}`}>AI: {healthStatus.real_ai ? 'REAL' : 'MOCK'}</span>
            </>
          )}
        </div>
      </nav>

      {tab === 'Upload' && <Upload />}
      {tab === 'Dashboard' && (
        selectedIncident
          ? <WorkOrder incident={selectedIncident} onBack={() => setSelectedIncident(null)} />
          : <Dashboard onSelectIncident={setSelectedIncident} />
      )}
      {tab === 'Emergency Route' && <EmergencyRoute />}
    </div>
  )
}
