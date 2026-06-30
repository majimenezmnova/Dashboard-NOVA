// ══ FINANZAS ══
var movimientos = [];
var _finTipo = 'ingreso';
var _finHFiltro = 'todos';
var _finHProy = 'todos';
var _finPersonas = [];
var _fanCharts = {};

function initFinanzas() {
  var fEl = document.getElementById('fin-fecha');
  if(fEl) fEl.valueAsDate = new Date();
  var grid = document.getElementById('fin-personas-grid');
  if(grid) {
    _finPersonas = [];
    var emailList = Object.keys(USERS);
    grid.innerHTML = emailList.map(function(email, idx) {
      var u = USERS[email];
      var eid = 'fpc-' + email.replace(/@/g,'_AT_').replace(/\./g,'_');
      return '<div class="fin-pchip" id="'+eid+'" onclick="toggleFinPersona(window._finEmailList['+idx+'])">'
        +'<div class="av '+u.av+'" style="width:18px;height:18px;font-size:8px;flex-shrink:0">'+u.ini+'</div>'
        +u.name+'</div>';
    }).join('');
    window._finEmailList = emailList;
  }
  var sel = document.getElementById('fin-proyecto');
  if(sel) {
    var opts = proyectos.map(function(p){return '<option value="'+p.nombre+'">'+p.nombre+'</option>';}).join('');
    sel.innerHTML = '<option value="">Selecciona proyecto...</option>'+opts;
  }
  updateFinDivision();
  renderFinMovimientos();
}

function toggleFinPersona(email) {
  var idx = _finPersonas.indexOf(email);
  var eid = 'fpc-'+email.replace(/@/g,'_AT_').replace(/\./g,'_');
  var el = document.getElementById(eid);
  if(idx>=0) { _finPersonas.splice(idx,1); if(el)el.classList.remove('on'); }
  else { _finPersonas.push(email); if(el)el.classList.add('on'); }
  updateFinDivision();
}

function updateFinDivision() {
  var lbl = document.getElementById('fin-division-lbl');
  if(!lbl) return;
  var imp = parseFloat(document.getElementById('fin-importe').value)||0;
  if(!_finPersonas.length) { lbl.textContent=''; return; }
  var pp = imp>0 ? (imp/_finPersonas.length).toFixed(2) : '—';
  var names = _finPersonas.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', ');
  lbl.textContent = 'División: ' + pp + '€ por persona entre ' + _finPersonas.length + ' (' + names + ')';
}

function setFinTipo(tipo) {
  _finTipo = tipo;
  var ib = document.getElementById('fin-tipo-ing');
  var gb = document.getElementById('fin-tipo-gas');
  var sb = document.getElementById('fin-submit-btn');
  if(tipo==='ingreso') {
    if(ib){ib.style.background='#E1F5EE';ib.style.color='#085041';}
    if(gb){gb.style.background='var(--bg2)';gb.style.color='var(--text2)';}
    if(sb){sb.style.background='#E1F5EE';sb.style.color='#085041';sb.innerHTML='➕ Registrar ingreso';}
  } else {
    if(ib){ib.style.background='var(--bg2)';ib.style.color='var(--text2)';}
    if(gb){gb.style.background='#FCEBEB';gb.style.color='#A32D2D';}
    if(sb){sb.style.background='#FCEBEB';sb.style.color='#A32D2D';sb.innerHTML='➕ Registrar gasto';}
  }
}

function saveMovimiento() {
  var imp = parseFloat(document.getElementById('fin-importe').value)||0;
  var proy = document.getElementById('fin-proyecto').value;
  var conc = document.getElementById('fin-concepto').value.trim();
  var errEl = document.getElementById('fin-error');
  if(!imp||!proy||!conc) { if(errEl)errEl.style.display='flex'; setTimeout(function(){if(errEl)errEl.style.display='none';},3000); return; }
  var mov = {
    id: 'local_'+Date.now(),
    tipo: _finTipo,
    importe: imp,
    proyecto: proy,
    concepto: conc,
    categoria: document.getElementById('fin-categoria').value.trim()||'General',
    fecha: document.getElementById('fin-fecha').value||new Date().toISOString().slice(0,10),
    personas: _finPersonas.slice(),
    factura: document.getElementById('fin-factura').value
  };
  DB.insertMovimiento({
    tipo:mov.tipo, importe:mov.importe, proyecto:mov.proyecto,
    concepto:mov.concepto, categoria:mov.categoria,
    fecha:mov.fecha, personas:mov.personas, factura:mov.factura
  }).then(function(data){
    if(data) { mov.id=data.id; }
    else { console.error('insertMovimiento failed'); }
  });
  movimientos.unshift(mov);
  var p = proyectos.find(function(x){return x.nombre===proy;});
  if(p) {
    if(_finTipo==='ingreso') { p.ingresos=(p.ingresos||0)+imp; }
    else { p.gastos=(p.gastos||0)+imp; }
    p.beneficio=(p.ingresos||0)-(p.gastos||0);
  }
  if(_finTipo==='ingreso' && _finPersonas.length) {
    var share = imp / _finPersonas.length;
    _finPersonas.forEach(function(email) {
      var tm = TEAM.find(function(t){return t.email===email;});
      if(tm) tm.ingresos = (tm.ingresos||0) + share;
    });
  }
  document.getElementById('fin-importe').value='';
  document.getElementById('fin-concepto').value='';
  document.getElementById('fin-categoria').value='';
  _finPersonas=[];
  document.querySelectorAll('.fin-pchip').forEach(function(c){c.classList.remove('on');});
  updateFinDivision();
  renderFinanzas();
  renderDash(); renderFin(); renderEH();
}

// Primera definición de renderFinanzas (con check de analisis)
function renderFinanzas() {
  renderFinKPIs();
  renderFinMovimientos();
  renderFinHistorial();
  renderFinPorProy();
  // Solo renderizar análisis si el tab está visible (evita charts con 0px)
  var ftA=document.getElementById('ft-analisis');
  if(ftA && ftA.style.display!=='none') renderFinAnalisis();
}

function getFinTotales() {
  var ing=0,gas=0;
  movimientos.forEach(function(m){if(m.tipo==='ingreso')ing+=m.importe;else gas+=m.importe;});
  return {ing:ing,gas:gas,ben:ing-gas};
}

function renderFinKPIs() {
  var t = getFinTotales();
  var totalH = TEAM.reduce(function(s,m){return s+m.horas;},0);
  var eh = totalH>0?Math.round(t.ben/totalH*10)/10:0;
  function si(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  si('fin-kpi-ing',t.ing.toLocaleString('es-ES')+'€');
  si('fin-kpi-gas',t.gas.toLocaleString('es-ES')+'€');
  si('fin-kpi-ben',(t.ben>=0?'+':'')+t.ben.toLocaleString('es-ES')+'€');
  si('fin-kpi-eh',eh>0?eh+'€/h':'—');
  var benEl=document.getElementById('fin-kpi-ben');
  if(benEl)benEl.style.color=t.ben>=0?'#534AB7':'#E24B4A';
}

function renderFinMovimientos() {
  var el = document.getElementById('fin-movimientos-list');
  var cnt = document.getElementById('fin-mov-count');
  if(!el) return;
  if(cnt) cnt.textContent = movimientos.length+' registros';
  if(!movimientos.length) {
    el.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:13px">Sin movimientos todavía</div>';
    return;
  }
  el.innerHTML = movimientos.slice(0,20).map(function(m) {
    var ing = m.tipo==='ingreso';
    var dateStr = new Date(m.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});
    var personas = m.personas.length?m.personas.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', '):'Proyecto';
    return '<div class="fin-mov-row">'
      +'<div class="fin-mov-ico" style="background:'+(ing?'#E1F5EE':'#FCEBEB')+'"><i class="ti '+(ing?'ti-arrow-down-circle':'ti-arrow-up-circle')+'" style="color:'+(ing?'#0F6E56':'#A32D2D')+'"></i></div>'
      +'<div class="fin-mov-info">'
        +'<div class="fin-mov-concepto">'+m.concepto+'</div>'
        +'<div class="fin-mov-meta">'+m.proyecto+' · '+personas+' · '+dateStr+(m.categoria&&m.categoria!=='General'?' · '+m.categoria:'')+'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
        +(m.factura==='si'?'<span title="Con justificante" style="font-size:12px;color:var(--teal)">📎</span>':m.factura==='no'?'<span title="Sin justificante" style="font-size:12px;color:var(--coral)">❌</span>':'')
        +'<div class="fin-mov-amt" style="color:'+(ing?'#085041':'#A32D2D')+'">'+(ing?'+':'-')+m.importe.toLocaleString('es-ES')+'€</div>'
        +'<button onclick="delMovimiento(\''+m.id+'\')" class="btn btn-sm btn-d" style="padding:3px 7px;flex-shrink:0">🗑️</button>'
      +'</div></div>';
  }).join('');
}

function delMovimiento(id) {
  var idStr=String(id);
  var idx = movimientos.findIndex(function(m){return String(m.id)===idStr;});
  if(idx<0) return;
  var m = movimientos[idx];
  var p = proyectos.find(function(x){return x.nombre===m.proyecto;});
  if(p) {
    if(m.tipo==='ingreso') p.ingresos=Math.max(0,(p.ingresos||0)-m.importe);
    else p.gastos=Math.max(0,(p.gastos||0)-m.importe);
    p.beneficio=(p.ingresos||0)-(p.gastos||0);
  }
  if(m.id && !idStr.startsWith('local_')) DB.deleteMovimiento(m.id);
  movimientos.splice(idx,1);
  renderFinanzas(); renderDash(); renderEH();
}

function setFinHFiltro(f, btn) {
  _finHFiltro=f;
  ['fh-todos','fh-ing','fh-gas'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderFinHistorial();
}

function renderFinHistorial() {
  var pbtns = document.getElementById('fh-proy-btns');
  if(pbtns) {
    var pBtns = ['<button class="fb '+(_finHProy==='todos'?'on':'')+'" onclick="setFinHProy2(0)">Todos los proyectos</button>'];
    proyectos.forEach(function(p,pi){pBtns.push('<button class="fb '+(_finHProy===p.nombre?'on':'')+'" onclick="setFinHProy2('+(pi+1)+')">'+p.nombre+'</button>');});
    pbtns.innerHTML=pBtns.join('');
    window._finProyList=['todos'].concat(proyectos.map(function(p){return p.nombre;}));
  }
  var tb = document.getElementById('fin-hist-tbody'); if(!tb) return;
  var src = movimientos.filter(function(m){
    if(_finHFiltro==='ingreso'&&m.tipo!=='ingreso') return false;
    if(_finHFiltro==='gasto'&&m.tipo!=='gasto') return false;
    if(_finHProy!=='todos'&&m.proyecto!==_finHProy) return false;
    return true;
  });
  if(!src.length){tb.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--text3);padding:1.5rem">Sin movimientos</td></tr>';return;}
  tb.innerHTML = src.map(function(m){
    var ing=m.tipo==='ingreso';
    var dateStr=new Date(m.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
    var personas=m.personas.length?m.personas.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', '):'Proyecto';
    return '<tr>'
      +'<td style="font-size:11px">'+dateStr+'</td>'
      +'<td><span class="tag" style="background:'+(ing?'#E1F5EE':'#FCEBEB')+';color:'+(ing?'#085041':'#A32D2D')+'">'+(ing?'Ingreso':'Gasto')+'</span></td>'
      +'<td><span class="tag tp" style="font-size:10px">'+m.proyecto+'</span></td>'
      +'<td style="font-size:12px">'+m.concepto+'</td>'
      +'<td style="font-size:11px;color:var(--text3)">'+m.categoria+'</td>'
      +'<td style="font-size:11px;color:var(--text3)">'+personas+'</td>'
      +'<td style="font-size:11px">'+(m.factura==='si'?'<span style="color:var(--teal)">✓</span>':m.factura==='no'?'<span style="color:var(--coral)">✗</span>':'⏳')+'</td>'
      +'<td style="text-align:right;font-weight:600;color:'+(ing?'#085041':'#A32D2D')+'">'+(ing?'+':'-')+m.importe.toLocaleString('es-ES')+'€</td>'
      +'<td><button onclick="delMovimiento(\''+m.id+'\')" class="btn btn-sm btn-d" style="padding:2px 6px">🗑️</button></td>'
      +'</tr>';
  }).join('');
}

function setFinHProy(p, btn) {
  _finHProy=p;
  renderFinHistorial();
}
function setFinHProy2(idx) {
  _finHProy=(window._finProyList&&window._finProyList[idx])||'todos';
  renderFinHistorial();
}

function renderFinPorProy() {
  var el = document.getElementById('fin-proy-bloques'); if(!el) return;
  if(!proyectos.length){el.innerHTML='<div class="empty">💼<p>Crea proyectos para ver el desglose financiero</p></div>';return;}
  el.innerHTML = proyectos.map(function(p) {
    var movsProy = movimientos.filter(function(m){return m.proyecto===p.nombre;});
    var ing = movsProy.filter(function(m){return m.tipo==='ingreso';}).reduce(function(s,m){return s+m.importe;},0);
    var gas = movsProy.filter(function(m){return m.tipo==='gasto';}).reduce(function(s,m){return s+m.importe;},0);
    var ben = ing-gas;
    var fc = (typeof FASE_CONFIG!=='undefined'&&FASE_CONFIG)?FASE_CONFIG[p.estado]:{label:p.estado,cls:'fase-exp',color:'#534AB7'};
    var catGas={};
    movsProy.filter(function(m){return m.tipo==='gasto';}).forEach(function(m){catGas[m.categoria]=(catGas[m.categoria]||0)+m.importe;});
    var catHtml=Object.entries(catGas).sort(function(a,b){return b[1]-a[1];}).map(function(e){
      return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text2)">'+e[0]+'</span><span style="color:#A32D2D;font-weight:500">-'+e[1].toLocaleString('es-ES')+'€</span></div>';
    }).join('');
    return '<div class="fin-proy-blk">'
      +'<div class="fin-proy-header">'
        +'<div><div style="font-size:14px;font-weight:700">'+p.nombre+'</div><div style="font-size:11px;color:var(--text2);margin-top:1px">'+(p.miembros&&p.miembros.length?p.miembros.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', '):'Sin miembros')+'</div></div>'
        +'<span class="proj-fase '+fc.cls+'">'+fc.label+'</span>'
      +'</div>'
      +'<div class="fin-proy-kpis">'
        +'<div class="fin-proy-kpi"><div class="fin-proy-kpi-lbl">Ingresos</div><div class="fin-proy-kpi-val" style="color:#085041">+'+ing.toLocaleString('es-ES')+'€</div></div>'
        +'<div class="fin-proy-kpi"><div class="fin-proy-kpi-lbl">Gastos</div><div class="fin-proy-kpi-val" style="color:#A32D2D">-'+gas.toLocaleString('es-ES')+'€</div></div>'
        +'<div class="fin-proy-kpi"><div class="fin-proy-kpi-lbl">Beneficio</div><div class="fin-proy-kpi-val" style="color:'+(ben>=0?'#534AB7':'#E24B4A')+'">'+(ben>=0?'+':'')+ben.toLocaleString('es-ES')+'€</div></div>'
      +'</div>'
      +(p.meta>0?'<div style="padding:.625rem 1rem;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:3px"><span>Meta de ingresos</span><span>'+ing.toLocaleString('es-ES')+'€ / '+p.meta.toLocaleString('es-ES')+'€</span></div><div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="width:'+Math.min(100,Math.round(ing/p.meta*100))+'%;height:100%;background:'+fc.color+';border-radius:3px"></div></div></div>':'')
      +(catHtml?'<div style="padding:.625rem 1rem"><div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Gastos por categoría</div>'+catHtml+'</div>':'')
      +(movsProy.length?'<div style="padding:.625rem 1rem"><div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Últimos movimientos</div>'
        +movsProy.slice(0,5).map(function(m){
          var ing2=m.tipo==='ingreso';
          return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border)"><span>'+m.concepto+'</span><span style="color:'+(ing2?'#085041':'#A32D2D')+';font-weight:500">'+(ing2?'+':'-')+m.importe.toLocaleString('es-ES')+'€</span></div>';
        }).join('')+'</div>':'')
      +'</div>';
  }).join('');
}

function renderFinAnalisis() {
  var isDark=matchMedia('(prefers-color-scheme:dark)').matches;
  var tC=isDark?'rgba(255,255,255,.45)':'rgba(0,0,0,.38)';
  var gC=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)';

  function freshCanvas(wrapId) {
    var wrap=document.getElementById(wrapId); if(!wrap) return null;
    wrap.innerHTML='<canvas style="width:100%;height:100%"></canvas>';
    return wrap.querySelector('canvas');
  }

  function si(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

  if(!movimientos.length){
    ['fan-wrap-periodos','fan-wrap-acum','fan-wrap-cat','fan-wrap-proy'].forEach(function(id){
      var el=document.getElementById(id);
      if(el)el.innerHTML='<div class="empty" style="padding:1.5rem">📊<p>Sin movimientos todavía</p></div>';
    });
    ['fan-mejor-per','fan-mejor-proy','fan-ratio'].forEach(function(id){si(id,'—');});
    return;
  }

  Object.keys(_fanCharts).forEach(function(k){try{_fanCharts[k].destroy();}catch(e){}});
  _fanCharts={};

  var t=getFinTotales();
  var ratio=t.gas>0?Math.round(t.ing/t.gas*100)/100:0;
  si('fan-ratio',ratio>0?ratio+'x':'—');

  var byPer={};
  movimientos.forEach(function(m){
    var d=new Date(m.fecha+'T12:00:00');
    var dias=Math.max(0,Math.floor((d-new Date(2026,6,1))/86400000));
    var per='P'+Math.floor(dias/15+1);
    byPer[per]=byPer[per]||{ing:0,gas:0};
    if(m.tipo==='ingreso')byPer[per].ing+=m.importe;
    else byPer[per].gas+=m.importe;
  });
  var perEntries=Object.entries(byPer).map(function(e){return{per:e[0],ben:e[1].ing-e[1].gas};});
  if(perEntries.length){
    perEntries.sort(function(a,b){return b.ben-a.ben;});
    si('fan-mejor-per',perEntries[0].per+' ('+perEntries[0].ben.toLocaleString('es-ES')+'€)');
  }

  var byProy={};
  movimientos.forEach(function(m){
    byProy[m.proyecto]=byProy[m.proyecto]||{ing:0,gas:0};
    if(m.tipo==='ingreso')byProy[m.proyecto].ing+=m.importe;
    else byProy[m.proyecto].gas+=m.importe;
  });
  var proyEntries=Object.entries(byProy).map(function(e){return{n:e[0],ben:e[1].ing-e[1].gas};});
  if(proyEntries.length){
    proyEntries.sort(function(a,b){return b.ben-a.ben;});
    si('fan-mejor-proy',proyEntries[0].n);
  }

  var PERS=['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'];
  var ingPer=PERS.map(function(p){return byPer[p]?byPer[p].ing:0;});
  var gasPer=PERS.map(function(p){return byPer[p]?byPer[p].gas:0;});
  var c1=freshCanvas('fan-wrap-periodos');
  if(c1) _fanCharts['periodos']=new Chart(c1,{type:'bar',
    data:{labels:PERS,datasets:[
      {label:'Ingresos',data:ingPer,backgroundColor:'rgba(29,158,117,.7)',borderRadius:3,borderWidth:0},
      {label:'Gastos',  data:gasPer,backgroundColor:'rgba(226,75,74,.7)', borderRadius:3,borderWidth:0}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{font:{size:11},color:tC}}},
      scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10}}},
              y:{grid:{color:gC},ticks:{color:tC,font:{size:10}},beginAtZero:true}}}});

  var movOrd=movimientos.slice().sort(function(a,b){return a.fecha>b.fecha?1:-1;});
  var acumLabels=[],acumData=[],acum=0;
  movOrd.forEach(function(m){
    acum+=m.tipo==='ingreso'?m.importe:-m.importe;
    acumLabels.push(new Date(m.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}));
    acumData.push(Math.round(acum*100)/100);
  });
  var c2=freshCanvas('fan-wrap-acum');
  if(c2) _fanCharts['acum']=new Chart(c2,{type:'line',
    data:{labels:acumLabels,datasets:[{label:'Beneficio acumulado',data:acumData,
      borderColor:'#534AB7',backgroundColor:'rgba(83,74,183,.08)',borderWidth:2,pointRadius:3,fill:true,tension:.4}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{font:{size:11},color:tC}}},
      scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10}}},
              y:{grid:{color:gC},ticks:{color:tC,font:{size:10}}}}}});

  var catTotales={};
  movimientos.filter(function(m){return m.tipo==='gasto';}).forEach(function(m){
    catTotales[m.categoria]=(catTotales[m.categoria]||0)+m.importe;
  });
  var catLbls=Object.keys(catTotales),catVals=Object.values(catTotales);
  var COLS2=['#E24B4A','#EF9F27','#D85A30','#378ADD','#B4B2A9','#534AB7'];
  var c3=freshCanvas('fan-wrap-cat');
  if(c3&&catLbls.length){
    _fanCharts['cat']=new Chart(c3,{type:'doughnut',
      data:{labels:catLbls,datasets:[{data:catVals,backgroundColor:COLS2.slice(0,catLbls.length),borderWidth:2,borderColor:isDark?'#1a1a18':'#fff'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
    var legEl=document.getElementById('fan-cat-legend');
    if(legEl){var tot2=catVals.reduce(function(s,v){return s+v;},0)||1;
      legEl.innerHTML=catLbls.map(function(l,i){
        return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">'
          +'<div style="width:8px;height:8px;border-radius:2px;background:'+COLS2[i]+';flex-shrink:0"></div>'
          +'<span style="font-size:10px;color:var(--text2);flex:1">'+l+'</span>'
          +'<span style="font-size:10px;font-weight:500">'+Math.round(catVals[i]/tot2*100)+'%</span></div>';
      }).join('');}
  } else if(c3){
    document.getElementById('fan-wrap-cat').innerHTML='<div class="empty" style="padding:1rem">📊<p style="font-size:12px">Sin gastos registrados</p></div>';
  }

  var pNoms=proyectos.map(function(p){return p.nombre;});
  var pBens=proyectos.map(function(p){
    var movs=movimientos.filter(function(m){return m.proyecto===p.nombre;});
    var i2=movs.filter(function(m){return m.tipo==='ingreso';}).reduce(function(s,m){return s+m.importe;},0);
    var g2=movs.filter(function(m){return m.tipo==='gasto';}).reduce(function(s,m){return s+m.importe;},0);
    return i2-g2;
  });
  var c4=freshCanvas('fan-wrap-proy');
  if(c4&&pNoms.length){
    var benColors=pBens.map(function(v){return v>=0?'rgba(83,74,183,.7)':'rgba(226,75,74,.7)';});
    _fanCharts['proy']=new Chart(c4,{type:'bar',
      data:{labels:pNoms,datasets:[{label:'Beneficio',data:pBens,backgroundColor:benColors,borderRadius:4,borderWidth:0}]},
      options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',
        plugins:{legend:{display:false}},
        scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10}}},
                y:{grid:{color:gC},ticks:{color:tC,font:{size:10}}}}}});
  } else if(c4){
    document.getElementById('fan-wrap-proy').innerHTML='<div class="empty" style="padding:1rem">💼<p style="font-size:12px">Sin proyectos</p></div>';
  }
}

function swFinTab(id, el) {
  ['ft-registrar','ft-historial','ft-proyectos','ft-analisis','ft-eurhora'].forEach(function(t){
    var e=document.getElementById(t);if(e)e.style.display='none';
  });
  var te=document.getElementById(id);if(te)te.style.display='block';
  document.querySelectorAll('#page-finanzas .tab').forEach(function(t){t.classList.remove('on');});
  if(el)el.classList.add('on');
  if(id==='ft-historial'){renderFinHistorial();}
  if(id==='ft-proyectos'){renderFinPorProy();}
  if(id==='ft-analisis'){
    ['periodos','acum','cat','proy'].forEach(function(k){
      if(_fanCharts[k]){try{_fanCharts[k].destroy();}catch(e){}delete _fanCharts[k];}
    });
    setTimeout(renderFinAnalisis, 60);
  }
  if(id==='ft-eurhora'){renderEH();}
}

// Segunda definición de renderFinanzas (la que queda activa en runtime — sin check de analisis)
function renderFinanzas() {
  renderFinKPIs();
  renderFinMovimientos();
  renderFinHistorial();
  renderFinPorProy();
}
