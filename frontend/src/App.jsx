import { useEffect, useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import WorkOrder from './components/WorkOrder'
import EmergencyRoute from './components/EmergencyRoute'
import { readResponse } from './api'

const TABS = [
  { label: 'Dashboard', icon: '▦' },
  { label: 'Report Issue', icon: '+' },
  { label: 'Emergency Route', icon: '⌁' },
]

export default function App() {
  const [tab, setTab] = useState('Dashboard')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [healthStatus, setHealthStatus] = useState({ state: 'checking', realAi: null })

  useEffect(() => {
    fetch('/api/health').then(async (res) => {
      const data = await readResponse(res)
      if (!res.ok) throw new Error(data.detail || res.statusText)
      setHealthStatus({ state: data.status === 'ok' ? 'online' : 'offline', realAi: Boolean(data.is_real_ai) })
    }).catch((err) => {
      console.error('FixitAI API health check failed:', err)
      setHealthStatus({ state: 'offline', realAi: null })
    })
  }, [])

  const reportCreated = () => {
    setRefreshKey((key) => key + 1)
    setTab('Dashboard')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setTab('Dashboard'); setSelectedIncident(null) }}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FixitAI<span className="brand-period">.</span><small>Detect. Prioritize. Fix.</small></span>
        </a>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {TABS.map(({ label, icon }) => (
            <button key={label} className={tab === label ? 'nav-item active' : 'nav-item'} onClick={() => { setTab(label); setSelectedIncident(null) }}>
              <span className="nav-icon" aria-hidden="true">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className={`health-dot ${healthStatus.state}`} />
          <div><strong>System status</strong><span>{healthStatus.state === 'checking' ? 'Checking API…' : healthStatus.state === 'online' ? 'API connected' : 'API unavailable'}</span></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">FixitAI <span>/</span> {selectedIncident ? 'Incident details' : tab}</div>
          <div className={`api-status ${healthStatus.state}`}><i />{healthStatus.state === 'checking' ? 'Checking connection' : healthStatus.state === 'online' ? 'System operational' : 'API unavailable'}{healthStatus.state === 'online' && healthStatus.realAi === false && <span className="ai-mode">Demo AI</span>}</div>
        </header>
        <div className="page-content">
          {tab === 'Report Issue' && <Upload onCreated={reportCreated} />}
          {tab === 'Dashboard' && (selectedIncident
            ? <WorkOrder incident={selectedIncident} onBack={() => setSelectedIncident(null)} />
            : <Dashboard key={refreshKey} onSelectIncident={setSelectedIncident} onReport={() => setTab('Report Issue')} />)}
          {tab === 'Emergency Route' && <EmergencyRoute />}
        </div>
      </main>
    </div>
  )
}
