// ══ KPIs ══
var kpis = [];
var _kpisTab = 'kpis-general';
var _kpiCharts = {};

var _METAS = {bp:66, lp:18, fac:15000, ben:7500};
var _KPICFG = {
  bp:   {ico:'📚', lbl:'BookPoints',     col:'#534AB7', bg:'#EEEDFE'},
  obvs: {ico:'🏃', lbl:'OBVS',           col:'#1D9E75', bg:'#E1F5EE'},
  lp:   {ico:'🎓', lbl:'Learning Paths', col:'#EF9F27', bg:'#FAEEDA'}
};

var _KPI_TABS = ['kpis-general','kpis-equipo','kpis-analisis','kpis-mis'];

function swKpiTab(id, el) {
  _KPI_TABS.forEach(function(t){
    var e=document.getElementById(t);if(e)e.style.display='none';
  });
  var te=document.getElementById(id);if(te)te.style.display='block';
  document.querySelectorAll('#page-kpis .tab').forEach(function(t){t.classList.remove('on');});
  if(el)el.classList.add('on');
  _kpisTab=id;
  if(id==='kpis-general')renderKpisGeneral();
  if(id==='kpis-equipo')renderKpisEquipo();
  if(id==='kpis-analisis')setTimeout(renderKpisAnalisis,80);
  if(id==='kpis-mis'){renderMisKpis();renderKpisHist();}
}

function renderKpisPage() {
  var fEl=document.getElementById('kpi-fecha');if(fEl&&!fEl.value)fEl.valueAsDate=new Date();
  if(_kpisTab==='kpis-general')renderKpisGeneral();
  else if(_kpisTab==='kpis-equipo')renderKpisEquipo();
  else if(_kpisTab==='kpis-analisis')setTimeout(renderKpisAnalisis,80);
  else if(_kpisTab==='kpis-mis'){renderMisKpis();renderKpisHist();}
}

// Calcula KPIs de una persona (bp, lp, obvs + fac/ben desde movimientos)
function _getKpis(email) {
  var mis=kpis.filter(function(k){return k.email===email;});
  var bp=mis.filter(function(k){return k.tipo==='bp';}).reduce(function(s,k){return s+k.puntos;},0);
  var bpLib=mis.filter(function(k){return k.tipo==='bp';}).length;
  var obvs=mis.filter(function(k){return k.tipo==='obvs';}).length;
  var lp=mis.filter(function(k){return k.tipo==='lp';}).length;
  var fac=0, ben=0;
  (window.movimientos||[]).forEach(function(m){
    if(!m.personas||!m.personas.length||m.personas.indexOf(email)<0)return;
    var share=m.importe/m.personas.length;
    if(m.tipo==='ingreso'){fac+=share;ben+=share;}
    else if(m.tipo==='gasto'&&m.categoria!=='Operativo'){ben-=share;}
  });
  return {bp:bp,bpLib:bpLib,obvs:obvs,lp:lp,fac:fac,ben:ben};
}

// Barra de progreso
function _pbar(val, meta, col) {
  var pct=Math.min(100,Math.round(val/meta*100));
  var c=pct>=100?'#1D9E75':pct>=60?col:pct>=30?'#EF9F27':'#E24B4A';
  return {pct:pct,col:c,bar:'<div style="background:var(--bg2);border-radius:4px;height:8px;overflow:hidden;margin-top:6px">'
    +'<div style="width:'+pct+'%;height:100%;background:'+c+';border-radius:4px;transition:width .6s"></div></div>'};
}

// ── TAB GENERAL: progreso global del equipo ──
function renderKpisGeneral() {
  var el=document.getElementById('kpis-general-content');if(!el)return;
  var emails=Object.keys(USERS);
  var n=emails.length||1;
  var tot={bp:0,lp:0,fac:0,ben:0,obvs:0};
  emails.forEach(function(e){var d=_getKpis(e);tot.bp+=d.bp;tot.lp+=d.lp;tot.fac+=d.fac;tot.ben+=d.ben;tot.obvs+=d.obvs;});

  var metaTot={bp:n*_METAS.bp, lp:n*_METAS.lp, fac:n*_METAS.fac, ben:n*_METAS.ben};
  var fmt=function(v){return v>=1000?(v/1000).toFixed(1)+'K€':Math.round(v)+'€';};

  var items=[
    {ico:'📚',lbl:'BookPoints',val:tot.bp,meta:metaTot.bp,col:'#534AB7',vf:tot.bp+' pts',mf:metaTot.bp+' pts'},
    {ico:'🎓',lbl:'Learning Paths',val:tot.lp,meta:metaTot.lp,col:'#EF9F27',vf:tot.lp+'',mf:metaTot.lp+''},
    {ico:'💶',lbl:'Facturación',val:tot.fac,meta:metaTot.fac,col:'#1D9E75',vf:fmt(tot.fac),mf:fmt(metaTot.fac)},
    {ico:'📈',lbl:'Beneficio',val:tot.ben,meta:metaTot.ben,col:'#534AB7',vf:fmt(tot.ben),mf:fmt(metaTot.ben)},
    {ico:'🏃',lbl:'OBVS',val:tot.obvs,meta:0,col:'#1D9E75',vf:tot.obvs+' visitas',mf:''}
  ];

  var html='<div class="card" style="margin-bottom:10px">'
    +'<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.875rem">Progreso del equipo · '+n+' personas</div>';

  html+=items.map(function(k){
    var pb=k.meta>0?_pbar(k.val,k.meta,k.col):null;
    var col=pb?pb.col:k.col;
    return '<div style="margin-bottom:1rem">'
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px">'
        +'<div style="font-size:13px;font-weight:600;color:var(--text)">'+k.ico+' '+k.lbl+'</div>'
        +'<div style="font-size:12px;color:var(--text2)">'
          +'<span style="font-weight:700;color:'+col+'">'+k.vf+'</span>'
          +(k.mf?' <span style="color:var(--text3)">/ '+k.mf+'</span>':'')
        +'</div>'
      +'</div>'
      +(pb?pb.bar+' <div style="font-size:10px;color:'+pb.col+';text-align:right;margin-top:2px">'+pb.pct+'%</div>':'')
    +'</div>';
  }).join('');
  html+='</div>';

  // Aportación por persona (mini cards)
  html+='<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;padding:0 2px">Aportación individual</div>';
  html+=emails.map(function(e){
    var d=_getKpis(e);var u=USERS[e];
    var pbBP=_pbar(d.bp,_METAS.bp,'#534AB7');
    var pbLP=_pbar(d.lp,_METAS.lp,'#EF9F27');
    var pbFac=_pbar(d.fac,_METAS.fac,'#1D9E75');
    var pbBen=_pbar(d.ben,_METAS.ben,'#534AB7');
    return '<div class="card" style="margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:.75rem">'
        +'<div class="av '+u.av+'" style="width:28px;height:28px;font-size:10px;flex-shrink:0">'+u.ini+'</div>'
        +'<div style="font-weight:700;font-size:13px">'+u.name+'</div>'
        +'<div style="margin-left:auto;font-size:11px;color:var(--text3)">🏃 '+d.obvs+' OBVS</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +[
        {lbl:'BP',vf:d.bp+' pts',pb:pbBP},
        {lbl:'LP',vf:d.lp+'',pb:pbLP},
        {lbl:'Factur.',vf:d.fac>=1000?(d.fac/1000).toFixed(1)+'K€':Math.round(d.fac)+'€',pb:pbFac},
        {lbl:'Benef.',vf:d.ben>=1000?(d.ben/1000).toFixed(1)+'K€':Math.round(d.ben)+'€',pb:pbBen}
      ].map(function(k){
        return '<div>'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:2px">'
            +'<span style="font-size:11px;color:var(--text3)">'+k.lbl+'</span>'
            +'<span style="font-size:12px;font-weight:700;color:'+k.pb.col+'">'+k.vf+'</span>'
          +'</div>'
          +k.pb.bar
        +'</div>';
      }).join('')
      +'</div></div>';
  }).join('');

  el.innerHTML=html;
}

// ── TAB MIS KPIs: totales personales ──
function renderMisKpis() {
  var el=document.getElementById('kpis-mis-totales');if(!el||!cu)return;
  var d=_getKpis(cu.email);
  var fmt=function(n){return n>=1000?(n/1000).toFixed(1)+'K€':Math.round(n)+'€';};

  var cards=[
    {lbl:'BookPoints',ico:'📚',val:d.bp,meta:_METAS.bp,col:'#534AB7',vf:d.bp+' pts',sub:d.bpLib+' libro'+(d.bpLib!==1?'s':'')},
    {lbl:'Learning Paths',ico:'🎓',val:d.lp,meta:_METAS.lp,col:'#EF9F27',vf:d.lp+'',sub:'meta: '+_METAS.lp},
    {lbl:'Facturación',ico:'💶',val:d.fac,meta:_METAS.fac,col:'#1D9E75',vf:fmt(d.fac),sub:'meta: '+fmt(_METAS.fac)},
    {lbl:'Beneficio',ico:'📈',val:d.ben,meta:_METAS.ben,col:'#534AB7',vf:fmt(d.ben),sub:'meta: '+fmt(_METAS.ben)},
    {lbl:'OBVS',ico:'🏃',val:d.obvs,meta:0,col:'#1D9E75',vf:d.obvs+'',sub:'visitas'}
  ];

  el.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'
    +cards.map(function(k){
      var pb=k.meta>0?_pbar(k.val,k.meta,k.col):null;
      return '<div class="card" style="margin-bottom:0">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
          +'<div style="font-size:12px;font-weight:600;color:var(--text2)">'+k.ico+' '+k.lbl+'</div>'
          +(pb?'<div style="font-size:11px;font-weight:700;color:'+pb.col+'">'+pb.pct+'%</div>':'')
        +'</div>'
        +'<div style="font-size:24px;font-weight:700;color:'+(pb?pb.col:k.col)+'">'+k.vf+'</div>'
        +'<div style="font-size:11px;color:var(--text3)">'+k.sub+'</div>'
        +(pb?pb.bar:'')
      +'</div>';
    }).join('')
  +'</div>';
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
  renderKpisPage();
}

function delKpi(id) {
  var idx=kpis.findIndex(function(k){return String(k.id)===String(id);});
  if(idx<0||!cu||kpis[idx].email!==cu.email)return;
  DB.deleteKpi(kpis[idx].id);
  kpis.splice(idx,1);
  renderKpisPage();
}

// ── TAB EQUIPO: desglose por persona ──
function renderKpisEquipo() {
  var el=document.getElementById('kpis-equipo-list');if(!el)return;
  var emails=Object.keys(USERS);
  var fmt=function(n){return n>=1000?(n/1000).toFixed(1)+'K€':Math.round(n)+'€';};

  var html=emails.map(function(e){
    var d=_getKpis(e);var u=USERS[e];
    var items=[
      {lbl:'BP',    val:d.bp,  meta:_METAS.bp,  col:'#534AB7', vf:d.bp+' pts'},
      {lbl:'LP',    val:d.lp,  meta:_METAS.lp,  col:'#EF9F27', vf:d.lp+''},
      {lbl:'Fac.',  val:d.fac, meta:_METAS.fac, col:'#1D9E75', vf:fmt(d.fac)},
      {lbl:'Ben.',  val:d.ben, meta:_METAS.ben,  col:'#534AB7', vf:fmt(d.ben)},
      {lbl:'OBVS',  val:d.obvs,meta:0,           col:'#1D9E75', vf:d.obvs+''}
    ];
    return '<div class="card" style="margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:.875rem">'
        +'<div class="av '+u.av+'" style="width:32px;height:32px;font-size:11px;flex-shrink:0">'+u.ini+'</div>'
        +'<div style="font-weight:700;font-size:14px">'+u.name+'</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">'
      +items.map(function(k){
        var pb=k.meta>0?_pbar(k.val,k.meta,k.col):null;
        var col=pb?pb.col:k.col;
        return '<div style="text-align:center">'
          +'<div style="font-size:10px;font-weight:600;color:var(--text3);margin-bottom:2px">'+k.lbl+'</div>'
          +'<div style="font-size:14px;font-weight:700;color:'+col+'">'+k.vf+'</div>'
          +(pb?'<div style="font-size:10px;color:'+pb.col+'">'+pb.pct+'%</div>':'')
          +(pb?'<div style="background:var(--bg2);border-radius:3px;height:4px;overflow:hidden;margin-top:2px">'
            +'<div style="width:'+pb.pct+'%;height:100%;background:'+pb.col+'"></div></div>':'')
        +'</div>';
      }).join('')
      +'</div></div>';
  }).join('');

  el.innerHTML=html;
}

// ── TAB ANÁLISIS ──
function renderKpisAnalisis() {
  var emails=Object.keys(USERS);
  var names=emails.map(function(e){return USERS[e].name;});
  var bpD=emails.map(function(e){return _getKpis(e).bp;});
  var lpD=emails.map(function(e){return _getKpis(e).lp;});
  var facD=emails.map(function(e){return Math.round(_getKpis(e).fac);});
  var benD=emails.map(function(e){return Math.round(_getKpis(e).ben);});

  _kpiBar('kpi-chart-bp',names,bpD,_METAS.bp,'#534AB7','BookPoints por persona','pts');
  _kpiBar('kpi-chart-lp',names,lpD,_METAS.lp,'#EF9F27','Learning Paths por persona','');
  _kpiBar('kpi-chart-fac',names,facD,_METAS.fac,'#1D9E75','Facturación por persona','€');
  _kpiBar('kpi-chart-ben',names,benD,_METAS.ben,'#534AB7','Beneficio por persona','€');

  var n=emails.length||1;
  var radarData=[
    Math.round(bpD.reduce(function(s,v){return s+v;},0)/n/_METAS.bp*100),
    Math.round(lpD.reduce(function(s,v){return s+v;},0)/n/_METAS.lp*100),
    Math.round(facD.reduce(function(s,v){return s+v;},0)/n/_METAS.fac*100),
    Math.round(benD.reduce(function(s,v){return s+v;},0)/n/_METAS.ben*100)
  ];
  var rc=document.getElementById('kpi-chart-radar');if(!rc)return;
  if(rc._chart){try{rc._chart.destroy();}catch(e){}}
  rc._chart=new Chart(rc,{type:'radar',data:{
    labels:['BP','LP','Facturación','Beneficio'],
    datasets:[{label:'% objetivo',data:radarData,backgroundColor:'rgba(83,74,183,.15)',
      borderColor:'#534AB7',borderWidth:2,pointBackgroundColor:'#534AB7'}]
  },options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},title:{display:true,text:'% de objetivo alcanzado (media equipo)',font:{size:12},color:'#666'}},
    scales:{r:{beginAtZero:true,max:100,ticks:{stepSize:25,font:{size:10}},pointLabels:{font:{size:12}}}}}});
}

function _kpiBar(id,labels,data,meta,col,title,unit) {
  var c=document.getElementById(id);if(!c)return;
  if(c._chart){try{c._chart.destroy();}catch(e){}}
  var barColors=data.map(function(v){
    var p=v/meta;return p>=1?'#1D9E75':p>=.6?col:p>=.3?'#EF9F27':'#E24B4A';
  });
  c._chart=new Chart(c,{type:'bar',data:{labels:labels,datasets:[
    {label:'Actual',data:data,backgroundColor:barColors.map(function(c){return c+'99';}),
      borderColor:barColors,borderWidth:1.5,borderRadius:4},
    {label:'Objetivo',data:labels.map(function(){return meta;}),
      type:'line',borderColor:col,borderWidth:1.5,borderDash:[5,4],
      pointRadius:0,backgroundColor:'transparent'}
  ]},options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},title:{display:true,text:title,font:{size:12},color:'#666'},
      tooltip:{callbacks:{label:function(ctx){return ctx.dataset.label+': '+ctx.parsed.y.toLocaleString('es-ES')+(unit?unit:'');}}}},
    scales:{y:{beginAtZero:true,ticks:{font:{size:10}}},x:{ticks:{font:{size:11}}}}}});
}

// ── HISTORIAL personal ──
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
      +'<button onclick="delKpi(\''+k.id+'\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px">✕</button>'
    +'</div>';
  }).join('');
}
