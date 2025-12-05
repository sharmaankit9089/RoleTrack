import React, {useState, useEffect} from 'react'
import {api, setToken, getToken, getUser, setUser} from './api'
import AdminPanel from './AdminPanel'

export default function App(){
  const [view, setView] = useState(getToken() || getUser() ? 'app' : 'auth')
  const [tasks, setTasks] = useState([])
  const [user, setUserState] = useState(getUser())
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ if(view==='app') fetchTasks() }, [view])

  useEffect(()=>{

    if(getToken() && getUser()){
      setView('app')
      setUserState(getUser())
    }
  }, [])

  async function fetchTasks(all = false){
    setLoading(true)
    try{
      const path = all ? '/tasks?all=true' : '/tasks'
      const res = await api.get(path);
      setTasks(res);
    } catch(e){ console.error(e); alert(JSON.stringify(e)) }
    setLoading(false)
  }

  return (
    <div className="container">
      {view==='auth' ? <Auth onLogin={()=>setView('app')} /> : <>
        <Main onLogout={()=>{ setToken(null); setView('auth')}} tasks={tasks} reload={fetchTasks} loading={loading} />
        {getUser()?.role === 'admin' && <AdminPanel />}
      </>}
    </div>
  )
}

function Auth({onLogin}){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loginRole, setLoginRole] = useState('user')

  const [adminRegister, setAdminRegister] = useState(false)
  const [adminCode, setAdminCode] = useState('')

  async function register(){
    try{
      const body = {name,email,password};
      if(adminRegister) body.role = 'admin', body.adminCode = adminCode;
      const res = await api.post('/auth/register', body);
      setToken(res.token);
      setUser(res.user);
      onLogin();
    }catch(e){ alert(JSON.stringify(e)) }
  }
  
  async function login(){
    try{
      const res = await api.post('/auth/login',{email,password});
      setToken(res.token);
      setUser(res.user);
      if(res.user.role !== loginRole){
        alert(`Note: This account is registered as ${res.user.role}, not ${loginRole}`);
      }
      onLogin();
    }catch(e){ alert(JSON.stringify(e)) }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',padding:'20px'}}>
      <div className="auth-card">
        <div style={{textAlign:'center',marginBottom:28}}>
          <h2 style={{background:'linear-gradient(135deg, #3b82f6, #8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:'0 0 8px 0'}}>RoleTrack</h2>
          <p style={{color:'var(--muted)',margin:0}}>Organize your work efficiently</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={mode==='login' ? 'active' : ''}
            onClick={()=>setMode('login')}
          >Login</button>
          <button 
            className={mode==='register' ? 'active' : ''}
            onClick={()=>setMode('register')}
          >Register</button>
        </div>

        {mode === 'login' ? (
          <div>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',color:'var(--text)',fontSize:13,fontWeight:600,marginBottom:10}}>Login as:</label>
              <div style={{display:'flex',gap:10}}>
                <button 
                  className={loginRole==='user' ? 'active' : ''}
                  onClick={()=>setLoginRole('user')}
                  style={{flex:1,margin:0,marginRight:0,background:loginRole==='user'?'var(--accent)':'#475569'}}
                >👤 User</button>
                <button 
                  className={loginRole==='admin' ? 'active' : ''}
                  onClick={()=>setLoginRole('admin')}
                  style={{flex:1,margin:0,background:loginRole==='admin'?'var(--accent)':'#475569'}}
                >👨‍💼 Admin</button>
              </div>
            </div>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button onClick={login} style={{width:'100%',marginTop:16}}>Sign In as {loginRole}</button>
          </div>
        ) : (
          <div>
            <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <div style={{marginTop:12,padding:12,background:'rgba(59, 130, 246, 0.1)',border:'1px solid rgba(59, 130, 246, 0.3)',borderRadius:8,fontSize:13,color:'var(--muted)'}}>
              ℹ️ Admin users are created by administrators. Contact them to gain admin access.
            </div>
            <button onClick={register} style={{width:'100%',marginTop:16}}>Create Account</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Main({onLogout, tasks, reload, loading}){
  const [showAll, setShowAll] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')

  async function create(){
    try{ await api.post('/tasks', {title, description: desc}); setTitle(''); setDesc(''); reload(); }
    catch(e){ alert(JSON.stringify(e)) }
  }

  async function toggle(t){
    try{ await api.put('/tasks/'+t._id, {completed: !t.completed}); reload(); }
    catch(e){ alert(JSON.stringify(e)) }
  }

  async function del(t){ if(!confirm('Delete?')) return; try{ await api.delete('/tasks/'+t._id); reload(); }catch(e){alert(JSON.stringify(e))} }

  function startEdit(t){
    setEditId(t._id);
    setEditTitle(t.title || '');
    setEditDesc(t.description || '');
  }

  async function saveEdit(){
    if(!editId) return;
    try{
      await api.put('/tasks/'+editId, {title: editTitle, description: editDesc});
      setEditId(null); setEditTitle(''); setEditDesc('');
      reload();
    }catch(e){ alert(JSON.stringify(e)) }
  }

  function cancelEdit(){ setEditId(null); setEditTitle(''); setEditDesc('') }

  const storedUser = getUser();

  return (
    <div>
      {/* Header */}
      <div className="user-info">
        <div>
          <span style={{marginRight:12}}>Welcome, <strong>{storedUser?.name || storedUser?.email}</strong></span>
          <span className={`badge ${storedUser?.role}`}>{storedUser?.role}</span>
        </div>
        <button className="secondary" onClick={()=>{ setUser(null); onLogout() }}>Logout</button>
      </div>

      {/* Admin Toggle */}
      {storedUser?.role === 'admin' && (
        <div style={{marginTop:16,padding:12,background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,display:'flex',alignItems:'center',gap:12}}>
          <input type="checkbox" checked={showAll} onChange={(e)=>{ setShowAll(e.target.checked); reload(e.target.checked) }} style={{width:'auto',margin:0}} />
          <label style={{margin:0,cursor:'pointer',flex:1}}>Show all tasks (admin view)</label>
        </div>
      )}

      {/* Create Task Form */}
      <div style={{marginTop:20,background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:16}}>
        <h3 style={{marginTop:0}}>➕ Add New Task</h3>
        <div className="form-row">
          <input placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} style={{flex:1}} />
          <input placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} style={{flex:1}} />
          <button onClick={create} style={{whiteSpace:'nowrap'}}>Create</button>
        </div>
      </div>

      {/* Tasks List */}
      <div style={{marginTop:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0}}>📋 {showAll ? 'All Tasks' : 'Your Tasks'}</h3>
          <span style={{color:'var(--muted)',fontSize:14}}>{tasks.length} task{tasks.length!==1?'s':''}</span>
        </div>

        {loading ? (
          <div className="loading">⏳ Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{textAlign:'center',padding:32,color:'var(--muted)'}}>✨ No tasks yet. Create one to get started!</div>
        ) : (
          <ul>
            {tasks.map(t=> (
              <li key={t._id} className={`task ${t.completed ? 'completed' : ''}`}>
                <div style={{flex:1}}>
                  {editId === t._id ? (
                    <div style={{display:'flex',gap:8,flex:1}}>
                      <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{flex:1}} />
                      <input value={editDesc} onChange={e=>setEditDesc(e.target.value)} style={{flex:1}} />
                    </div>
                  ) : (
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        {t.completed ? '✓' : '○'}
                        <strong>{t.title}</strong>
                      </div>
                      {t.description && <div className="task-desc">→ {t.description}</div>}
                      <div className="task-status">{t.completed ? '✓ Completed' : '⏱️ Pending'}</div>
                    </div>
                  )}
                </div>
                <div className="task-actions">
                  {editId === t._id ? (
                    <>
                      <button onClick={saveEdit}>💾 Save</button>
                      <button className="secondary" onClick={cancelEdit}>✕ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>toggle(t)} title={t.completed ? 'Reopen' : 'Mark done'}>{t.completed ? '↩️ Open' : '✓ Done'}</button>
                      <button onClick={()=>startEdit(t)} title="Edit">✏️ Edit</button>
                      <button className="danger" onClick={()=>del(t)} title="Delete">🗑️ Delete</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
