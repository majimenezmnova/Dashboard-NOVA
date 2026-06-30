// ══ INIT — carga al final, cuando todos los demás scripts están definidos ══

// LOGIN
document.getElementById('lbtn').onclick=async function(){
  var email=document.getElementById('lemail').value.trim().toLowerCase();
  var pass=document.getElementById('lpass').value;
  var lerr=document.getElementById('lerr');
  var lbtn=document.getElementById('lbtn');
  lbtn.disabled=true; lbtn.textContent='Entrando...';
  try {
    sbLogin(email, pass);
    await entrarApp(email);
  } catch(e) {
    if(lerr)lerr.style.display='flex';
    lbtn.disabled=false; lbtn.innerHTML='→ Entrar';
  }
};

// Recuperar sesión al recargar
(async function(){
  var email = localStorage.getItem('nova_session');
  if(email && USERS[email]) await entrarApp(email);
})();

document.addEventListener('keydown',function(e){if(e.key==='Enter'&&document.getElementById('login-screen').style.display!=='none')document.getElementById('lbtn').click();});

// allReportes: array global con todos los reportes de todos los miembros
if(!window.allReportes) window.allReportes = [];

if(typeof ResizeObserver!=='undefined'){
  var obs=new ResizeObserver(function(){if(document.getElementById('page-dashboard').classList.contains('on')){renderCharts();renderRacha();}});
  var mc=document.getElementById('main-cnt');if(mc)obs.observe(mc);
}

// INIT
window.addEventListener('DOMContentLoaded',function(){
  var pl=document.getElementById('per-lbl');if(pl)pl.textContent=getPer();
});
