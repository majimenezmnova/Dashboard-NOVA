// DASHBOARD
function renderDash(){
  var now=new Date(),nD=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var sD=new Date(2026,6,1),eD=new Date(2026,11,1);
  var tDy=Math.round((eD-sD)/86400000),pDy=Math.max(0,Math.round((nD-sD)/86400000));
  var rDy=Math.max(0,Math.round((eD-nD)/86400000)); // días desde HOY hasta 1 dic
  var pct=Math.min(100,Math.round(pDy/tDy*100));
  var tP=10,pC=Math.floor(pDy/15),pR=Math.max(0,tP-pC),rPos=tP*9; // siempre 90
  var rH=TEAM.reduce(function(s,m){return s+(m.reportado_count||0);},0);
  var mL=monL(now),mD=monD(now);
  // hSem: horas del usuario actual esta semana (T12:00:00 evita bugs de timezone)
  var hSem=userHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=mL&&d<=mD;}).reduce(function(s,h){return s+h.horas;},0);
  // hTot: suma de perfiles (fuente de verdad para totales de equipo — no sumar userHoras para evitar doble conteo)
  var hTot=TEAM.reduce(function(s,m){return s+m.horas;},0);
  var eTot=TEAM.reduce(function(s,m){return s+m.ingresos;},0);
  var isFut=nD<sD;

  function si(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  si('k-hs',hSem.toFixed(1)+'h');si('k-hsr',fmtSem(now));si('k-ht',hTot.toFixed(1)+'h');
  si('k-p',proyectos.length);si('k-es','0€');si('k-esr',fmtSem(now));si('k-et',eTot.toLocaleString('es-ES')+'€');
  si('hero-sub',rDy+' días para el viaje · '+pR+' períodos restantes · 1 jul → 1 dic 2026');
  si('pct-v',pct+'%');document.getElementById('pb-v').style.width=pct+'%';
  si('c-dp',pDy);si('c-dr',rDy);si('c-pr',pR);si('c-rh',rH);si('c-rp',rH+'/90');

  var pE=Math.min(100,Math.round(eTot/30000*100));
  var objR=90, pRep=Math.min(100,Math.round(rH/objR*100));
  si('pb-e-txt',eTot.toLocaleString('es-ES')+'€');document.getElementById('pb-e').style.width=pE+'%';
  si('pb-r-obj',objR);si('pb-r-txt',rH+'/'+objR);document.getElementById('pb-r').style.width=pRep+'%';

  if(pC<tP){
    var ns=new Date(2026,6,1+pC*15),ne=new Date(ns);ne.setDate(ne.getDate()+14);
    var f=function(d){return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});};
    si('tl-next',isFut?'Empieza el 1 jul 2026':'P'+(pC+1)+': '+f(ns)+' → '+f(ne));
  }
  renderTL(pC,tP);

  var blq=TEAM.filter(function(m){return m.bloqueo;});
  var db=document.getElementById('db-blq');
  if(db)db.innerHTML=blq.length?blq.map(function(m){return '<div class="blq">⚠️<div><strong>'+USERS[m.email].name+'</strong> — '+m.bloqueo+'</div></div>';}).join(''):'<div style="font-size:12px;color:var(--text3);padding:4px 0">Sin bloqueos 🎉</div>';
  var dl=document.getElementById('db-lgr');
  if(dl)dl.innerHTML='<div style="font-size:12px;color:var(--text3);padding:4px 0">Los logros aparecerán desde julio 🏅</div>';

  renderFin();renderMoodHist();renderPodium('db-podium',3);
}

// TIMELINE
function renderTL(done,total){
  var tl=document.getElementById('tl-row');if(!tl)return;
  var items=[];
  for(var i=0;i<=total;i++){
    var d=new Date(2026,6,1);d.setDate(d.getDate()+i*15);
    if(d>new Date(2026,11,1))break;
    var st=i<done?'done':i===done?'act':'fut';
    items.push({lbl:i===0?'Inicio':i===total?'✈':'P'+i,date:d.toLocaleDateString('es-ES',{day:'numeric',month:'short'}),st:st,badge:i<done?'✓':i===done?'Ahora':null});
  }
  tl.innerHTML=items.map(function(it,i){
    var prev=i>0?items[i-1]:null,isLast=i===items.length-1;
    var lb=prev?'<div class="tl-seg '+(prev.st==='done'?'done':prev.st==='act'?'act':'')+'"></div>':'';
    var la=!isLast?'<div class="tl-seg '+(it.st==='done'?'done':it.st==='act'?'act':'')+'"></div>':'';
    return '<div class="tl-col"><div class="tl-lbl">'+it.lbl+'</div><div class="tl-row">'+lb+'<div class="tl-dot '+it.st+'"></div>'+la+'</div><div class="tl-date">'+it.date+'</div>'+(it.badge?'<div class="tl-badge '+it.st+'">'+it.badge+'</div>':'')+'</div>';
  }).join('');
}

// CHARTS
var COLS=['#7F77DD','#1D9E75','#D85A30','#378ADD','#EF9F27','#B4B2A9','#CE7BC7','#E24B4A'];
function getHPer(f){
  var now=new Date(),src=allHoras; // allHoras tiene datos de todo el equipo
  if(f==='sem'){var a=monL(now),b=monD(now);src=allHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=a&&d<=b;});}
  else if(f==='mes'){var y=now.getFullYear(),m2=now.getMonth();var a=new Date(y,m2,1),b=new Date(y,m2+1,0,23,59,59);src=allHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=a&&d<=b;});}
  return Object.keys(USERS).map(function(e){
    if(f==='tot'){var t=TEAM.find(function(m){return m.email===e;});return t?t.horas:0;}
    return src.filter(function(h){return h.email===e;}).reduce(function(s,h){return s+h.horas;},0);
  });
}
function getHProj(f){
  var now=new Date(),src=allHoras,byP={}; // allHoras tiene datos de todo el equipo
  if(f==='sem'){var a=monL(now),b=monD(now);src=allHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=a&&d<=b;});}
  else if(f==='mes'){var y=now.getFullYear(),m2=now.getMonth();var a=new Date(y,m2,1),b=new Date(y,m2+1,0,23,59,59);src=allHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=a&&d<=b;});}
  if(f==='tot')TEAM.forEach(function(m){if(m.proyecto)byP[m.proyecto]=(byP[m.proyecto]||0)+m.horas;});
  src.forEach(function(h){if(h.proyecto)byP[h.proyecto]=(byP[h.proyecto]||0)+h.horas;});
  return byP;
}
function renderCharts(){
  var isDark=matchMedia('(prefers-color-scheme:dark)').matches;
  var tC=isDark?'rgba(255,255,255,.45)':'rgba(0,0,0,.38)',gC=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)';
  // Per personas
  var cpEl=document.getElementById('ch-per');
  if(cpEl){
    var names=Object.values(USERS).map(function(u){return u.name;}),horas=getHPer(cf.per);
    if(charts['per']){charts['per'].data.labels=names;charts['per'].data.datasets[0].data=horas;charts['per'].update();}
    else charts['per']=new Chart(cpEl,{type:'bar',data:{labels:names,datasets:[{label:'h',data:horas,backgroundColor:'#7F77DD',borderRadius:4,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:function(c){return c[0].label;},label:function(c){return ' '+c.raw+'h';}}}},scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10},maxRotation:45}},y:{grid:{color:gC},ticks:{color:tC,font:{size:10}},beginAtZero:true}}}});
  }
  // 📁 Por proyecto
  var ppEl=document.getElementById('ch-proj');
  if(ppEl){
    var byP=getHProj(cf.proj),labels=Object.keys(byP),data=Object.values(byP);
    var leg=document.getElementById('leg-proj');
    if(!labels.length){if(leg)leg.innerHTML='<span style="color:var(--text3);font-size:11px">Sin proyectos aún</span>';if(charts['proj']){charts['proj'].data.labels=[];charts['proj'].data.datasets[0].data=[];charts['proj'].update();}return;}
    if(charts['proj']){charts['proj'].data.labels=labels;charts['proj'].data.datasets[0].data=data;charts['proj'].data.datasets[0].backgroundColor=COLS.slice(0,labels.length);charts['proj'].update();}
    else charts['proj']=new Chart(ppEl,{type:'doughnut',data:{labels:labels,datasets:[{data:data,backgroundColor:COLS.slice(0,labels.length),borderWidth:2,borderColor:isDark?'#1a1a18':'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return ' '+c.label+': '+c.raw+'h';}}}}}});
    if(leg)leg.innerHTML=labels.map(function(l,i){return '<span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:'+COLS[i]+';flex-shrink:0"></span>'+l+'</span>';}).join('');
  }
  // Mood
  if(MOOD_HIST.length){
    var cmEl=document.getElementById('ch-mood');
    if(cmEl){
      var proms=MOOD_HIST.map(function(p){var v=p.valores.filter(function(x){return x>0;});return v.length?Math.round(v.reduce(function(a,b){return a+b;},0)/v.length*10)/10:0;});
      if(charts['mood']){charts['mood'].data.labels=MOOD_HIST.map(function(p){return p.label;});charts['mood'].data.datasets[0].data=proms;charts['mood'].update();}
      else charts['mood']=new Chart(cmEl,{type:'line',data:{labels:MOOD_HIST.map(function(p){return p.label;}),datasets:[{data:proms,borderColor:'#534AB7',backgroundColor:'rgba(83,74,183,.08)',borderWidth:2,pointBackgroundColor:'#534AB7',pointRadius:4,tension:0.4,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10}}},y:{grid:{color:gC},ticks:{color:tC,font:{size:10},stepSize:1},min:1,max:5}}}});
    }
  }
}
function setCF(chart,f,btn){
  cf[chart]=f;
  btn.closest('.ct').querySelectorAll('.fb').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  renderCharts();
}

// MOOD HIST
function renderMoodHist(){
  var el=document.getElementById('mood-hist');if(!el)return;
  if(!MOOD_HIST.length){el.innerHTML='<div style="font-size:12px;color:var(--text3)">Los datos de mood aparecerán al reportar desde julio 🚀</div>';return;}
  var proms=MOOD_HIST.map(function(p){var v=p.valores.filter(function(x){return x>0;});return v.length?Math.round(v.reduce(function(a,b){return a+b;},0)/v.length*10)/10:0;});
  var ult=proms[proms.length-1],e=ult>=4.5?'🔥':ult>=3.5?'😊':ult>=2.5?'🙂':ult>=1.5?'😐':'😔';
  el.innerHTML='<div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">'+e+'</span><div><div style="font-size:13px;font-weight:600">'+ult+'/5</div><div style="font-size:10px;color:var(--text3)">Último período</div></div></div>';
}

// TRACKER FIN
function renderFin(){
  var datos=proyectos.map(function(p){
    var ing=TEAM.filter(function(m){return m.proyecto===p.nombre;}).reduce(function(s,m){return s+m.ingresos;},0);
    return {nombre:p.nombre,ingresos:ing,gastos:0,beneficio:ing};
  });
  var tB=datos.reduce(function(s,d){return s+d.beneficio;},0);
  var fl=document.getElementById('fin-lbl');if(fl)fl.textContent='beneficio: '+(tB>=0?'+':'')+tB.toLocaleString('es-ES')+'€';
  var tb=document.getElementById('fin-tbody'),tf=document.getElementById('fin-tfoot');if(!tb)return;
  tb.innerHTML=datos.length?datos.map(function(d){
    return '<tr><td><span class="tag tp" style="font-size:10px">'+d.nombre+'</span></td>'
      +'<td style="text-align:right;font-size:12px;color:#3B6D11">'+(d.ingresos>0?'+'+d.ingresos.toLocaleString('es-ES')+'€':'<span style="color:var(--text3)">—</span>')+'</td>'
      +'<td style="text-align:right;font-size:12px;color:#A32D2D"><span style="color:var(--text3)">—</span></td>'
      +'<td style="text-align:right;font-size:12px;'+colB(d.beneficio)+'">'+fmtE(d.beneficio)+'</td></tr>';
  }).join(''):'<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:1rem;font-size:12px">Crea proyectos para ver el tracker</td></tr>';
  var tI=datos.reduce(function(s,d){return s+d.ingresos;},0);
  if(tf)tf.innerHTML=datos.length?'<tr style="border-top:2px solid var(--border2)"><td style="font-size:12px;font-weight:600;padding:8px">Total</td><td style="text-align:right;font-size:12px;font-weight:600;color:#3B6D11;padding:8px">'+(tI>0?'+'+tI.toLocaleString('es-ES')+'€':'—')+'</td><td style="text-align:right;padding:8px">—</td><td style="text-align:right;font-size:13px;font-weight:700;padding:8px;'+colB(tB)+'">'+fmtE(tB)+'</td></tr>':'';
}

// RACHA CALOR
function renderRacha(){
  var wrap=document.getElementById('racha-grid');if(!wrap)return;
  var start=new Date(2026,6,1),end=new Date(2026,11,1);
  var now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var startMon=monL(start),semanas=[],cursor=new Date(startMon);
  while(cursor<=end){var sem=[];for(var d=0;d<7;d++){var dia=new Date(cursor);dia.setDate(dia.getDate()+d);sem.push(new Date(dia));}semanas.push(sem);cursor.setDate(cursor.getDate()+7);}
  var activ={};userHoras.forEach(function(h){activ[h.fecha]=(activ[h.fecha]||0)+1;});
  var COLS2=['var(--bg3)','#C0DD97','#97C459','#639922','#3B6D11'];
  function gc(c){return c===0?COLS2[0]:c<=2?COLS2[1]:c<=4?COLS2[2]:c<=6?COLS2[3]:COLS2[4];}
  var cWrap=document.getElementById('racha-grid-wrap')||wrap.parentElement;
  var avail=Math.max(300,(cWrap?cWrap.offsetWidth:800)-36);
  var GAP=2,cs=Math.max(8,Math.floor((avail-(semanas.length-1)*GAP)/semanas.length)),fs=Math.max(8,Math.min(11,cs-3));
  var meses=['Jul','Ago','Sep','Oct','Nov','Dic'];
  var html='<div style="display:flex;gap:'+GAP+'px;align-items:flex-start;width:100%">';
  html+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;margin-right:4px;padding-top:'+(cs+GAP+2)+'px;flex-shrink:0">';
  ['L','M','X','J','V','S','D'].forEach(function(d){html+='<div style="width:'+cs+'px;height:'+cs+'px;font-size:'+fs+'px;color:var(--text3);line-height:'+cs+'px;text-align:center">'+d+'</div>';});
  html+='</div>';
  semanas.forEach(function(sem){
    var fd=sem[0],ml=fd.getDate()<=7?(meses[fd.getMonth()-6]||''):'';
    html+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;flex:1;max-width:'+cs+'px;min-width:'+cs+'px">';
    html+='<div style="font-size:'+fs+'px;color:var(--text3);height:'+cs+'px;line-height:'+cs+'px;text-align:center;overflow:hidden">'+ml+'</div>';
    sem.forEach(function(dia){
      var key=dia.getFullYear()+'-'+String(dia.getMonth()+1).padStart(2,'0')+'-'+String(dia.getDate()).padStart(2,'0');
      var before=dia<start,after=dia>end,future=dia>today,cnt=activ[key]||0;
      var bg='transparent',border='transparent';
      if(!before&&!after){if(future){bg='var(--bg3)';border='var(--border)';}else{bg=gc(cnt);border=cnt>0?'transparent':'var(--border)';}}
      html+='<div style="width:'+cs+'px;height:'+cs+'px;border-radius:2px;background:'+bg+';border:1px solid '+border+'"></div>';
    });
    html+='</div>';
  });
  html+='</div>';
  wrap.innerHTML=html;
  var leg=document.getElementById('racha-leg');
  if(leg)leg.innerHTML=COLS2.map(function(c){return '<div style="width:14px;height:14px;border-radius:3px;background:'+c+';border:1px solid var(--border)"></div>';}).join('');
  var stats=document.getElementById('racha-stats');
  if(stats){var activos=Object.keys(activ).filter(function(k){var d=new Date(k);return d>=start&&d<=today;}).length;stats.textContent=today<start?'Empieza el 1 jul 2026':activos+' días activos';}
}

// PODIUM
function renderPodium(id,count){
  var sorted=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;}).slice(0,count);
  var pc=['p1','p2','p3'],cr=['👑','🥈','🥉'],pl=['1.º','2.º','3.º'];
  var el=document.getElementById(id);if(!el)return;
  el.innerHTML=sorted.map(function(m,i){
    var u=USERS[m.email],p=pts(m).total;
    return '<div class="pod '+pc[i]+'"><div class="pod-crown">'+cr[i]+'</div><div class="pod-pos '+pc[i]+'">'+pl[i]+' puesto</div>'
      +'<div class="av '+u.av+'" style="width:36px;height:36px;font-size:13px;margin:0 auto">'+u.ini+'</div>'
      +'<div class="pod-name">'+u.name+'</div><div class="pod-pts">'+p+' pts</div>'
      +'<div class="pod-sub">'+m.horas+'h · '+m.ingresos+'€</div>'
      +'<div class="pod-mote">'+MOTES[i]+'</div></div>';
  }).join('');
}
