import { useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import WorkOrder from './components/WorkOrder'
import EmergencyRoute from './components/EmergencyRoute'

const TABS = ['Upload', 'Dashboard', 'Emergency Route']

export default function App() {
  const [tab, setTab] = useState('Upload')
  const [selectedIncident, setSelectedIncident] = useState(null)

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
