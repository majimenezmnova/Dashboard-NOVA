// ══ TRACKER DE HORAS ══
var _timerActivo=false, _timerInicio=null, _timerInterval=null;
var _hdFilter='yo', _hdRange='sem', _hdSort='desc';
var _semOffset=0;

function getFechaStr(d){ return d.toISOString().slice(0,10); }
function getLunes(d){ var r=new Date(d); r.setDate(r.getDate()-((r.getDay()+6)%7)); r.setHours(0,0,0,0); return r; }
function getDomingo(d){ var r=getLunes(d); r.setDate(r.getDate()+6); r.setHours(23,59,59,999); return r; }

(function(){
  function upd(){
    var ini=document.getElementById('hc-ini');
    var fin=document.getElementById('hc-fin');
    var dur=document.getElementById('hc-duracion');
    if(!ini||!fin||!dur) return;
    var [ih,im]=(ini.value||'09:00').split(':').map(Number);
    var [fh,fm]=(fin.value||'10:00').split(':').map(Number);
    var mins=(fh*60+fm)-(ih*60+im);
    if(mins<=0){dur.textContent='—';return;}
    dur.textContent=Math.floor(mins/60)+'h '+String(mins%60).padStart(2,'0')+'m';
  }
  setTimeout(function(){
    var ini=document.getElementById('hc-ini');
    var fin=document.getElementById('hc-fin');
    if(ini) ini.addEventListener('change',upd);
    if(fin) fin.addEventListener('change',upd);
    upd();
  },500);
})();

function setHMode(m){
  var pm=document.getElementById('hc-panel-manual');
  var pt=document.getElementById('hc-panel-timer');
  var bm=document.getElementById('hc-mode-manual');
  var bt=document.getElementById('hc-mode-timer');
  if(m==='manual'){
    if(pm)pm.style.display='flex'; if(pt)pt.style.display='none';
    if(bm){bm.style.background='var(--purple-l)';bm.style.color='var(--purple-d)';}
    if(bt){bt.style.background='';bt.style.color='';}
  } else {
    if(pm)pm.style.display='none'; if(pt)pt.style.display='flex';
    if(bt){bt.style.background='var(--purple-l)';bt.style.color='var(--purple-d)';}
    if(bm){bm.style.background='';bm.style.color='';}
  }
}

function addEntradaManual(){
  if(!cu) return;
  var iniEl=document.getElementById('hc-ini');
  var finEl=document.getElementById('hc-fin');
  var fechaEl=document.getElementById('hc-fecha');
  if(!iniEl||!finEl) return;
  var ini=iniEl.value||'09:00', fin=finEl.value||'10:00';
  var parts_i=ini.split(':').map(Number), parts_f=fin.split(':').map(Number);
  var ih=parts_i[0],im=parts_i[1],fh=parts_f[0],fm=parts_f[1];
  var mins=(fh*60+fm)-(ih*60+im);
  if(mins<=0){var err=document.getElementById('hc-error');if(err){err.style.display='flex';err.textContent='⚠️ La hora de fin debe ser posterior al inicio';setTimeout(function(){err.style.display='none';},3000);}return;}
  var h=Math.round(mins/60*100)/100;
  var desc=(document.getElementById('hc-desc')||{}).value||'';
  var proy=(document.getElementById('hc-proy')||{}).value||'';
  var fecha=fechaEl?fechaEl.value:getFechaStr(new Date());
  var horaObj={email:cu.email,proyecto:proy,descripcion:desc,horas:h,fecha:fecha,ini:ini,fin:fin,id:'local_'+Date.now()};
  var me=TEAM.find(function(t){return t.email===cu.email;});
  if(me) me.horas=Math.round((me.horas+h)*100)/100;
  allHoras.unshift(horaObj);
  userHoras.unshift(horaObj);
  renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash(); renderEH();
  if(document.getElementById('hc-desc'))document.getElementById('hc-desc').value='';
  DB.insertHora({email:cu.email,proyecto:proy,descripcion:desc,horas:h,fecha:fecha,hora_ini:ini,hora_fin:fin}).then(function(data){
    if(data){
      horaObj.id=data.id;
      if(me) DB.updatePerfil(cu.email,{horas:me.horas});
      updateBadgesEspeciales();
    } else {
      var idx=userHoras.findIndex(function(x){return x===horaObj;});
      if(idx>=0) userHoras.splice(idx,1);
      var aIdx=allHoras.findIndex(function(x){return x===horaObj;});
      if(aIdx>=0) allHoras.splice(aIdx,1);
      if(me) me.horas=Math.round(Math.max(0,me.horas-h)*100)/100;
      var errEl=document.getElementById('hc-error');
      if(errEl){errEl.style.display='flex';errEl.textContent='⚠️ Error al guardar en la base de datos. Revisa la consola.';setTimeout(function(){errEl.style.display='none';},5000);}
      renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash();
    }
  }).catch(function(e){
    console.error('Error guardando hora:', e);
    var idx=userHoras.findIndex(function(x){return x===horaObj;});
    if(idx>=0) userHoras.splice(idx,1);
    var aIdx=allHoras.findIndex(function(x){return x===horaObj;});
    if(aIdx>=0) allHoras.splice(aIdx,1);
    if(me) me.horas=Math.round(Math.max(0,me.horas-h)*100)/100;
    var errEl=document.getElementById('hc-error');
    if(errEl){errEl.style.display='flex';errEl.textContent='⚠️ Error de conexión al guardar.';setTimeout(function(){errEl.style.display='none';},5000);}
    renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash();
  });
}

function toggleTimer(){
  if(!cu) return;
  var btn=document.getElementById('hc-timer-btn');
  var row=document.getElementById('hc-timer-row');
  if(!_timerActivo){
    _timerActivo=true; _timerInicio=Date.now();
    if(btn){btn.textContent='🔴';btn.title='Timer activo';}
    if(row)row.style.display='flex';
    var sl=document.getElementById('hc-timer-start-lbl');
    if(sl)sl.textContent='Iniciado a las '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    _timerInterval=setInterval(function(){
      var secs=Math.floor((Date.now()-_timerInicio)/1000);
      var hh=Math.floor(secs/3600),mm=Math.floor((secs%3600)/60),ss=secs%60;
      var el=document.getElementById('hc-timer-display');
      if(el)el.textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
    },1000);
  } else {
    clearInterval(_timerInterval); _timerActivo=false;
    var horas=Math.round((Date.now()-_timerInicio)/36000)/100;
    var ini=new Date(_timerInicio).toTimeString().slice(0,5);
    var fin=new Date().toTimeString().slice(0,5);
    var desc=(document.getElementById('hc-desc')||{}).value||'';
    var proy=(document.getElementById('hc-proy')||{}).value||'';
    var fecha=getFechaStr(new Date());
    var horaObj={email:cu.email,proyecto:proy,descripcion:desc,horas:horas,fecha:fecha,ini:ini,fin:fin,id:'local_'+Date.now()};
    var me=TEAM.find(function(t){return t.email===cu.email;});
    if(me) me.horas=Math.round((me.horas+horas)*100)/100;
    allHoras.unshift(horaObj);
    userHoras.unshift(horaObj);
    if(btn){btn.textContent='⏱️';btn.title='Timer';}
    if(row)row.style.display='none';
    var disp=document.getElementById('hc-timer-display');if(disp)disp.textContent='00:00:00';
    _timerInicio=null;
    renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash(); renderEH();
    DB.insertHora({email:cu.email,proyecto:proy,descripcion:desc,horas:horas,fecha:fecha,hora_ini:ini,hora_fin:fin}).then(function(data){
      if(data){
        horaObj.id=data.id;
        if(me) DB.updatePerfil(cu.email,{horas:me.horas});
        updateBadgesEspeciales();
      } else {
        var idx=userHoras.findIndex(function(x){return x===horaObj;});
        if(idx>=0) userHoras.splice(idx,1);
        var aIdx=allHoras.findIndex(function(x){return x===horaObj;});
        if(aIdx>=0) allHoras.splice(aIdx,1);
        if(me) me.horas=Math.round(Math.max(0,me.horas-horas)*100)/100;
        var errEl=document.getElementById('hc-error');
        if(errEl){errEl.style.display='flex';errEl.textContent='⚠️ Error al guardar en la base de datos.';setTimeout(function(){errEl.style.display='none';},5000);}
        renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash();
      }
    }).catch(function(e){
      console.error('Error guardando timer:', e);
      var idx=userHoras.findIndex(function(x){return x===horaObj;});
      if(idx>=0) userHoras.splice(idx,1);
      var aIdx=allHoras.findIndex(function(x){return x===horaObj;});
      if(aIdx>=0) allHoras.splice(aIdx,1);
      if(me) me.horas=Math.round(Math.max(0,me.horas-horas)*100)/100;
      renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash();
    });
  }
}

function navSemana(dir){_semOffset+=dir;renderHCRegistrar();}

function renderHCRegistrar(){
  var base=new Date(); base.setDate(base.getDate()+_semOffset*7);
  var lun=getLunes(base), dom=getDomingo(base);
  var lunStr=lun.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
  var domStr=dom.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
  var label=_semOffset===0?'Esta semana':lunStr+' – '+domStr;
  var sl=document.getElementById('hc-sem-label');if(sl)sl.textContent=label;
  var src=userHoras.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=lun&&d<=dom;});
  var tot=src.reduce(function(s,h){return s+h.horas;},0);
  var st=document.getElementById('hc-sem-total');
  if(st)st.textContent=Math.floor(tot)+'h '+String(Math.round((tot%1)*60)).padStart(2,'0')+'m';
  var el=document.getElementById('hc-entradas-list');if(!el)return;
  if(!src.length){el.innerHTML='<div class="empty">⏱️<p>Sin entradas esta semana. Usa la barra de arriba para registrar.</p></div>';return;}
  var byDay={};
  src.forEach(function(h){(byDay[h.fecha]=byDay[h.fecha]||[]).push(h);});
  var days=Object.keys(byDay).sort().reverse();
  var COLS=['#534AB7','#1D9E75','#EF9F27','#E24B4A','#378ADD','#D85A30'];
  var proyColMap={};
  proyectos.forEach(function(p,i){proyColMap[p.nombre]=COLS[i%COLS.length];});
  el.innerHTML=days.map(function(fecha){
    var entries=byDay[fecha];
    var dayTot=entries.reduce(function(s,h){return s+h.horas;},0);
    var d=new Date(fecha+'T12:00:00');
    var dayLabel=d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
    var dayH=Math.floor(dayTot),dayM=Math.round((dayTot%1)*60);
    return '<div style="margin-bottom:12px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg3);border-radius:var(--r);margin-bottom:4px">'
        +'<span style="font-size:12px;font-weight:600;color:var(--text2)">'+dayLabel+'</span>'
        +'<span style="font-size:12px;font-weight:700;color:var(--text2)">Total: '+String(dayH).padStart(2,'0')+':'+String(dayM).padStart(2,'0')+':00</span>'
      +'</div>'
      +entries.map(function(h){
        var col=proyColMap[h.proyecto]||'#9B9B9B';
        var dur=h.horas;var dh=Math.floor(dur),dm=Math.round((dur%1)*60);
        var durStr=String(dh).padStart(2,'0')+':'+String(dm).padStart(2,'0')+':00';
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-left:3px solid '+col+';border-radius:var(--r);margin-bottom:3px">'
          +'<div style="flex:1;min-width:0">'
            +'<div style="font-size:13px;color:'+(h.descripcion?'var(--text)':'var(--text3)')+';">'+(h.descripcion||'Sin descripción')+'</div>'
            +(h.proyecto?'<div style="font-size:11px;color:'+col+';font-weight:500;margin-top:2px">● '+h.proyecto+'</div>':'')
          +'</div>'
          +(h.ini&&h.fin?'<div style="font-size:12px;color:var(--text3);white-space:nowrap">'+h.ini+' – '+h.fin+'</div>':'')
          +'<div style="font-size:13px;font-weight:700;color:var(--text2);min-width:70px;text-align:right">'+durStr+'</div>'
          +'<button onclick="delHora(this)" data-id="'+h.id+'" class="btn btn-sm btn-d" style="padding:4px 8px;flex-shrink:0">🗑️</button>'
          +'</div>';
      }).join('')
      +'</div>';
  }).join('');
}

function renderHCList(){ renderHCRegistrar(); }

function delHora(btn){
  var id=btn?btn.getAttribute('data-id'):null;
  var idx=userHoras.findIndex(function(h){return String(h.id)===String(id);});
  if(idx<0)return;
  var h=userHoras[idx];
  if(h.id&&!String(h.id).startsWith('local_'))DB.deleteHora(h.id);
  var me=TEAM.find(function(t){return t.email===cu.email;});
  if(me){me.horas=Math.max(0,Math.round((me.horas-h.horas)*100)/100);DB.updatePerfil(cu.email,{horas:me.horas});}
  userHoras.splice(idx,1);
  var aIdx=allHoras.findIndex(function(x){return String(x.id)===String(id);});
  if(aIdx>=0) allHoras.splice(aIdx,1);
  renderHCRegistrar(); renderHCHist(); renderHDash(); renderDash(); renderEH();
}

function renderHCHist(){
  var tb=document.getElementById('hc-hist-tbody');if(!tb)return;
  if(!userHoras.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:1.5rem">Sin registros</td></tr>';return;}
  tb.innerHTML=userHoras.map(function(h){
    var dateStr=new Date(h.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
    var mins=Math.round(h.horas*60);
    var durStr=Math.floor(mins/60)+'h '+String(mins%60).padStart(2,'0')+'m';
    return '<tr>'
      +'<td>'+dateStr+'</td>'
      +'<td>'+(h.proyecto||'—')+'</td>'
      +'<td>'+(h.descripcion||'—')+'</td>'
      +'<td style="color:var(--text3)">'+(h.ini||'—')+'</td>'
      +'<td style="color:var(--text3)">'+(h.fin||'—')+'</td>'
      +'<td style="font-weight:600;color:var(--purple)">'+durStr+'</td>'
      +'<td><button onclick="delHora(this)" data-id="'+h.id+'" class="btn btn-sm btn-d" style="padding:2px 6px">🗑️</button></td>'
      +'</tr>';
  }).join('');
}

function setHDFilter(f,btn){
  _hdFilter=f;
  ['hd-filter-yo','hd-filter-eq'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderHDash();
}
function setHDRange(r,btn){
  _hdRange=r;
  ['hdf-sem','hdf-mes','hdf-per'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  var custom=document.getElementById('hd-rango-custom');
  if(custom)custom.style.display=r==='per'?'flex':'none';
  if(r!=='per')renderHDash();
}
function setHDSort(s,btn){
  _hdSort=s;
  ['hd-sort-desc','hd-sort-asc'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderHDash();
}

function renderHDash(){
  var now=new Date();
  var desde,hasta;
  if(_hdRange==='sem'){desde=getLunes(now);hasta=getDomingo(now);}
  else if(_hdRange==='mes'){desde=new Date(now.getFullYear(),now.getMonth(),1);hasta=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59);}
  else {
    var dd=document.getElementById('hd-desde'),dh=document.getElementById('hd-hasta');
    desde=dd&&dd.value?new Date(dd.value+'T00:00:00'):getLunes(now);
    hasta=dh&&dh.value?new Date(dh.value+'T23:59:59'):getDomingo(now);
  }
  var allH=_hdFilter==='equipo' ? allHoras : userHoras;
  var src=allH.filter(function(h){var d=new Date(h.fecha+'T12:00:00');return d>=desde&&d<=hasta;});
  var hTot=Math.round(src.reduce(function(s,h){return s+h.horas;},0)*100)/100;
  var diasActivos=Object.keys(src.reduce(function(o,h){o[h.fecha]=1;return o;},{})).length;
  var media=diasActivos>0?Math.round(hTot/diasActivos*10)/10:0;
  function si(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  si('hd-kpi-total',hTot+'h'); si('hd-kpi-media',media+'h'); si('hd-kpi-dias',diasActivos);

  var byDia={};
  src.forEach(function(h){byDia[h.fecha]=(byDia[h.fecha]||0)+h.horas;});
  var diasOrden=Object.keys(byDia).sort();
  var isDark=matchMedia('(prefers-color-scheme:dark)').matches;
  var tC=isDark?'rgba(255,255,255,.45)':'rgba(0,0,0,.38)';
  var gC=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)';
  var w1=document.getElementById('hd-chart-dias');
  if(w1){
    w1.parentNode.innerHTML='<canvas id="hd-chart-dias" style="width:100%;height:100%"></canvas>';
    var c1=document.getElementById('hd-chart-dias');
    if(c1&&diasOrden.length)new Chart(c1,{type:'bar',
      data:{labels:diasOrden.map(function(d){return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'numeric'});}),
        datasets:[{data:diasOrden.map(function(d){return byDia[d];}),backgroundColor:'rgba(83,74,183,.7)',borderRadius:4,borderWidth:0}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
        scales:{x:{grid:{color:gC},ticks:{color:tC,font:{size:10}}},y:{grid:{color:gC},ticks:{color:tC,font:{size:10}},beginAtZero:true}}}});
  }

  var byP={};
  src.forEach(function(h){byP[h.proyecto||'Sin proyecto']=(byP[h.proyecto||'Sin proyecto']||0)+h.horas;});
  var pLbls=Object.keys(byP),pVals=Object.values(byP);
  var COLS=['#534AB7','#1D9E75','#EF9F27','#E24B4A','#378ADD','#D85A30'];
  var w2=document.getElementById('hd-chart-donut');
  if(w2){
    w2.parentNode.innerHTML='<canvas id="hd-chart-donut" style="width:100%;height:100%"></canvas>';
    var c2=document.getElementById('hd-chart-donut');
    if(c2&&pLbls.length)new Chart(c2,{type:'doughnut',
      data:{labels:pLbls,datasets:[{data:pVals,backgroundColor:COLS.slice(0,pLbls.length),borderWidth:2,borderColor:isDark?'#1a1a18':'#fff'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
    var leg=document.getElementById('hd-donut-legend');
    if(leg)leg.innerHTML=pLbls.map(function(l,i){return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px"><div style="width:8px;height:8px;border-radius:2px;background:'+COLS[i]+';flex-shrink:0"></div><span style="font-size:10px;flex:1;color:var(--text2)">'+l+'</span><span style="font-size:10px;font-weight:500">'+Math.round(pVals[i]*10)/10+'h</span></div>';}).join('');
  }

  var pl=document.getElementById('hd-personas-list');if(!pl)return;
  var personasH={};
  TEAM.forEach(function(m){personasH[m.email]=0;});
  src.forEach(function(h){personasH[h.email]=(personasH[h.email]||0)+h.horas;});
  var entries=Object.entries(personasH).filter(function(e){return e[1]>0||_hdFilter==='equipo';});
  entries.sort(function(a,b){return _hdSort==='desc'?b[1]-a[1]:a[1]-b[1];});
  var maxH=Math.max.apply(null,entries.map(function(e){return e[1];})||[1])||1;
  if(!entries.length){pl.innerHTML='<div class="empty">👤<p>Sin datos en este rango</p></div>';return;}
  pl.innerHTML=entries.map(function(e){
    var u=USERS[e[0]]||{name:e[0],ini:'?',av:'av0'};
    var pct=Math.round(e[1]/maxH*100);
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:.5px solid var(--border)">'
      +'<div class="av '+u.av+'" style="width:30px;height:30px;font-size:11px;flex-shrink:0">'+u.ini+'</div>'
      +'<div style="flex:1">'
        +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500">'+u.name+'</span><span style="color:var(--purple);font-weight:600">'+Math.round(e[1]*10)/10+'h</span></div>'
        +'<div style="height:5px;background:var(--bg3);border-radius:3px"><div style="width:'+pct+'%;height:100%;background:var(--purple);border-radius:3px;transition:width .3s"></div></div>'
      +'</div>'
      +'</div>';
  }).join('');
}

function swHorasTab(id, el) {
  ['htab-reg','htab-hist','htab-dash'].forEach(function(t){
    var e=document.getElementById(t); if(e)e.style.display='none';
  });
  var te=document.getElementById(id); if(te)te.style.display='block';
  document.querySelectorAll('#page-mis-horas .tab').forEach(function(t){t.classList.remove('on');});
  if(el)el.classList.add('on');
  if(id==='htab-reg'){renderHCList();}
  if(id==='htab-hist'){renderHCHist();}
  if(id==='htab-dash'){renderHDash();}
}
