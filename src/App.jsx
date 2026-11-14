import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2,
  ChevronDown, Circle, ClipboardList, Clock3, LayoutDashboard, ListTodo,
  Plus, Search, Settings2, Target, Trash2, X, Pencil, CalendarCheck
} from 'lucide-react'

const STORAGE_KEY = 'taskflow.tasks.v1'
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const dateFromISO = (value) => {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const date = dateFromISO(value)
  return date ? date.toLocaleDateString(undefined, options) : 'No due date'
}
const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const isOverdue = (task) => !task.completed && task.dueDate && task.dueDate < todayISO()
const isDueToday = (task) => !task.completed && task.dueDate === todayISO()

const starterTasks = [
  { id: makeId(), title: 'Plan the week ahead', description: 'Review priorities and block out focused time.', dueDate: todayISO(), priority: 'High', completed: false, createdAt: Date.now() },
  { id: makeId(), title: 'Review project milestones', description: 'Check progress and update the project plan.', dueDate: dayKey(new Date(Date.now() + 86400000)), priority: 'Medium', completed: false, createdAt: Date.now() },
  { id: makeId(), title: 'Organize workspace', description: 'Clear the desk and tidy up project files.', dueDate: dayKey(new Date(Date.now() + 3 * 86400000)), priority: 'Low', completed: true, createdAt: Date.now() },
]

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : starterTasks
  } catch {
    return starterTasks
  }
}

function StatCard({ label, value, detail, icon: Icon, tone = 'slate' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task)
  return (
    <article className={`task-row ${task.completed ? 'is-complete' : ''}`}>
      <button className={`check-button ${task.completed ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={task.completed ? 'Mark as pending' : 'Mark complete'}>
        {task.completed ? <Check size={15} /> : <Circle size={17} />}
      </button>
      <div className="task-main">
        <div className="task-title-line">
          <h3>{task.title}</h3>
          <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
        </div>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={overdue ? 'overdue-text' : ''}>
            {overdue ? <AlertCircle size={13} /> : <CalendarDays size={13} />}
            {task.dueDate ? (overdue ? `Overdue · ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate, { month: 'short', day: 'numeric' })}`) : 'No due date'}
          </span>
          {task.completed && <span className="completed-label"><CheckCircle2 size={13} /> Completed</span>}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={15} /></button>
        <button onClick={() => onDelete(task.id)} aria-label="Delete task"><Trash2 size={15} /></button>
      </div>
    </article>
  )
}

function TaskModal({ task, initialDate, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? initialDate ?? todayISO())
  const [priority, setPriority] = useState(task?.priority ?? 'Medium')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Give your task a title before saving.')
      return
    }
    onSave({
      ...(task ?? {}),
      id: task?.id ?? makeId(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      completed: task?.completed ?? false,
      createdAt: task?.createdAt ?? Date.now(),
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="task-modal" onSubmit={submit}>
        <div className="modal-head">
          <div><span className="eyebrow">{task ? 'MAKE AN UPDATE' : 'ADD TO YOUR LIST'}</span><h2>{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        <label className="field-label">Task name <span className="required">*</span>
          <input autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError('') }} placeholder="e.g. Prepare project proposal" maxLength={100} />
        </label>
        <label className="field-label">Description <span className="optional">Optional</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a few details to help you get it done..." rows={3} maxLength={500} />
        </label>
        <div className="form-grid">
          <label className="field-label">Due date
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className="field-label">Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button primary">{task ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </div>
  )
}

function CalendarPanel({ tasks, month, setMonth, selectedDate, setSelectedDate, onAdd }) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate)
  const counts = tasks.reduce((acc, task) => {
    if (task.dueDate) acc[task.dueDate] = (acc[task.dueDate] || 0) + 1
    return acc
  }, {})
  return (
    <section className="panel calendar-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">PLAN YOUR MONTH</span><h2>Calendar</h2></div>
        <div className="calendar-controls">
          <button className="icon-button" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month"><ArrowLeft size={17} /></button>
          <strong>{monthLabel}</strong>
          <button className="icon-button" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month"><ArrowRight size={17} /></button>
        </div>
      </div>
      <div className="calendar-grid weekday-grid">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="calendar-grid date-grid">
        {cells.map((day, index) => {
          if (!day) return <div className="calendar-day empty" key={`empty-${index}`} />
          const date = dayKey(new Date(year, monthIndex, day))
          const count = counts[date] || 0
          const selected = selectedDate === date
          const today = todayISO() === date
          return (
            <button key={date} className={`calendar-day ${selected ? 'selected' : ''} ${today ? 'today' : ''}`} onClick={() => setSelectedDate(date)}>
              <span>{day}</span>
              {count > 0 && <i className={tasks.some(t => t.dueDate === date && !t.completed) ? 'has-pending' : 'all-done'}>{count}</i>}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend"><span><i className="legend-dot pending-dot" /> Has pending tasks</span><span><i className="legend-dot done-dot" /> All completed</span></div>
      <div className="selected-day">
        <div className="selected-day-head">
          <div><span className="eyebrow">SELECTED DAY</span><h3>{formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}</h3></div>
          <button className="text-button" onClick={() => onAdd(selectedDate)}><Plus size={15} /> Add task</button>
        </div>
        {selectedTasks.length ? selectedTasks.map(task => (
          <div className="mini-task" key={task.id}><span className={`mini-dot ${task.completed ? 'done' : ''}`} /><span className={task.completed ? 'muted-strike' : ''}>{task.title}</span><small>{task.completed ? 'Done' : 'Pending'}</small></div>
        )) : <p className="empty-note">Nothing scheduled for this day. Enjoy the breathing room.</p>}
      </div>
    </section>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayISO())

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks])

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length
    const pending = tasks.length - completed
    const overdue = tasks.filter(isOverdue).length
    const dueToday = tasks.filter(isDueToday).length
    return { total: tasks.length, completed, pending, overdue, dueToday, rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0 }
  }, [tasks])

  const visibleTasks = useMemo(() => tasks
    .filter(t => {
      if (filter === 'pending') return !t.completed
      if (filter === 'completed') return t.completed
      if (filter === 'overdue') return isOverdue(t)
      if (filter === 'due') return isDueToday(t)
      return true
    })
    .filter(t => `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }), [tasks, filter, search])

  const saveTask = (task) => {
    setTasks(current => current.some(t => t.id === task.id) ? current.map(t => t.id === task.id ? task : t) : [task, ...current])
    setModal(null)
    setSelectedDate(task.dueDate || todayISO())
    if (task.dueDate) {
      const d = dateFromISO(task.dueDate)
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    }
  }
  const toggleTask = (id) => setTasks(current => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  const deleteTask = (id) => setTasks(current => current.filter(t => t.id !== id))
  const filters = [
    { id: 'all', label: 'All tasks', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'due', label: 'Due today', count: stats.dueToday },
    { id: 'overdue', label: 'Overdue', count: stats.overdue },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={19} /></div><span>taskflow<span className="brand-period">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <button className="nav-item active" onClick={() => setFilter('all')}><LayoutDashboard size={18} /> Overview</button>
          <button className={`nav-item ${filter === 'all' ? '' : ''}`} onClick={() => { setFilter('all'); setSearch('') }}><ListTodo size={18} /> My tasks <span className="nav-count">{stats.pending}</span></button>
          <button className="nav-item" onClick={() => { setSelectedDate(todayISO()); setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' }) }}><CalendarDays size={18} /> Calendar</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card"><div className="focus-icon"><Target size={17} /></div><strong>Small steps add up.</strong><p>Keep showing up. Your progress is built one task at a time.</p><div className="focus-progress"><span style={{ width: `${stats.rate}%` }} /></div><small>{stats.rate}% completed</small></div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><small>Personal plan</small></div><Settings2 size={17} className="profile-settings" /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right"><span className="today-label"><CalendarCheck size={15} /> {formatDate(todayISO(), { weekday: 'short', month: 'short', day: 'numeric' })}</span><button className="button primary top-add" onClick={() => setModal({ mode: 'new', initialDate: todayISO() })}><Plus size={17} /> New task</button></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div><span className="eyebrow">YOUR PERSONAL DASHBOARD</span><h1>Make today count<span>.</span></h1><p>A clear view of what needs doing, what's done, and what's next.</p></div>
            <div className="welcome-illustration"><div className="illustration-ring"><ClipboardList size={30} /></div><div className="spark spark-one">✦</div><div className="spark spark-two">✧</div></div>
          </section>

          <section className="stats-grid">
            <StatCard label="Total tasks" value={stats.total} detail="Across your workspace" icon={ClipboardList} tone="violet" />
            <StatCard label="Completed" value={stats.completed} detail={`${stats.rate}% completion rate`} icon={CheckCircle2} tone="green" />
            <StatCard label="Pending" value={stats.pending} detail="Still on your list" icon={Clock3} tone="amber" />
            <StatCard label="Due today" value={stats.dueToday} detail={stats.overdue ? `${stats.overdue} overdue · needs attention` : 'On the schedule today'} icon={AlertCircle} tone="rose" />
          </section>

          <div className="content-grid">
            <section className="panel tasks-panel">
              <div className="panel-heading tasks-heading">
                <div><span className="eyebrow">STAY ON TOP OF IT</span><h2>Your tasks <span className="heading-count">{visibleTasks.length}</span></h2></div>
                <button className="button primary compact" onClick={() => setModal({ mode: 'new', initialDate: selectedDate })}><Plus size={16} /> Add task</button>
              </div>
              <div className="task-toolbar">
                <div className="filter-tabs">
                  {filters.map(item => <button key={item.id} className={filter === item.id ? 'filter-active' : ''} onClick={() => setFilter(item.id)}>{item.label}<span>{item.count}</span></button>)}
                </div>
                <div className="search-box"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." /></div>
              </div>
              <div className="task-list">
                {visibleTasks.length ? visibleTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleTask} onEdit={t => setModal({ mode: 'edit', task: t })} onDelete={deleteTask} />) : (
                  <div className="empty-state"><div className="empty-icon"><CheckCircle2 size={24} /></div><strong>{search ? 'No matching tasks' : 'All clear here'}</strong><p>{search ? 'Try a different search term.' : 'Nothing in this view right now. Add a task when you’re ready.'}</p>{!search && <button className="text-button" onClick={() => setModal({ mode: 'new', initialDate: todayISO() })}><Plus size={15} /> Create a task</button>}</div>
                )}
              </div>
              <div className="list-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><span><span className="footer-dot" /> Saved in this browser</span></div>
            </section>

            <div id="calendar"><CalendarPanel tasks={tasks} month={month} setMonth={setMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onAdd={(date) => setModal({ mode: 'new', initialDate: date })} /></div>
          </div>

          <section className="progress-panel">
            <div className="progress-copy"><div className="progress-icon"><Target size={19} /></div><div><span className="eyebrow">YOUR MOMENTUM</span><h2>You're making progress.</h2><p>{stats.completed} of {stats.total} tasks completed. Keep the momentum going.</p></div></div>
            <div className="progress-meter-wrap"><div className="progress-number">{stats.rate}<small>%</small></div><div className="progress-track"><span style={{ width: `${stats.rate}%` }} /></div><small className="progress-caption">Overall completion</small></div>
          </section>
          <footer className="page-footer">Made for focus, built for progress <span>·</span> Taskflow</footer>
        </div>
      </main>

      {modal && <TaskModal task={modal.task} initialDate={modal.initialDate} onClose={() => setModal(null)} onSave={saveTask} />}
    </div>
  )
}
