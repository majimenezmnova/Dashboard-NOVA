// PROYECTOS (parte 1: CRUD + modals + updSelects)
var ETAGS={Operacional:'tt',MVP:'tp',Validando:'tb2',Idea:'tc',Pausado:'ta'};
function renderProys(){
  renderProyCards();
}
function delProy(i){var p=proyectos[i];if(p&&p.id)DB.deleteProyecto(p.id);proyectos.splice(i,1);renderProyCards();renderDash();setTimeout(renderCharts,80);}

var _editProyIdx = -1;

var selectedMembers = [];
function initMembersGrid() {
  var grid = document.getElementById('p-members-grid'); if(!grid) return;
  selectedMembers = [];
  var emailList = Object.keys(USERS);
  window._projEmailList = emailList;
  grid.innerHTML = emailList.map(function(email, idx) {
    var u = USERS[email];
    var eid = 'mt-'+email.replace(/@/g,'_AT_').replace(/\./g,'_');
    return '<div class="member-toggle" id="'+eid+'" onclick="toggleMember(window._projEmailList['+idx+'])">'
      +'<div class="av '+u.av+'" style="width:22px;height:22px;font-size:9px;flex-shrink:0">'+u.ini+'</div>'
      +u.name+'</div>';
  }).join('');
}
function toggleMember(email) {
  var idx = selectedMembers.indexOf(email);
  var eid = 'mt-'+email.replace(/@/g,'_AT_').replace(/\./g,'_');
  var el = document.getElementById(eid);
  if(idx >= 0) { selectedMembers.splice(idx,1); if(el)el.classList.remove('sel'); }
  else { selectedMembers.push(email); if(el)el.classList.add('sel'); }
}

function openNuevoProy(){
  _editProyIdx = -1;
  initMembersGrid();
  var title = document.getElementById('modal-proy-title');
  var btn   = document.getElementById('modal-proy-btn');
  if(title) title.textContent = '✦ Nuevo proyecto';
  if(btn)   btn.textContent   = 'Crear proyecto';
  ['p-n','p-d','p-meta'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  var sel=document.getElementById('p-e');if(sel)sel.value='Exploracion';
  document.getElementById('modal-proy').classList.add('on');
}

function openEditProy(i){
  _editProyIdx = i;
  var p = proyectos[i];
  initMembersGrid();
  var en = document.getElementById('p-n'); if(en) en.value = p.nombre;
  var ed = document.getElementById('p-d'); if(ed) ed.value = p.desc||'';
  var ee = document.getElementById('p-e'); if(ee) ee.value = p.estado||'Exploracion';
  var em = document.getElementById('p-meta'); if(em) em.value = p.meta||'';
  selectedMembers = (p.miembros||[]).slice();
  selectedMembers.forEach(function(email){
    var eid='mt-'+email.replace(/@/,'_AT_').replace(/\./g,'_');
    var el=document.getElementById(eid);
    if(el)el.classList.add('sel');
  });
  var title = document.getElementById('modal-proy-title');
  var btn   = document.getElementById('modal-proy-btn');
  if(title) title.textContent = '✏ Editar — ' + p.nombre;
  if(btn)   btn.textContent   = 'Guardar cambios';
  document.getElementById('modal-proy').classList.add('on');
}

function closePrModal(){
  document.getElementById('modal-proy').classList.remove('on');
  _editProyIdx = -1;
}

function saveProy(){
  var nombre=document.getElementById('p-n').value.trim();
  if(!nombre){document.getElementById('p-n').focus();return;}
  var data={
    nombre:nombre,
    desc:document.getElementById('p-d').value||'Sin descripción.',
    miembros:selectedMembers.slice(),
    estado:document.getElementById('p-e').value,
    meta:parseFloat(document.getElementById('p-meta').value)||0
  };
  if(_editProyIdx >= 0){
    var old = proyectos[_editProyIdx];
    data.ingresos=old.ingresos||0; data.gastos=old.gastos||0; data.beneficio=old.beneficio||0;
    data.horas_total=old.horas_total||0; data.reportes_count=old.reportes_count||0;
    data.aprendizajes_count=old.aprendizajes_count||0; data.avances_count=old.avances_count||0;
    data.bloqueos_count=old.bloqueos_count||0;
    if(old.id){ data.id=old.id; DB.upsertProyecto({id:old.id,nombre:data.nombre,descripcion:data.desc,estado:data.estado,meta:data.meta,miembros:data.miembros}); }
    proyectos[_editProyIdx] = data;
  } else {
    data.ingresos=0;data.gastos=0;data.beneficio=0;data.horas_total=0;
    data.reportes_count=0;data.aprendizajes_count=0;data.avances_count=0;data.bloqueos_count=0;
    DB.upsertProyecto({nombre:data.nombre,descripcion:data.desc,estado:data.estado,meta:data.meta,miembros:data.miembros})
      .then(function(d){if(d)data.id=d.id;});
    proyectos.push(data);
  }
  closePrModal();
  selectedMembers=[];
  renderProyCards();renderDash();renderEH();updSelects();setTimeout(renderCharts,80);
}
function updSelects(){
  var opts=proyectos.map(function(p){return '<option value="'+p.nombre+'">'+p.nombre+'</option>';}).join('');
  ['rep-proy','hc-proy'].forEach(function(id){var el=document.getElementById(id);if(!el)return;var pv=el.value;el.innerHTML='<option value="">Selecciona proyecto...</option>'+opts;if(pv)el.value=pv;});
}

// PROYECTOS (parte 2: FASE_CONFIG + ranking + mentor cards)
var FASE_CONFIG = {
  Exploracion: {label:'🌍 Exploración', cls:'fase-exp', color:'#3730A3'},
  Validacion:  {label:'✅ Validación',  cls:'fase-val', color:'#065F46'},
  Expansion:   {label:'🚀 Expansión',   cls:'fase-scl', color:'#9A3412'}
};

function calcProyPuntos(p) {
  var h=Math.round((p.horas_total||0)*2), e=Math.round((p.ingresos||0)/5);
  var r=(p.reportes_count||0)*20, a=(p.aprendizajes_count||0)*15;
  var av=(p.avances_count||0)*10;
  var tieneActividad=(p.horas_total||0)>0||(p.ingresos||0)>0||(p.reportes_count||0)>0;
  var b=tieneActividad?Math.max(0,30-(p.bloqueos_count||0)*10):0;
  return {total:h+e+r+a+av+b, pts_horas:h, pts_ingresos:e, pts_reportes:r, pts_aprend:a, pts_avances:av, pts_bloqueos:b};
}

function getFasesRecomendadas(p) {
  var fases=[], estado=p.estado||'';
  if(estado==='Exploracion') fases=[1,2,3];
  else if(estado==='Validacion') fases=[4,5,6,7];
  else if(estado==='Expansion') fases=[8,9,10];
  if((p.bloqueos_count||0)>2 && fases.indexOf(8)<0) fases.push(8);
  if((p.ingresos||0)===0 && (p.horas_total||0)>10 && fases.indexOf(5)<0) fases.push(5);
  if((p.ingresos||0)>500 && fases.indexOf(9)<0) fases.push(9);
  return fases.sort(function(a,b){return a-b;});
}

function irMentorProy(nombre) {
  swPrTab('ptab-mentores', document.querySelectorAll('#page-proyectos .tab')[2]);
  renderMentorCards(nombre);
}

function renderProyRanking() {
  var el=document.getElementById('proy-ranking-list'); if(!el) return;
  if(!proyectos.length){el.innerHTML='<div class="empty">🏆<p>Crea proyectos para ver el ranking</p></div>';return;}
  var sorted=proyectos.slice().sort(function(a,b){return calcProyPuntos(b).total-calcProyPuntos(a).total;});
  var medals=['🥇','🥈','🥉'], posC=['prk-pos-1','prk-pos-2','prk-pos-3'];
  el.innerHTML=sorted.map(function(p,i){
    var pts=calcProyPuntos(p), fc=FASE_CONFIG[p.estado]||FASE_CONFIG.Exploracion;
    var badges=[];
    if((p.horas_total||0)>=50) badges.push({icon:'⏱',lbl:'50h+',col:'#7F77DD'});
    if((p.ingresos||0)>=500)   badges.push({icon:'💰',lbl:'500€+',col:'#1D9E75'});
    if((p.bloqueos_count||0)===0) badges.push({icon:'🚀',lbl:'Sin bloqueos',col:'#534AB7'});
    if((p.reportes_count||0)>=3)  badges.push({icon:'📝',lbl:'Consistente',col:'#D85A30'});
    var bars=[
      {label:'Horas',val:pts.pts_horas,color:'#7F77DD'},
      {label:'Ingresos',val:pts.pts_ingresos,color:'#1D9E75'},
      {label:'Reportes',val:pts.pts_reportes,color:'#D85A30'},
      {label:'Aprend.',val:pts.pts_aprend,color:'#EF9F27'},
      {label:'Avances',val:pts.pts_avances,color:'#378ADD'}
    ];
    var maxBar=Math.max.apply(null,bars.map(function(b){return b.val;}))||1;
    return '<div class="prk-card">'
      +'<div class="prk-pos '+(i<3?posC[i]:'prk-pos-n')+'">'+(i<3?medals[i]:(i+1))+'</div>'
      +'<div class="prk-info">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
          +'<div class="prk-name">'+p.nombre+'</div>'
          +'<span class="proj-fase '+fc.cls+'" style="font-size:10px">'+fc.label+'</span>'
        +'</div>'
        +'<div class="prk-badges">'
          +badges.map(function(b){return '<span style="background:'+b.col+'22;color:'+b.col+';border:1px solid '+b.col+'44;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600">'+b.icon+' '+b.lbl+'</span>';}).join('')
          +(badges.length===0?'<span style="font-size:11px;color:var(--text3)">Sin logros aún</span>':'')
        +'</div>'
        +'<div class="prk-bars">'
          +bars.map(function(b){var pct=Math.round(b.val/maxBar*100);return '<div class="prk-bar-row"><span class="prk-bar-label">'+b.label+'</span><div class="prk-bar-t"><div class="prk-bar-f" style="width:'+pct+'%;background:'+b.color+'"></div></div><span style="width:28px;flex-shrink:0;font-size:10px;color:var(--text3)">'+b.val+'</span></div>';}).join('')
        +'</div>'
      +'</div>'
      +'<div class="prk-pts"><div class="prk-pts-val">'+pts.total+'</div><div class="prk-pts-lbl">puntos</div></div>'
      +'</div>';
  }).join('');
}

var mentorFilterProy = null;
function renderMentorCards(proyNombre) {
  mentorFilterProy = proyNombre;
  var fbtns=document.getElementById('mentor-filter-btns');
  if(fbtns){
    var btns=['<button class="fb '+(proyNombre===null?'on':'')+'" onclick="renderMentorCards(null)">Todos</button>'];
    proyectos.forEach(function(p,pi){btns.push('<button class="fb '+(proyNombre===p.nombre?'on':'')+'" onclick="renderMentorCards(proyectos['+pi+'].nombre)">'+p.nombre+'</button>');});
    fbtns.innerHTML=btns.join('');
  }
  var el=document.getElementById('mentor-cards'); if(!el) return;
  var proysFiltro=proyNombre?proyectos.filter(function(p){return p.nombre===proyNombre;}):proyectos;
  if(!proysFiltro.length){el.innerHTML='<div class="empty">👤<p>Crea proyectos para ver recomendaciones</p></div>';return;}
  el.innerHTML=proysFiltro.map(function(p){
    var fases=getFasesRecomendadas(p), fc=FASE_CONFIG[p.estado]||FASE_CONFIG.Exploracion;
    var tieneBloqueos=(p.bloqueos_count||0)>0, tieneIngresos=(p.ingresos||0)>0;
    var out='<div style="margin-bottom:1.25rem">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:.75rem">'
        +'<span class="proj-fase '+fc.cls+'">'+fc.label+'</span>'
        +'<strong style="font-size:15px">'+p.nombre+'</strong>'
      +'</div>';
    var req=[];
    if(tieneIngresos) req.push('Con ingresos → Contactar asesor fiscal');
    if(tieneBloqueos) req.push('Bloqueos activos → Acudir al especialista');
    req.push('Cadencia: 1 mentoría cada 2 semanas por proyecto');
    out+='<div style="background:var(--amber-l);border-radius:var(--r);padding:.75rem;margin-bottom:.875rem;font-size:12px;color:#633806;line-height:1.8">'+req.map(function(r){return '📌 '+r;}).join('<br>')+'</div>';
    if(typeof MENTORES_DB!=='undefined'){
      out+=fases.map(function(fnum){
        var f=MENTORES_DB[fnum]; if(!f) return '';
        var urgente=tieneBloqueos&&(fnum===8||fnum===7);
        return '<div class="mentor-card '+(urgente?'mentor-urgente':'')+'">'
          +'<div class="mentor-fase-title">'
            +'<span style="background:var(--purple-l);color:var(--purple-d);width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">'+fnum+'</span>'
            +f.fase+(urgente?'<span style="margin-left:auto;font-size:10px;background:var(--coral);color:#fff;padding:2px 8px;border-radius:20px">Urgente</span>':'')
          +'</div>'
          +f.mentores.map(function(m){
            var ini=m.nombre.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
            return '<div class="mentor-person"><div class="mentor-av">'+ini+'</div>'
              +'<div style="flex:1"><div class="mentor-name">'+m.nombre+'</div>'
              +'<div class="mentor-tags">'+m.tags.map(function(t){return '<span class="mentor-tag">#'+t+'</span>';}).join('')+'</div></div></div>';
          }).join('')+'</div>';
      }).join('');
    }
    var esp=[];
    if(!tieneIngresos&&(p.horas_total||0)>10) esp.push({nombre:'Luis',area:'Goat validación & roadmap'});
    if((p.horas_total||0)>0) esp.push({nombre:'Sonia',area:'Finanzas'});
    if(tieneIngresos) esp.push({nombre:'Néstor',area:'Aceleración'});
    if(esp.length) out+='<div class="mentor-card" style="border-color:var(--purple);background:var(--purple-l)">'
      +'<div class="mentor-fase-title" style="color:var(--purple-d)">⭐ Mentores especiales</div>'
      +esp.map(function(m){return '<div class="mentor-person"><div class="mentor-av" style="background:var(--purple);color:#fff">'+m.nombre[0]+'</div><div><div class="mentor-name">'+m.nombre+'</div><div class="mentor-tags"><span class="mentor-tag">'+m.area+'</span></div></div></div>';}).join('')+'</div>';
    out+='</div>';
    return out;
  }).join('<hr style="border:none;border-top:1px solid var(--border);margin:1rem 0">');
}

function swPrTab(id, el) {
  ['ptab-cards','ptab-ranking','ptab-mentores'].forEach(function(t){var e=document.getElementById(t);if(e)e.style.display='none';});
  var te=document.getElementById(id); if(te)te.style.display='block';
  document.querySelectorAll('#page-proyectos .tab').forEach(function(t){t.classList.remove('on');});
  if(el)el.classList.add('on');
  if(id==='ptab-ranking') renderProyRanking();
  if(id==='ptab-mentores') setTimeout(function(){
    if(_mentorSubTab==='todos') renderTodosMentores();
    else renderMentorCards(mentorFilterProy);
  },50);
}

function renderProyCards(){
  var c=document.getElementById('proy-list');if(!c)return;
  if(!proyectos.length){
    c.innerHTML='<div class="empty">💼<p>No hay proyectos. Crea el primero!</p></div>';
    updSelects();return;
  }
  c.innerHTML=proyectos.map(function(p,i){
    var fc=FASE_CONFIG[p.estado]||FASE_CONFIG.Exploracion;
    var miembros=p.miembros||[];
    var pct_meta=p.meta>0?Math.min(100,Math.round((p.ingresos||0)/p.meta*100)):0;
    var blq=p.bloqueos_count||0,apr=p.aprendizajes_count||0;
    var hrs=p.horas_total||0,ing=p.ingresos||0;
    var membersHtml=miembros.map(function(email){
      var u=USERS[email];if(!u)return'';
      return '<div class="proj-member-av av '+u.av+'" title="'+u.name+'">'+u.ini+'</div>';
    }).join('');
    return '<div class="proj-card">'
      +'<div class="proj-header">'
        +'<div style="flex:1;min-width:0">'
          +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
            +'<span class="proj-fase '+fc.cls+'">'+fc.label+'</span>'
          +'</div>'
          +'<div class="proj-name">'+p.nombre+'</div>'
          +'<div class="proj-desc">'+p.desc+'</div>'
          +(miembros.length?'<div class="proj-members">'+membersHtml+'</div>':'<div style="font-size:11px;color:var(--text3);margin-top:4px">Sin miembros asignados</div>')
        +'</div>'
        +'<div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">'
          +'<button class="btn btn-sm" onclick="openEditProy('+i+')" style="padding:4px 8px;gap:4px">✏️ Editar</button>'
          +'<button class="btn btn-sm btn-d" onclick="delProy('+i+')" style="padding:4px 8px">🗑️</button>'
        +'</div>'
      +'</div>'
      +(p.meta>0?'<div style="padding:0 1.125rem .5rem"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:3px"><span>Meta de ingresos</span><span>'+ing.toLocaleString('es-ES')+'€ / '+p.meta.toLocaleString('es-ES')+'€ ('+pct_meta+'%)</span></div><div class="proj-prog-bar"><div class="proj-prog-fill" style="width:'+pct_meta+'%;background:'+fc.color+'"></div></div></div>':'')
      +'<div class="proj-metrics">'
        +'<div class="pm-cell"><div class="pm-label">Horas</div><div class="pm-val">'+hrs+'h</div></div>'
        +'<div class="pm-cell"><div class="pm-label">Ingresos</div><div class="pm-val">'+ing.toLocaleString('es-ES')+'€</div></div>'
        +'<div class="pm-cell"><div class="pm-label">Aprendizajes</div><div class="pm-val">'+apr+'</div></div>'
        +'<div class="pm-cell"><div class="pm-label">Bloqueos</div><div class="pm-val" style="color:'+(blq>0?'var(--coral)':'var(--teal)')+'">'+(blq>0?blq:'✓')+'</div></div>'
      +'</div>'
      +'<div class="proj-footer">'
        +'<span style="font-size:11px;color:var(--text3)">'+(miembros.length?miembros.length+' miembros':'Sin miembros')+'</span>'
        +'<button class="btn-link" style="margin-top:0;font-size:11px" onclick="irMentorProy(proyectos['+i+'].nombre)">🧠 Ver mentorias</button>'
      +'</div>'
      +'</div>';
  }).join('');
  updSelects();
  renderProyRanking();
  renderMentorCards(null);
}
