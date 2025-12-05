const apiBase = import.meta.env.VITE_API_BASE || '/api/v1'

function getToken(){ return localStorage.getItem('token') }
function setToken(t){ if(t) localStorage.setItem('token', t); else localStorage.removeItem('token') }
function getUser(){ const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null }
function setUser(u){ if(u) localStorage.setItem('user', JSON.stringify(u)); else localStorage.removeItem('user') }

async function request(path, opts={}){
  opts.headers = opts.headers || {}
  if(getToken()) opts.headers['Authorization'] = 'Bearer ' + getToken()
  const res = await fetch(apiBase + path, opts)
  const body = await res.json().catch(()=>null)
  if(!res.ok) throw body || {error:'Request failed'}
  return body
}

export const api = {
  get: (p) => request(p, {method:'GET'}),
  post: (p, b) => request(p, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(b)}),
  put: (p, b) => request(p, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(b)}),
  delete: (p) => request(p, {method:'DELETE'})
}

export { setToken, getToken, getUser, setUser }
