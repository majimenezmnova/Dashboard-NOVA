// REPORTES — Mis reportes
function renderReps(){
  var c=document.getElementById('rep-list');if(!c)return;
  if(!userReportes.length){c.innerHTML='<div class="empty">📄<p>Aún no tienes reportes</p></div>';return;}
  c.innerHTML=userReportes.map(function(r,idx){
    var nums=[];
    if(r.importe)   nums.push('<span class="tag tt">💶 '+r.importe.toLocaleString('es-ES')+'€ fact.</span>');
    if(r.beneficio) nums.push('<span class="tag" style="background:var(--green-l);color:var(--green)">✓ '+r.beneficio.toLocaleString('es-ES')+'€ benef.</span>');
    if(r.mentorias) nums.push('<span class="tag" style="background:var(--purple-l);color:var(--purple)">🧠 '+r.mentorias+' mentor.</span>');
    var reu=(r.reunExp||0)+(r.reunVal||0)+(r.reunVta||0);
    if(reu)         nums.push('<span class="tag" style="background:var(--blue-l);color:var(--blue)">🤝 '+reu+' reun.</span>');
    var ase=(r.asLegal||0)+(r.asFin||0)+(r.asTech||0);
    if(ase)         nums.push('<span class="tag" style="background:var(--amber-l);color:var(--amber)">⚖ '+ase+' asesor.</span>');
    var extra=''
      +(r.proximos?'<p style="margin:4px 0"><strong>Próximos pasos:</strong> '+r.proximos+'</p>':'')
      +(r.feedback?'<p style="margin:4px 0"><strong>Feedback al equipo:</strong> '+r.feedback+'</p>':'')
      +(r.ayuda?'<p style="margin:4px 0"><strong>Ayuda necesaria:</strong> '+r.ayuda+(r.ayuda_quien?' — '+r.ayuda_quien:'')+'</p>':'')
      +(r.riesgo?'<p style="margin:4px 0"><strong>Riesgo:</strong> '+r.riesgo+'</p>':'');
    return '<div class="rep-item">'
      +'<div class="rep-meta"><span style="font-size:11px;color:var(--text3)">'+r.fecha+'</span>'
      +'<span class="tag tp">'+r.periodo+'</span>'
      +(r.proyecto?'<span class="tag tt">'+r.proyecto+'</span>':'')
      +(r.mood?'<span>'+r.mood+'</span>':'')
      +'</div>'
      +'<div class="rep-body"><strong>Avances:</strong> '+r.avances
      +(r.logro?'<br><strong>Logro:</strong> '+r.logro:'')
      +(r.bloqueos?'<br><strong>Bloqueos:</strong> '+r.bloqueos:'')
      +(r.aprendizajes?'<br><strong>Aprendizajes:</strong> '+r.aprendizajes:'')
      +'</div>'
      +(extra?'<div id="rme-'+idx+'" style="display:none;margin-top:6px;font-size:13px;color:var(--text2);line-height:1.6">'+extra+'</div>':'')
      +(nums.length?'<div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap">'+nums.join('')+'</div>':'')
      +(extra?'<button onclick="toggleRME('+idx+',this)" style="margin-top:6px;font-size:11px;color:var(--purple);background:none;border:none;cursor:pointer;padding:0">Ver completo ↓</button>':'')
      +'</div>';
  }).join('');
}

function toggleRME(idx,btn){
  var el=document.getElementById('rme-'+idx);if(!el)return;
  var open=el.style.display!=='none';
  el.style.display=open?'none':'block';
  if(btn)btn.textContent=open?'Ver completo ↓':'Cerrar ↑';
}

var moodEmojis={sad:'😔',meh:'😐',ok:'🙂',good:'😊',fire:'🔥'};
function setMood(btn,m){document.querySelectorAll('.mood-btn').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');selMood=m;}
function getPer(){var now=new Date(),d=now.getDate(),mes=now.toLocaleDateString('es-ES',{month:'short',year:'numeric'});if(d<=15)return '1–15 '+mes;var last=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();return '16–'+last+' '+mes;}

function getPeriodoInfo(){
  var now=new Date();
  var start=new Date(2026,6,1);
  var diffMs=now-start;
  if(diffMs<0){return{abierto:false,periodo:0,abre:start,cierra:null,msHastaAbre:-diffMs};}
  var diasDesdeStart=Math.floor(diffMs/86400000);
  var periodoIdx=Math.floor(diasDesdeStart/15);
  var diaEnPeriodo=diasDesdeStart%15;
  var abierto=diaEnPeriodo===0;
  var inicioPeriodo=new Date(start.getTime());
  inicioPeriodo.setDate(inicioPeriodo.getDate()+periodoIdx*15);
  var cierraPeriodo=new Date(inicioPeriodo.getTime());
  cierraPeriodo.setDate(cierraPeriodo.getDate()+1);
  var siguienteApertura=new Date(inicioPeriodo.getTime());
  siguienteApertura.setDate(siguienteApertura.getDate()+15);
  return{abierto:abierto,periodo:periodoIdx+1,abre:inicioPeriodo,cierra:cierraPeriodo,
    msHastaCierre:abierto?(cierraPeriodo-now):0,
    msHastaAbre:!abierto?(siguienteApertura-now):0};
}

function initRepPage(){
  var info=getPeriodoInfo();
  var bloq=document.getElementById('rep-bloqueado');
  var abie=document.getElementById('rep-abierto');
  var sel=document.getElementById('rep-ayuda-quien');
  if(sel){
    var opts='<option value="">Nadie / No necesito</option>';
    Object.keys(USERS).forEach(function(email){
      if(cu&&email!==cu.email)opts+='<option value="'+USERS[email].name+'">'+USERS[email].name+'</option>';
    });
    sel.innerHTML=opts;
  }
  var projSel=document.getElementById('rep-proy-sel');
  if(projSel){
    var propts='<option value="">Sin proyecto / General</option>'+proyectos.map(function(p){
      return '<option value="'+p.nombre+'">'+p.nombre+'</option>';
    }).join('');
    projSel.innerHTML=propts;
  }
  if(info.abierto){
    if(bloq)bloq.style.display='none';
    if(abie)abie.style.display='block';
    var pl=document.getElementById('per-lbl');
    if(pl)pl.textContent='P'+info.periodo+' · '+getPer();
    if(window._repTimer)clearInterval(window._repTimer);
    window._repTimer=setInterval(function(){
      var msLeft=info.cierra-new Date();
      if(msLeft<=0){clearInterval(window._repTimer);initRepPage();return;}
      var h=Math.floor(msLeft/3600000),m=Math.floor((msLeft%3600000)/60000),s=Math.floor((msLeft%60000)/1000);
      var el=document.getElementById('rep-countdown');
      if(el)el.textContent='Cierra en '+h+'h '+m+'m '+s+'s';
    },1000);
  } else {
    if(bloq)bloq.style.display='block';
    if(abie)abie.style.display='none';
    var msg=document.getElementById('rep-unlock-msg');
    if(msg){
      var msLeft=info.msHastaAbre;
      var d=Math.floor(msLeft/86400000),h=Math.floor((msLeft%86400000)/3600000),m=Math.floor((msLeft%3600000)/60000);
      var abreStr=info.abre.toLocaleDateString('es-ES',{day:'numeric',month:'long'});
      msg.textContent='El formulario abre el '+abreStr+' (en '+d+'d '+h+'h '+m+'m).';
    }
  }
}

function saveRep(){
  var av=document.getElementById('rep-av');
  if(!av||!av.value.trim()){if(av)av.focus();return;}
  var now=new Date();
  var info=getPeriodoInfo();
  var proy=(document.getElementById('rep-proy-sel')||{}).value||'';
  var bl=(document.getElementById('rep-bl')||{}).value||'';
  var bloqueoActual=bl.trim().length>3;
  var imp=parseFloat(document.getElementById('rep-imp').value)||0;
  var benef=parseFloat(document.getElementById('rep-benef').value)||0;
  var mentorias=parseInt(document.getElementById('rep-mentorias').value)||0;
  var asLegal=parseInt(document.getElementById('rep-asesoria-legal').value)||0;
  var asFin=parseInt(document.getElementById('rep-asesoria-fin').value)||0;
  var asTech=parseInt(document.getElementById('rep-asesoria-tech').value)||0;
  var reunExp=parseInt(document.getElementById('rep-reun-exp').value)||0;
  var reunVal=parseInt(document.getElementById('rep-reun-val').value)||0;
  var reunVta=parseInt(document.getElementById('rep-reun-vta').value)||0;
  var ayudaQuien=document.getElementById('rep-ayuda-quien').value;
  var ayudaDesc=document.getElementById('rep-ayuda').value;
  var fb=document.getElementById('rep-fb').value;
  var rsk=document.getElementById('rep-rsk').value;
  var me=TEAM.find(function(t){return t.email===cu.email;});
  var r={
    autor_email:cu.email,
    fecha:now.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}),
    periodo:'P'+info.periodo+' · '+getPer(),
    proyecto:proy,
    mood:selMood?moodEmojis[selMood]:'',
    avances:av.value.trim(),
    logro:(document.getElementById('rep-log')||{}).value||'',
    bloqueos:bl,
    aprendizajes:(document.getElementById('rep-apr')||{}).value||'',
    proximos:(document.getElementById('rep-prox')||{}).value||'',
    feedback:fb,ayuda:ayudaDesc,ayuda_quien:ayudaQuien,riesgo:rsk,
    horas:0,importe:imp,beneficio:benef,
    mentorias:mentorias,asLegal:asLegal,asFin:asFin,asTech:asTech,
    reunExp:reunExp,reunVal:reunVal,reunVta:reunVta
  };
  userReportes.unshift(r);
  DB.insertReporte({
    autor_email:cu.email,periodo:r.periodo,proyecto:r.proyecto||'',
    mood:r.mood||'',avances:r.avances||'',logro:r.logro||'',bloqueos:r.bloqueos||'',
    aprendizajes:r.aprendizajes||'',proximos:r.proximos||'',feedback:r.feedback||'',
    ayuda:r.ayuda||'',ayuda_quien:r.ayuda_quien||'',riesgo:r.riesgo||'',
    horas:0,importe:r.importe||0,beneficio:r.beneficio||0,
    mentorias:r.mentorias||0,as_legal:r.asLegal||0,as_fin:r.asFin||0,as_tech:r.asTech||0,
    reun_exp:r.reunExp||0,reun_val:r.reunVal||0,reun_vta:r.reunVta||0,
    ts:Date.now()
  }).then(function(data){if(data)r.id=data.id;});
  if(me){
    me.reportado=true;
    me.reportado_count=(me.reportado_count||0)+1;
    me.racha=(me.racha||0)+1;
    if(imp)me.ingresos+=imp;
    if(benef)me.beneficio=(me.beneficio||0)+benef;
    if(mentorias)me.mentorias_total=(me.mentorias_total||0)+mentorias;
    if(asLegal||asFin||asTech)me.asesorias_total=(me.asesorias_total||0)+asLegal+asFin+asTech;
    var totalReu=(reunExp||0)+(reunVal||0)+(reunVta||0);
    if(totalReu)me.reuniones_total=(me.reuniones_total||0)+totalReu;
    if(selMood)me.mood=selMood;
    if(ayudaQuien){me.ayuda_count=(me.ayuda_count||0)+1;if(me.ayuda_count>=3)me.badge_conector=true;}
    me.badge_tuvo_bloqueo=bloqueoActual;
    me.bloqueo=bloqueoActual?bl:'';
    DB.updatePerfil(cu.email,{
      ingresos:me.ingresos,beneficio:me.beneficio||0,
      racha:me.racha,reportado:true,reportado_count:me.reportado_count,
      mood:me.mood||null,bloqueo:me.bloqueo||'',ayuda_count:me.ayuda_count||0,
      mentorias_total:me.mentorias_total||0,asesorias_total:me.asesorias_total||0,
      reuniones_total:me.reuniones_total||0,badge_conector:me.badge_conector||false
    });
  }
  var ptEl=document.getElementById('rep-pts');
  if(ptEl)ptEl.textContent='+50 pts base 🎉';
  var ok=document.getElementById('rep-ok');
  if(ok){ok.style.display='flex';setTimeout(function(){ok.style.display='none';},4000);}
  clearRep();updateBadgesEspeciales();renderReps();renderDash();renderEH();setTimeout(renderCharts,80);
  if(window.allReportes&&userReportes.length)window.allReportes.unshift(Object.assign({},userReportes[0],{id:'r_'+Date.now(),autor_email:cu.email,ts:Date.now()}));
}

function clearRep(){
  ['rep-fb','rep-ayuda','rep-rsk','rep-imp','rep-benef','rep-mentorias',
   'rep-asesoria-legal','rep-asesoria-fin','rep-asesoria-tech',
   'rep-reun-exp','rep-reun-val','rep-reun-vta',
   'rep-av','rep-log','rep-bl','rep-apr','rep-prox'].forEach(function(id){
    var e=document.getElementById(id);if(e)e.value='';
  });
  var ps=document.getElementById('rep-proy-sel');if(ps)ps.value='';
  document.querySelectorAll('.mood-btn').forEach(function(b){b.classList.remove('on');});
  selMood='';
}
