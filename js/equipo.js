// ══ EQUIPO + INFORME ══
function renderEquipo(){
  var el=document.getElementById('eq-list');if(!el)return;
  var sorted=[].concat(TEAM);
  var eqSortMode=window._eqSort||'ranking';
  if(eqSortMode==='horas') sorted.sort(function(a,b){return b.horas-a.horas;});
  else if(eqSortMode==='ingresos') sorted.sort(function(a,b){return b.ingresos-a.ingresos;});
  else if(eqSortMode==='alfa') sorted.sort(function(a,b){return USERS[a.email].name.localeCompare(USERS[b.email].name);});
  else sorted.sort(function(a,b){return pts(b).total-pts(a).total;});

  var totalPeriodos=10;
  var now=new Date(),nD=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var sD=new Date(2026,6,1);
  var pDy=Math.max(0,Math.round((nD-sD)/86400000));
  var pComp=Math.floor(pDy/15);

  el.innerHTML=sorted.map(function(m,idx){
    var u=USERS[m.email];
    var p=pts(m);
    var sortedAll=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;});
    var posRank=sortedAll.findIndex(function(x){return x.email===m.email;})+1;
    var moodStr=m.mood?(moodEmojis[m.mood]||''):'—';
    var ehVal=m.horas>0?Math.round(m.ingresos/m.horas*10)/10:0;
    var totalH=m.horas;
    var fc=FASE_CONFIG&&m.proyecto?(function(){var proy=proyectos.find(function(x){return x.nombre===m.proyecto;});return proy?FASE_CONFIG[proy.estado]:null;})():null;
    var repStatusColor=m.reportado?'var(--teal)':'var(--red)';
    var repStatusText=m.reportado?'Reporte entregado':'Reporte pendiente';
    var dotsHtml='<span style="font-size:10px;color:var(--text3);margin-right:4px">Períodos:</span>';
    for(var pi=0;pi<totalPeriodos;pi++){
      var cls=pi<pComp?(m.reportado&&pi===pComp-1?'ok':'ok'):'fut';
      if(pi===pComp) cls='pend';
      dotsHtml+='<div class="eq-rep-dot '+cls+'">'+(pi+1)+'</div>';
    }
    return '<div class="eq-person-card">'
      +'<div class="eq-person-header">'
        +'<div class="av '+u.av+'" style="width:44px;height:44px;font-size:15px;flex-shrink:0">'+u.ini+'</div>'
        +'<div style="flex:1;min-width:0">'
          +'<div style="display:flex;align-items:center;gap:8px">'
            +'<div class="eq-person-name">'+u.name+'</div>'
            +'<span style="font-size:10px;background:var(--purple-l);color:var(--purple-d);padding:2px 8px;border-radius:20px;font-weight:600">#'+posRank+' ranking</span>'
            +(m.mood?'<span style="font-size:16px">'+moodStr+'</span>':'')
          +'</div>'
          +'<div class="eq-person-role">'+(u.role==='junta'?'Junta directiva':'Miembro')+(m.proyecto?' · '+m.proyecto:'')+'</div>'
          +(m.bloqueo?'<div style="font-size:11px;color:var(--coral);margin-top:3px">⚠ Bloqueo: '+m.bloqueo+'</div>':'')
        +'</div>'
        +'<div style="text-align:right;flex-shrink:0">'
          +'<div style="font-size:22px;font-weight:800;color:var(--purple)">'+p.total+'</div>'
          +'<div style="font-size:10px;color:var(--text3)">puntos</div>'
          +'<div style="font-size:11px;font-weight:600;color:'+(m.reportado?'var(--teal)':'var(--red)')+'">●&nbsp;'+repStatusText+'</div>'
        +'</div>'
      +'</div>'
      +'<div class="eq-kpi-row">'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">Horas tot.</div><div class="eq-kpi-val" style="color:var(--purple)">'+totalH.toFixed(1)+'h</div></div>'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">Ingresos</div><div class="eq-kpi-val" style="color:var(--teal)">'+m.ingresos.toLocaleString('es-ES')+'€</div></div>'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">€/hora</div><div class="eq-kpi-val" style="color:'+(ehVal>0?'var(--amber)':'var(--text3)')+'">'+( ehVal>0?ehVal+'€':'—')+'</div></div>'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">Reportes</div><div class="eq-kpi-val">'+m.reportado_count+'/'+(pComp||0)+'</div></div>'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">Racha</div><div class="eq-kpi-val">'+m.racha+'</div><div class="eq-kpi-sub">períodos</div></div>'
        +'<div class="eq-kpi"><div class="eq-kpi-lbl">Bloqueos</div><div class="eq-kpi-val" style="color:'+(m.bloqueo?'var(--coral)':'var(--teal)')+'">'+( m.bloqueo?'1':'0')+'</div></div>'
      +'</div>'
      +'<div class="eq-rep-dots">'+dotsHtml+'</div>'
      +(m.bloqueo?'<div class="eq-blq">⚠️<span>'+m.bloqueo+'</span></div>':'')
      +'</div>';
  }).join('');
}

function setEqSort(mode, btn){
  window._eqSort=mode;
  ['eq-sort-rank','eq-sort-hrs','eq-sort-ing','eq-sort-alfa'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderEquipo();
}

var _infFilter='equipo', _infProy='todos', _infRango='sem';

function setInfFilter(f, btn){
  _infFilter=f;
  document.querySelectorAll('#inf-persona-btns .fb, #inf-f-eq').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderInforme();
}
function setInfProy(p, btn){
  _infProy=p;
  document.querySelectorAll('#inf-proy-btns .fb, #inf-fp-todos').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderInforme();
}
function setInfRango(r, btn){
  _infRango=r;
  ['inf-fr-sem','inf-fr-mes','inf-fr-todo','inf-fr-per'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  var cust=document.getElementById('inf-rango-custom');
  if(cust)cust.style.display=r==='per'?'flex':'none';
  if(r!=='per')renderInforme();
}

function getInfRangoFechas(){
  var now=new Date();
  if(_infRango==='sem'){
    var l=monL(now),d=monD(now);return {desde:l,hasta:d};
  }
  if(_infRango==='mes'){
    return {desde:new Date(now.getFullYear(),now.getMonth(),1),hasta:new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59)};
  }
  if(_infRango==='todo'){
    return {desde:new Date(2026,6,1),hasta:new Date(2026,11,1)};
  }
  if(_infRango==='per'){
    var d=document.getElementById('inf-desde').value,h=document.getElementById('inf-hasta').value;
    return {desde:d?new Date(d):new Date(2026,6,1),hasta:h?new Date(h+'T23:59:59'):now};
  }
  return {desde:new Date(2026,6,1),hasta:now};
}

function renderInforme(){
  var pb=document.getElementById('inf-persona-btns');
  if(pb&&!pb.children.length){
    pb.innerHTML=Object.keys(USERS).map(function(email){
      var u=USERS[email];
      return '<button class="fb" onclick="setInfFilter(\''+email+'\',this)">'+u.name+'</button>';
    }).join('');
  }
  var pryb=document.getElementById('inf-proy-btns');
  if(pryb){
    pryb.innerHTML=proyectos.map(function(p,pi){
      return '<button class="fb '+((_infProy===p.nombre)?'on':'')+'" onclick="setInfProy(\''+p.nombre+'\',this)">'+p.nombre+'</button>';
    }).join('');
  }

  var rng=getInfRangoFechas();
  var isPersona=(_infFilter!=='equipo');

  var horasFiltro=allHoras.filter(function(h){
    var d=new Date(h.fecha+'T12:00:00');
    if(d<rng.desde||d>rng.hasta)return false;
    if(isPersona&&h.email!==_infFilter)return false;
    if(_infProy!=='todos'&&h.proyecto!==_infProy)return false;
    return true;
  });

  var teamFiltro=isPersona?TEAM.filter(function(m){return m.email===_infFilter;}):TEAM.slice();
  if(_infProy!=='todos'){
    teamFiltro=teamFiltro.filter(function(m){return m.proyecto===_infProy;});
  }

  var totalH=teamFiltro.reduce(function(s,m){return s+m.horas;},0)+horasFiltro.reduce(function(s,h){return s+h.horas;},0);
  var totalIng=teamFiltro.reduce(function(s,m){return s+m.ingresos;},0);
  var repHechos=teamFiltro.filter(function(m){return m.reportado;}).length;
  var totalReps=teamFiltro.length;
  var ehCol=totalH>0?Math.round(totalIng/totalH*10)/10:0;
  var blqCount=teamFiltro.filter(function(m){return m.bloqueo;}).length;

  var kpiData=[
    {val:totalH.toFixed(1)+'h',lbl:'Horas totales',sub:'período seleccionado',bg:'var(--purple-l)',color:'var(--purple)'},
    {val:totalIng.toLocaleString('es-ES')+'€',lbl:'Ingresos totales',sub:'generados',bg:'var(--teal-l)',color:'var(--teal)'},
    {val:repHechos+'/'+totalReps,lbl:'Reportes',sub:'entregados',bg:'var(--amber-l)',color:'var(--amber)'},
    {val:ehCol>0?ehCol+'€/h':'—',lbl:'€/hora medio',sub:'equipo',bg:'var(--blue-l)',color:'var(--blue)'},
    {val:blqCount,lbl:'Bloqueos activos',sub:'en el período',bg:blqCount>0?'var(--red-l)':'var(--green-l)',color:blqCount>0?'var(--red)':'var(--green)'}
  ];
  var km=document.getElementById('inf-kpis-mega');
  if(km)km.innerHTML=kpiData.map(function(k){
    return '<div class="inf-kpi-mega" style="background:'+k.bg+'">'
      +'<div class="val" style="color:'+k.color+'">'+k.val+'</div>'
      +'<div class="lbl">'+k.lbl+'</div>'
      +'<div class="sub">'+k.sub+'</div>'
      +'</div>';
  }).join('');

  var cont=document.getElementById('inf-contenido'); if(!cont)return;
  var html='';

  var rLbl=_infRango==='sem'?'Esta semana':_infRango==='mes'?'Este mes':_infRango==='todo'?'Todo el verano':'Personalizado';
  var vLbl=isPersona?USERS[_infFilter].name:'Equipo completo';
  var pLbl=_infProy==='todos'?'Todos los proyectos':_infProy;
  html+='<div class="inf-section-title">'+vLbl+' · '+pLbl+' · '+rLbl+'</div>';

  if(isPersona){
    var m=TEAM.find(function(t){return t.email===_infFilter;});
    var u=USERS[_infFilter];
    if(!m||!u){cont.innerHTML='<div class="empty">Sin datos</div>';return;}
    var misH=horasFiltro.reduce(function(s,h){return s+h.horas;},0);
    var ehP=m.horas>0?Math.round(m.ingresos/m.horas*10)/10:0;
    var p=pts(m);
    var sortedAll=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;});
    var posRank=sortedAll.findIndex(function(x){return x.email===_infFilter;})+1;

    html+='<div class="inf-persona-block">'
      +'<div class="ipb-header">'
        +'<div class="av '+u.av+'" style="width:40px;height:40px;font-size:14px;flex-shrink:0">'+u.ini+'</div>'
        +'<div style="flex:1">'
          +'<div style="font-size:15px;font-weight:700">'+u.name+'</div>'
          +'<div style="font-size:12px;color:var(--text2)">'+(m.proyecto||'Sin proyecto asignado')+'</div>'
        +'</div>'
        +'<div style="text-align:right">'
          +'<div style="font-size:20px;font-weight:800;color:var(--purple)">'+p.total+' pts</div>'
          +'<div style="font-size:11px;color:var(--text3)">Posición #'+posRank+' en el ranking</div>'
          +(m.mood?'<div style="font-size:18px;margin-top:3px">'+(moodEmojis[m.mood]||'')+'</div>':'')
        +'</div>'
      +'</div>'
      +'<div class="ipb-metrics">'
        +'<div class="ipm"><div class="ipm-lbl">Horas período</div><div class="ipm-val" style="color:var(--purple)">'+misH.toFixed(1)+'h</div></div>'
        +'<div class="ipm"><div class="ipm-lbl">Horas total</div><div class="ipm-val">'+m.horas.toFixed(0)+'h</div></div>'
        +'<div class="ipm"><div class="ipm-lbl">Ingresos</div><div class="ipm-val" style="color:var(--teal)">'+m.ingresos.toLocaleString('es-ES')+'€</div></div>'
        +'<div class="ipm"><div class="ipm-lbl">€/hora</div><div class="ipm-val" style="color:var(--amber)">'+(ehP>0?ehP+'€':'—')+'</div></div>'
        +'<div class="ipm"><div class="ipm-lbl">Racha</div><div class="ipm-val">'+m.racha+' per.</div></div>'
      +'</div>'
      +'<div style="padding:.75rem 1rem;border-bottom:1px solid var(--border)">'
        +'<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Horas por proyecto en el período</div>'
        +(function(){
            var byP={};horasFiltro.forEach(function(h){byP[h.proyecto]=(byP[h.proyecto]||0)+h.horas;});
            var tot=Object.values(byP).reduce(function(s,v){return s+v;},0)||1;
            if(!Object.keys(byP).length)return '<div style="font-size:12px;color:var(--text3)">Sin registros en este período</div>';
            return Object.entries(byP).sort(function(a,b){return b[1]-a[1];}).map(function(e){
              var pct=Math.round(e[1]/tot*100);
              return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
                +'<div style="width:100px;font-size:12px;color:var(--text2)">'+e[0]+'</div>'
                +'<div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="width:'+pct+'%;height:100%;border-radius:3px;background:var(--purple)"></div></div>'
                +'<div style="font-size:12px;font-weight:600;width:55px;text-align:right">'+e[1].toFixed(1)+'h</div>'
                +'</div>';
            }).join('');
          })()
      +'</div>'
      +(userReportes.filter(function(r){return true;}).length?
        '<div style="padding:.75rem 1rem;border-bottom:1px solid var(--border)">'
          +'<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Últimos reportes</div>'
          +userReportes.slice(0,3).map(function(r){
            return '<div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;color:var(--text2)">'
              +'<div style="display:flex;gap:6px;margin-bottom:2px"><span style="font-weight:600">'+r.periodo+'</span><span class="tag tp" style="font-size:10px">'+r.proyecto+'</span>'+(r.mood?'<span>'+r.mood+'</span>':'')+'</div>'
              +'<div>'+r.avances.slice(0,120)+(r.avances.length>120?'...':'')+'</div>'
              +(r.horas?'<div style="margin-top:2px;color:var(--text3)">'+r.horas+'h registradas'+(r.importe?' · '+r.importe+'€ facturado':'')+'</div>':'')
              +'</div>';
          }).join('')
        +'</div>':'')
      +(m.bloqueo?'<div style="padding:.75rem 1rem;background:var(--amber-l);font-size:12px;color:#633806"><strong>Bloqueo activo:</strong> '+m.bloqueo+'</div>':'')
      +'</div>';

  } else {
    var sortedT=[].concat(teamFiltro).sort(function(a,b){return pts(b).total-pts(a).total;});
    html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px">'
      +sortedT.map(function(m){
          var u=USERS[m.email],p=pts(m);
          var mh=horasFiltro.filter(function(h){return h.email===m.email;}).reduce(function(s,h){return s+h.horas;},0);
          var ehM=m.horas>0?Math.round(m.ingresos/m.horas*10)/10:0;
          return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden">'
            +'<div style="padding:.75rem 1rem;background:var(--bg3);display:flex;align-items:center;gap:8px">'
              +'<div class="av '+u.av+'" style="width:32px;height:32px;font-size:12px;flex-shrink:0">'+u.ini+'</div>'
              +'<div><div style="font-size:13px;font-weight:700">'+u.name+'</div><div style="font-size:10px;color:var(--text3)">'+p.total+' pts</div></div>'
              +(m.mood?'<span style="margin-left:auto;font-size:16px">'+(moodEmojis[m.mood]||'')+'</span>':'')
            +'</div>'
            +'<div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--border)">'
              +'<div style="padding:.5rem .75rem;border-right:1px solid var(--border);text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Horas</div><div style="font-size:15px;font-weight:700;color:var(--purple)">'+mh.toFixed(1)+'h</div></div>'
              +'<div style="padding:.5rem .75rem;text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Ingresos</div><div style="font-size:15px;font-weight:700;color:var(--teal)">'+m.ingresos.toLocaleString('es-ES')+'€</div></div>'
              +'<div style="padding:.5rem .75rem;border-top:1px solid var(--border);border-right:1px solid var(--border);text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">€/h</div><div style="font-size:15px;font-weight:700;color:var(--amber)">'+(ehM>0?ehM+'€':'—')+'</div></div>'
              +'<div style="padding:.5rem .75rem;border-top:1px solid var(--border);text-align:center"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">Reporte</div><div style="font-size:13px;font-weight:700;color:'+(m.reportado?'var(--teal)':'var(--red)')+'\">'+(m.reportado?'✓ OK':'⚠ Pend.')+'</div></div>'
            +'</div>'
            +(m.bloqueo?'<div style="padding:5px 10px;background:var(--amber-l);font-size:11px;color:#633806;border-top:1px solid var(--border)">⚠ '+m.bloqueo+'</div>':'')
            +'</div>';
        }).join('')
      +'</div>';

    if(proyectos.length){
      html+='<div class="inf-section-title">Estado por proyectos</div>';
      html+=proyectos.filter(function(p){return _infProy==='todos'||p.nombre===_infProy;}).map(function(p){
        var fc=FASE_CONFIG?FASE_CONFIG[p.estado]:{label:p.estado,cls:'fase-exp',color:'#534AB7'};
        var miembros=(p.miembros||[]);
        var hrs=horasFiltro.filter(function(h){return h.proyecto===p.nombre;}).reduce(function(s,h){return s+h.horas;},0);
        var ing=miembros.reduce(function(s,e){var m=TEAM.find(function(t){return t.email===e;});return s+(m?m.ingresos:0);},0);
        var blq=miembros.filter(function(e){var m=TEAM.find(function(t){return t.email===e;});return m&&m.bloqueo;}).length;
        var pct=p.meta>0?Math.min(100,Math.round(ing/p.meta*100)):0;
        return '<div class="inf-proy-blk">'
          +'<div class="inf-proy-ph">'
            +'<div><div style="font-size:14px;font-weight:700">'+p.nombre+'</div><div style="font-size:11px;color:var(--text2)">'+miembros.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', ')+'</div></div>'
            +'<span class="proj-fase '+fc.cls+'">'+fc.label+'</span>'
          +'</div>'
          +'<div class="inf-proy-pm">'
            +'<div class="inf-proy-pm-c"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Horas período</div><div style="font-size:17px;font-weight:700;color:var(--purple)">'+hrs.toFixed(1)+'h</div></div>'
            +'<div class="inf-proy-pm-c"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Ingresos</div><div style="font-size:17px;font-weight:700;color:var(--teal)">'+ing.toLocaleString('es-ES')+'€</div></div>'
            +'<div class="inf-proy-pm-c"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Meta</div><div style="font-size:17px;font-weight:700">'+(p.meta>0?pct+'%':'—')+'</div></div>'
            +'<div class="inf-proy-pm-c"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Bloqueos</div><div style="font-size:17px;font-weight:700;color:'+(blq>0?'var(--coral)':'var(--teal)')+'">'+( blq>0?blq:'✓')+'</div></div>'
          +'</div>'
          +(p.meta>0?'<div style="padding:.5rem 1rem;border-top:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:3px"><span>Meta de ingresos</span><span>'+ing.toLocaleString('es-ES')+'€ / '+p.meta.toLocaleString('es-ES')+'€</span></div><div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+fc.color+';border-radius:3px"></div></div></div>':'')
          +'</div>';
      }).join('');
    }

    var conBlq=teamFiltro.filter(function(m){return m.bloqueo;});
    if(conBlq.length){
      html+='<div class="inf-section-title">⚠️ Bloqueos activos del equipo</div>';
      html+='<div class="card">'
        +conBlq.map(function(m){var u=USERS[m.email];return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)"><div class="av '+u.av+'" style="width:26px;height:26px;font-size:10px;flex-shrink:0">'+u.ini+'</div><div><div style="font-size:12px;font-weight:600">'+u.name+'</div><div style="font-size:12px;color:var(--text2)">'+m.bloqueo+'</div></div></div>';}).join('')
        +'</div>';
    }

    var sinRep=teamFiltro.filter(function(m){return !m.reportado;});
    if(sinRep.length){
      html+='<div class="inf-section-title">⏳ Sin reporte</div>';
      html+='<div class="card" style="display:flex;gap:8px;flex-wrap:wrap">'
        +sinRep.map(function(m){var u=USERS[m.email];return '<div style="display:flex;align-items:center;gap:6px;background:var(--red-l);border-radius:var(--r);padding:5px 10px"><div class="av '+u.av+'" style="width:22px;height:22px;font-size:9px;flex-shrink:0">'+u.ini+'</div><span style="font-size:12px;font-weight:600">'+u.name+'</span></div>';}).join('')
        +'</div>';
    }
  }

  cont.innerHTML=html;
}
