// ══ AUTH (local — passwords en USERS, sesión en localStorage) ══
function sbLogin(email, pass) {
  var u = USERS[email];
  if (!u || u.pass !== pass) throw new Error('Credenciales incorrectas');
  localStorage.setItem('nova_session', email);
}
function sbLogout() {
  localStorage.removeItem('nova_session');
}

// ── Función de entrada a la app ──────────────────────────
async function entrarApp(email) {
  var u = USERS[email]; if(!u) return;
  cu = {email:email, name:u.name, ini:u.ini, role:u.role, av:u.av};
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app-screen').style.display='block';
  document.body.classList.add('in-app');
  document.getElementById('sb-av').className='av '+u.av;
  document.getElementById('sb-av').textContent=u.ini;
  document.getElementById('sb-nm').textContent=u.name;
  document.getElementById('sb-rl').textContent=u.role==='junta'?'Junta directiva':'Miembro';
  document.getElementById('tb-badge').textContent=u.role==='junta'?'Junta directiva':'Miembro';
  document.getElementById('tb-badge').className='badge '+(u.role==='junta'?'bj':'bm');
  if(u.role==='junta')document.getElementById('nav-junta').style.display='block';
  var hcf=document.getElementById('hc-fecha');if(hcf)hcf.valueAsDate=new Date();
  updSelects();
  await cargarTodo();
  initRealtime();
  go('dashboard');
  var me=TEAM.find(function(t){return t.email===email;});
  if(me){
    var sorted=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;});
    var pos=sorted.findIndex(function(t){return t.email===email;})+1;
    document.getElementById('tb-rank').textContent='#'+pos+' · '+pts(me).total+' pts';
  }
}

function _volverLogin(){
  cu=null;
  document.getElementById('app-screen').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  document.body.classList.remove('in-app');
  document.getElementById('lerr').style.display='none';
  document.getElementById('nav-junta').style.display='none';
}

function logout(){
  Object.keys(charts).forEach(function(k){try{charts[k].destroy();}catch(e){}});charts={};
  sbLogout();
  _volverLogin();
}
