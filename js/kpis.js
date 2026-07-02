// ══ KPIs ══
var kpis = [];
var _kpisTab = 'kpis-registrar';

var _KPICFG = {
  bp:   {ico:'📚', lbl:'BookPoint',      col:'#534AB7', bg:'#EEEDFE'},
  obvs: {ico:'🏃', lbl:'OBVS',           col:'#1D9E75', bg:'#E1F5EE'},
  lp:   {ico:'🎓', lbl:'Learning Path',  col:'#EF9F27', bg:'#FAEEDA'}
};

function swKpiTab(id, el) {
  ['kpis-registrar','kpis-equipo','kpis-historial'].forEach(function(t){
    var e=document.getElementById(t);if(e)e.style.display='none';
  });
  var te=document.getElementById(id);if(te)te.style.display='block';
  document.querySelectorAll('#page-kpis .tab').forEach(function(t){t.classList.remove('on');});
  if(el)el.classList.add('on');
  _kpisTab=id;
  if(id==='kpis-registrar')renderMisKpis();
  if(id==='kpis-equipo')renderKpisEquipo();
  if(id==='kpis-historial')renderKpisHist();
}

function renderKpisPage() {
  var fEl=document.getElementById('kpi-fecha');if(fEl&&!fEl.value)fEl.valueAsDate=new Date();
  renderMisKpis();
  if(_kpisTab==='kpis-equipo')renderKpisEquipo();
  if(_kpisTab==='kpis-historial')renderKpisHist();
}

function renderMisKpis() {
  var el=document.getElementById('kpis-mis-totales');if(!el||!cu)return;
  var mis=kpis.filter(function(k){return k.email===cu.email;});
  var bpPts=mis.filter(function(k){return k.tipo==='bp';}).reduce(function(s,k){return s+k.puntos;},0);
  var bpLib=mis.filter(function(k){return k.tipo==='bp';}).length;
  var obvs=mis.filter(function(k){return k.tipo==='obvs';}).length;
  var lp=mis.filter(function(k){return k.tipo==='lp';}).length;
  el.innerHTML=[
    {lbl:'BP',val:bpPts+' pts',sub:bpLib+' libro'+(bpLib!==1?'s':''),ico:'📚',bg:'#EEEDFE',col:'#534AB7'},
    {lbl:'OBVS',val:obvs,sub:'visitas',ico:'🏃',bg:'#E1F5EE',col:'#1D9E75'},
    {lbl:'LP',val:lp,sub:'paths',ico:'🎓',bg:'#FAEEDA',col:'#EF9F27'}
  ].map(function(k){
    return '<div style="background:'+k.bg+';border-radius:var(--r);padding:.875rem;text-align:center">'
      +'<div style="font-size:22px">'+k.ico+'</div>'
      +'<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin:4px 0">'+k.lbl+'</div>'
      +'<div style="font-size:24px;font-weight:700;color:'+k.col+'">'+k.val+'</div>'
      +'<div style="font-size:10px;color:var(--text3)">'+k.sub+'</div>'
    +'</div>';
  }).join('');
}

function saveKpi(tipo, puntos) {
  if(!cu)return;
  var nota=(document.getElementById('kpi-nota')||{}).value||'';
  var fecha=(document.getElementById('kpi-fecha')||{}).value||new Date().toISOString().slice(0,10);
  var k={id:'local_'+Date.now(),email:cu.email,tipo:tipo,puntos:puntos||1,nota:nota.trim(),fecha:fecha,ts:Date.now()};
  DB.insertKpi({email:k.email,tipo:k.tipo,puntos:k.puntos,nota:k.nota,fecha:k.fecha,ts:k.ts})
    .then(function(data){if(data)k.id=data.id;});
  kpis.unshift(k);
  var notaEl=document.getElementById('kpi-nota');if(notaEl)notaEl.value='';
  renderMisKpis();
  if(_kpisTab==='kpis-historial')renderKpisHist();
  if(_kpisTab==='kpis-equipo')renderKpisEquipo();
}

function delKpi(id) {
  var idx=kpis.findIndex(function(k){return String(k.id)===String(id);});
  if(idx<0||!cu||kpis[idx].email!==cu.email)return;
  DB.deleteKpi(kpis[idx].id);
  kpis.splice(idx,1);
  renderMisKpis();
  if(_kpisTab==='kpis-historial')renderKpisHist();
  if(_kpisTab==='kpis-equipo')renderKpisEquipo();
}

function renderKpisEquipo() {
  var el=document.getElementById('kpis-equipo-list');if(!el)return;
  var rows=Object.keys(USERS).map(function(email){
    var u=USERS[email];
    var mis=kpis.filter(function(k){return k.email===email;});
    var bpPts=mis.filter(function(k){return k.tipo==='bp';}).reduce(function(s,k){return s+k.puntos;},0);
    var bpLib=mis.filter(function(k){return k.tipo==='bp';}).length;
    var obvs=mis.filter(function(k){return k.tipo==='obvs';}).length;
    var lp=mis.filter(function(k){return k.tipo==='lp';}).length;
    return {u:u,bpPts:bpPts,bpLib:bpLib,obvs:obvs,lp:lp,total:bpPts+obvs+lp};
  }).sort(function(a,b){return b.total-a.total;});
  // header
  var hdr='<div style="display:grid;grid-template-columns:auto 1fr repeat(3,56px);gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);margin-bottom:4px">'
    +'<div></div><div style="font-size:10px;font-weight:600;color:var(--text3)">PERSONA</div>'
    +'<div style="font-size:10px;font-weight:600;color:#534AB7;text-align:center">BP</div>'
    +'<div style="font-size:10px;font-weight:600;color:#1D9E75;text-align:center">OBVS</div>'
    +'<div style="font-size:10px;font-weight:600;color:#EF9F27;text-align:center">LP</div>'
  +'</div>';
  el.innerHTML=hdr+rows.map(function(r,i){
    return '<div style="display:grid;grid-template-columns:auto 1fr repeat(3,56px);gap:8px;align-items:center;padding:.625rem 0;border-bottom:1px solid var(--border)">'
      +'<div style="font-size:13px;font-weight:700;color:var(--text3);width:18px;text-align:center">'+(i+1)+'</div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
        +'<div class="av '+r.u.av+'" style="width:28px;height:28px;font-size:10px;flex-shrink:0">'+r.u.ini+'</div>'
        +'<span style="font-size:13px;font-weight:600">'+r.u.name+'</span>'
      +'</div>'
      +'<div style="text-align:center"><div style="font-size:15px;font-weight:700;color:#534AB7">'+r.bpPts+'</div>'
        +'<div style="font-size:10px;color:var(--text3)">'+r.bpLib+' lib.</div></div>'
      +'<div style="text-align:center;font-size:15px;font-weight:700;color:#1D9E75">'+r.obvs+'</div>'
      +'<div style="text-align:center;font-size:15px;font-weight:700;color:#EF9F27">'+r.lp+'</div>'
    +'</div>';
  }).join('');
}

function renderKpisHist() {
  var el=document.getElementById('kpis-hist-list');if(!el||!cu)return;
  var mis=kpis.filter(function(k){return k.email===cu.email;}).slice(0,40);
  if(!mis.length){el.innerHTML='<div class="empty">📊<p>Aún no has registrado ningún KPI</p></div>';return;}
  el.innerHTML=mis.map(function(k){
    var tc=_KPICFG[k.tipo]||{ico:'📌',lbl:k.tipo,col:'var(--text)',bg:'var(--bg2)'};
    var ptslbl=k.tipo==='bp'?' · '+k.puntos+' pt'+(k.puntos>1?'s':''):'';
    return '<div style="display:flex;align-items:center;gap:10px;padding:.625rem 0;border-bottom:1px solid var(--border)">'
      +'<div style="width:32px;height:32px;border-radius:var(--r);background:'+tc.bg+';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">'+tc.ico+'</div>'
      +'<div style="flex:1">'
        +'<div style="font-size:13px;font-weight:600;color:'+tc.col+'">'+tc.lbl+ptslbl+'</div>'
        +(k.nota?'<div style="font-size:12px;color:var(--text2)">'+k.nota+'</div>':'')
        +'<div style="font-size:11px;color:var(--text3)">'+k.fecha+'</div>'
      +'</div>'
      +'<button onclick="delKpi(\''+k.id+'\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px" title="Eliminar">✕</button>'
    +'</div>';
  }).join('');
}
