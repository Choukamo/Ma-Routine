import { useEffect, useState } from 'react'
import { Apple, CalendarCheck, Dumbbell, ListChecks, Sparkles } from 'lucide-react'
import Today from './pages/Today'
import Beauty from './pages/Beauty'
import Nutrition from './pages/Nutrition'
import Sport from './pages/Sport'
import TodoPage from './pages/Todo'

export type Tab = 'jour' | 'beaute' | 'nutrition' | 'sport' | 'todo'

const TABS: { id: Tab; label: string; Icon: typeof Apple }[] = [
  { id: 'jour', label: 'Aujourd’hui', Icon: CalendarCheck },
  { id: 'beaute', label: 'Beauté', Icon: Sparkles },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple },
  { id: 'sport', label: 'Sport', Icon: Dumbbell },
  { id: 'todo', label: 'À faire', Icon: ListChecks },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('jour')
  useEffect(() => window.scrollTo(0, 0), [tab])
  return (
    <div className="app">
      <main className="page">
        {tab === 'jour' && <Today go={setTab} />}
        {tab === 'beaute' && <Beauty />}
        {tab === 'nutrition' && <Nutrition />}
        {tab === 'sport' && <Sport />}
        {tab === 'todo' && <TodoPage />}
      </main>
      <nav className="tabbar">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}>
            <Icon size={22} strokeWidth={tab === id ? 2.2 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
