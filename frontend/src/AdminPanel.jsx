import React, {useEffect, useState} from 'react'
import {api} from './api'

export default function AdminPanel(){
  const [users, setUsers] = useState([])
  const [userTasks, setUserTasks] = useState({})
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)

  useEffect(()=>{ fetchUsers() }, [])

  async function fetchUsers(){
    try{ 
      const res = await api.get('/auth/users'); 
      setUsers(res);
      // Fetch tasks for all users
      const tasksMap = {}
      for(const user of res){
        try{
          const tasks = await api.get(`/tasks/user/${user._id}`)
          tasksMap[user._id] = tasks
        }catch(e){ tasksMap[user._id] = [] }
      }
      setUserTasks(tasksMap)
    }catch(e){ console.error(e); alert(JSON.stringify(e)) }
  }

  async function createForUser(user){
    if(!title.trim()) return alert('Enter task title')
    try{ 
      await api.post('/tasks', {title, description: desc, user: user._id})
      setTitle(''); 
      setDesc('');
      // Refresh tasks for this user
      const tasks = await api.get(`/tasks/user/${user._id}`)
      setUserTasks({...userTasks, [user._id]: tasks})
    }catch(e){ alert(JSON.stringify(e)) }
  }

  async function delTask(userId, taskId){ 
    if(!confirm('Delete?')) return
    try{ 
      await api.delete('/tasks/'+taskId)
      const tasks = await api.get(`/tasks/user/${userId}`)
      setUserTasks({...userTasks, [userId]: tasks})
    }catch(e){alert(JSON.stringify(e))} 
  }

  async function editTask(userId, t){ 
    const newTitle = prompt('Title', t.title)
    if(newTitle==null) return
    const newDesc = prompt('Description', t.description||'')
    try{ 
      await api.put('/tasks/'+t._id, {title:newTitle, description:newDesc})
      const tasks = await api.get(`/tasks/user/${userId}`)
      setUserTasks({...userTasks, [userId]: tasks})
    }catch(e){alert(JSON.stringify(e))} 
  }

  return (
    <div style={{marginTop:28}}>
      <div style={{borderTop:'2px solid var(--border)',paddingTop:20}}>
        <h2 style={{background:'linear-gradient(135deg, #a78bfa, #8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>👨‍💼 Admin Dashboard</h2>
        <p style={{color:'var(--muted)',marginTop:4}}>Manage users and their tasks</p>
      </div>

      <div style={{maxWidth:'100%'}}>
        {users.length === 0 ? (
          <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>
            No users found
          </div>
        ) : (
          users.map(u=> (
            <div key={u._id} style={{marginBottom:16,border:'1px solid var(--border)',borderRadius:8,overflow:'hidden',backgroundColor:'var(--card)',transition:'all 0.2s ease'}}>
              {/* User Header */}
              <div 
                style={{
                  padding:16,
                  backgroundColor:'rgba(59, 130, 246, 0.05)',
                  borderBottom:expandedUser===u._id ? '1px solid var(--border)' : 'none',
                  cursor:'pointer',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  transition:'all 0.2s ease'
                }} 
                onClick={()=>setExpandedUser(expandedUser===u._id ? null : u._id)}
                onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='rgba(59, 130, 246, 0.05)'}
              >
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:20}}>👤</span>
                    <div>
                      <strong style={{fontSize:16,display:'block'}}>{u.name||u.email}</strong>
                      <div className="muted" style={{fontSize:12,marginTop:4}}>{u.email}</div>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span className={`badge ${u.role}`}>{u.role}</span>
                  <span style={{fontSize:18,transition:'transform 0.2s ease',transform:expandedUser===u._id ? 'rotate(180deg)' : 'rotate(0deg)'}}>{expandedUser===u._id ? '▼' : '▶'}</span>
                </div>
              </div>

              {/* Tasks Section (Expanded) */}
              {expandedUser === u._id && (
                <div style={{padding:16,backgroundColor:'var(--card)',borderTop:'1px solid var(--border)'}}>
                  {/* Create Task Form */}
                  <div style={{marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
                    <h4 style={{margin:'0 0 12px 0',display:'flex',alignItems:'center',gap:6}}>➕ Assign Task to {u.name}</h4>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'stretch'}}>
                      <input placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} style={{flex:'1 1 200px',margin:0}} />
                      <input placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} style={{flex:'1 1 200px',margin:0}} />
                      <button onClick={()=>createForUser(u)} style={{padding:'12px 18px',margin:0,whiteSpace:'nowrap'}}>Create Task</button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div>
                    <h4 style={{margin:'0 0 12px 0',display:'flex',alignItems:'center',gap:6}}>
                      📋 Tasks 
                      <span style={{fontSize:12,background:'var(--accent)',padding:'2px 8px',borderRadius:20,marginLeft:'auto'}}>
                        {(userTasks[u._id]||[]).length}
                      </span>
                    </h4>
                    {(userTasks[u._id]||[]).length === 0 ? (
                      <div style={{padding:16,textAlign:'center',color:'var(--muted)',backgroundColor:'rgba(148, 163, 184, 0.05)',borderRadius:6}}>
                        ✨ No tasks assigned yet
                      </div>
                    ) : (
                      <ul style={{listStyle:'none',padding:0,margin:0}}>
                        {(userTasks[u._id]||[]).map(t=> (
                          <li key={t._id} style={{padding:12,border:'1px solid var(--border)',marginBottom:10,borderRadius:6,display:'flex',justifyContent:'space-between',alignItems:'center',backgroundColor:'rgba(148, 163, 184, 0.02)',transition:'all 0.2s ease',cursor:'default'}} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='rgba(59, 130, 246, 0.05)'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='rgba(148, 163, 184, 0.02)'}>
                            <div style={{flex:1}}>
                              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                                {t.completed ? '✅' : '⭕'}
                                <strong style={{color:t.completed ? 'var(--muted)' : 'var(--text)',textDecoration:t.completed ? 'line-through' : 'none'}}>{t.title}</strong>
                              </div>
                              {t.description && <div className="muted" style={{fontSize:12,marginLeft:24}}>{t.description}</div>}
                              <div style={{fontSize:11,color:'var(--muted)',marginLeft:24,marginTop:4}}>{t.completed ? '✓ Completed' : '⏱️ Pending'}</div>
                            </div>
                            <div style={{display:'flex',gap:6}}>
                              <button onClick={()=>editTask(u._id, t)} style={{padding:'6px 10px',fontSize:12,margin:0}}>✏️ Edit</button>
                              <button onClick={()=>delTask(u._id, t._id)} style={{padding:'6px 10px',fontSize:12,margin:0,background:'var(--danger)'}}>🗑️ Delete</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
