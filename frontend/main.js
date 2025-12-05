const apiBase = '/api';

function el(id){return document.getElementById(id)}
function showMsg(msg, ok=true){const m=el('messages');m.textContent=msg;m.style.color=ok?"#080":"#b00";setTimeout(()=>m.textContent='',4000)}

function token(){return localStorage.getItem('token')}
function setToken(t){if(t) localStorage.setItem('token', t); else localStorage.removeItem('token')}

async function request(path, opts={}){
  opts.headers = opts.headers || {};
  if(token()) opts.headers['Authorization'] = 'Bearer '+token();
  const res = await fetch(apiBase+path, opts);
  const body = await res.json().catch(()=>null);
  if(!res.ok) throw body || {error:'Request failed'};
  return body;
}

async function register(){
  const name = el('reg-name').value;
  const email = el('reg-email').value;
  const password = el('reg-password').value;
  try{
    const data = await request('/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,email,password})});
    setToken(data.token);
    showApp();
    showMsg('Registered and logged in.');
  }catch(e){showMsg(JSON.stringify(e), false)}
}

async function login(){
  const email = el('login-email').value;
  const password = el('login-password').value;
  try{
    const data = await request('/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})});
    setToken(data.token);
    showApp();
    showMsg('Logged in.');
  }catch(e){showMsg(JSON.stringify(e), false)}
}

function logout(){ setToken(null); showAuth(); }

async function fetchTasks(){
  try{
    const tasks = await request('/tasks');
    const ul = el('tasks'); ul.innerHTML='';
    tasks.forEach(t=>{
      const li = document.createElement('li'); li.className='task';
      const left = document.createElement('div'); left.className='left';
      left.innerHTML = `<strong>${escapeHtml(t.title)}</strong><div>${escapeHtml(t.description||'')}</div>`;
      const actions = document.createElement('div'); actions.className='actions';
      const toggle = document.createElement('button'); toggle.textContent = t.completed? 'Mark Open':'Mark Done';
      toggle.onclick = async ()=>{
        try{ await request('/tasks/'+t._id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({completed: !t.completed})}); fetchTasks(); }
        catch(e){showMsg(JSON.stringify(e), false)}
      };
      const del = document.createElement('button'); del.textContent='Delete'; del.onclick=async ()=>{ if(!confirm('Delete?')) return; try{ await request('/tasks/'+t._id, {method:'DELETE'}); fetchTasks(); }catch(e){showMsg(JSON.stringify(e), false)} };
      actions.appendChild(toggle); actions.appendChild(del);
      li.appendChild(left); li.appendChild(actions); ul.appendChild(li);
    });
  }catch(e){showMsg(JSON.stringify(e), false)}
}

async function createTask(){
  const title = el('new-title').value; const description = el('new-desc').value;
  if(!title){ showMsg('Title required', false); return; }
  try{ await request('/tasks', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title,description})}); el('new-title').value=''; el('new-desc').value=''; fetchTasks(); }
  catch(e){showMsg(JSON.stringify(e), false)}
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

function showApp(){ el('auth').classList.add('hidden'); el('app').classList.remove('hidden'); el('user-id').textContent = token()? 'authenticated':'-'; fetchTasks(); }
function showAuth(){ el('auth').classList.remove('hidden'); el('app').classList.add('hidden'); }

// event bindings
el('btn-register').onclick = register;
el('btn-login').onclick = login;
el('btn-logout').onclick = ()=>{ logout(); showMsg('Logged out'); };
el('btn-create').onclick = createTask;

// init
if(token()) showApp(); else showAuth();
