// REPORTES
function renderReps(){
  var c=document.getElementById('rep-list');if(!c)return;
  if(!userReportes.length){c.innerHTML='<div class="empty">📄<p>Aún no tienes reportes</p></div>';return;}
  c.innerHTML=userReportes.map(function(r){
    var nums=[];
    if(r.horas)    nums.push('<span class="tag" style="background:var(--bg3);color:var(--text2)">⏱ '+r.horas+'h</span>');
    if(r.importe)  nums.push('<span class="tag" style="background:var(--teal-l);color:var(--teal)">💶 '+r.importe.toLocaleString('es-ES')+'€ fact.</span>');
    if(r.beneficio)nums.push('<span class="tag" style="background:var(--green-l);color:var(--green)">✓ '+r.beneficio.toLocaleString('es-ES')+'€ benef.</span>');
    if(r.mentorias)nums.push('<span class="tag" style="background:var(--purple-l);color:var(--purple)">🧠 '+r.mentorias+' mentor.</span>');
    var reu=(r.reunExp||0)+(r.reunVal||0)+(r.reunVta||0);
    if(reu)        nums.push('<span class="tag" style="background:var(--blue-l);color:var(--blue)">🤝 '+reu+' reun.</span>');
    var ase=(r.asLegal||0)+(r.asFin||0)+(r.asTech||0);
    if(ase)        nums.push('<span class="tag" style="background:var(--amber-l);color:var(--amber)">⚖ '+ase+' asesor.</span>');
    return '<div class="rep-item">'
      +'<div class="rep-meta"><span style="font-size:11px;color:var(--text3)">'+r.fecha+'</span>'
      +'<span class="tag tp">'+r.periodo+'</span><span class="tag tt">'+r.proyecto+'</span>'
      +(r.mood?'<span>'+r.mood+'</span>':'')
      +(r.ayuda_quien?'<span class="tag" style="background:var(--purple-l);color:var(--purple-d)">Ayuda: '+r.ayuda_quien+'</span>':'')
      +'</div>'
      +'<div class="rep-body"><strong>Avances:</strong> '+r.avances
      +(r.logro?'<br><strong>Logro:</strong> '+r.logro:'')
      +(r.bloqueos?'<br><strong>Bloqueos:</strong> '+r.bloqueos:'')
      +(r.aprendizajes?'<br><strong>Aprendizajes:</strong> '+r.aprendizajes:'')
      +'</div>'
      +(nums.length?'<div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap">'+nums.join('')+'</div>':'')
      +'</div>';
  }).join('');
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
    initRepProyectos();
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

var repProyActivos=[];
function initRepProyectos(){
  repProyActivos=[{id:0}];
  renderRepProyectos();
}
function addRepProy(){
  repProyActivos.push({id:repProyActivos.length});
  renderRepProyectos();
}
function removeRepProy(idx){
  if(repProyActivos.length<=1)return;
  repProyActivos.splice(idx,1);
  repProyActivos.forEach(function(p,i){p.id=i;});
  renderRepProyectos();
}
function renderRepProyectos(){
  var c=document.getElementById('rep-proyectos-container');if(!c)return;
  var opts=proyectos.map(function(p){return '<option value="'+p.nombre+'">'+p.nombre+'</option>';}).join('');
  c.innerHTML=repProyActivos.map(function(p,idx){
    var pid=p.id;
    return '<div class="card" style="margin-bottom:8px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">'
        +'<div class="ct" style="margin-bottom:0">Proyecto'+(repProyActivos.length>1?' '+(idx+1):'')+'</div>'
        +(repProyActivos.length>1?'<button class="btn btn-sm btn-d" onclick="removeRepProy('+idx+')" style="padding:3px 7px">✕</button>':'')
      +'</div>'
      +'<div class="fg" style="margin-bottom:.75rem"><label>Proyecto</label><select id="rep-proy-'+pid+'" class="rep-proy-sel" style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif"><option value="">Selecciona...</option>'+opts+'</select></div>'
      +'<div class="fg"><label>Avances realizados <span style="color:var(--red)">*</span></label><textarea id="rep-av-'+pid+'" placeholder="¿Qué has hecho este período? Sé concreto..." style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif;min-height:72px;resize:vertical"></textarea></div>'
      +'<div class="fg"><label>Logro destacado</label><input id="rep-log-'+pid+'" type="text" placeholder="El resultado del que más orgulloso estás" style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif"></div>'
      +'<div class="fg"><label>Bloqueos actuales</label><textarea id="rep-bl-'+pid+'" placeholder="¿Qué te está frenando en este proyecto?" style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif;min-height:60px;resize:vertical"></textarea></div>'
      +'<div class="fg"><label>Aprendizajes</label><textarea id="rep-apr-'+pid+'" placeholder="¿Qué has aprendido?" style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif;min-height:60px;resize:vertical"></textarea></div>'
      +'<div class="fg" style="margin-bottom:0"><label>Próximos pasos</label><textarea id="rep-prox-'+pid+'" placeholder="¿Qué vas a hacer el siguiente período en este proyecto?" style="width:100%;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;font-family:\'Inter\',sans-serif;min-height:60px;resize:vertical"></textarea></div>'
      +'</div>';
  }).join('');
}

function saveRep(){
  var primerAv=document.getElementById('rep-av-0');
  if(!primerAv||!primerAv.value.trim()){if(primerAv)primerAv.focus();return;}
  var now=new Date();
  var info=getPeriodoInfo();
  var horas=parseFloat(document.getElementById('rep-h').value)||0;
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
  var bloqueoActual=false;
  repProyActivos.forEach(function(p){
    var pid=p.id;
    var proy=document.getElementById('rep-proy-'+pid);
    var av=document.getElementById('rep-av-'+pid);
    if(!av||!av.value.trim())return;
    var bl=(document.getElementById('rep-bl-'+pid)||{}).value||'';
    if(bl.trim().length>3)bloqueoActual=true;
    var r={
      autor_email:cu.email,
      fecha:now.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}),
      periodo:'P'+info.periodo+' · '+getPer(),
      proyecto:proy?proy.value||'Sin proyecto':'Sin proyecto',
      mood:selMood?moodEmojis[selMood]:'',
      avances:av.value.trim(),
      logro:(document.getElementById('rep-log-'+pid)||{}).value||'',
      bloqueos:bl,
      aprendizajes:(document.getElementById('rep-apr-'+pid)||{}).value||'',
      proximos:(document.getElementById('rep-prox-'+pid)||{}).value||'',
      feedback:fb,ayuda:ayudaDesc,ayuda_quien:ayudaQuien,riesgo:rsk,
      horas:horas,importe:imp,beneficio:benef,
      mentorias:mentorias,asLegal:asLegal,asFin:asFin,asTech:asTech,
      reunExp:reunExp,reunVal:reunVal,reunVta:reunVta
    };
    userReportes.unshift(r);
    DB.insertReporte({
      autor_email:cu.email, periodo:r.periodo, proyecto:r.proyecto||'',
      mood:r.mood||'', avances:r.avances||'', logro:r.logro||'', bloqueos:r.bloqueos||'',
      aprendizajes:r.aprendizajes||'', proximos:r.proximos||'', feedback:r.feedback||'',
      ayuda:r.ayuda||'', ayuda_quien:r.ayuda_quien||'', riesgo:r.riesgo||'',
      horas:r.horas||0, importe:r.importe||0, beneficio:r.beneficio||0,
      mentorias:r.mentorias||0, as_legal:r.asLegal||0, as_fin:r.asFin||0, as_tech:r.asTech||0,
      reun_exp:r.reunExp||0, reun_val:r.reunVal||0, reun_vta:r.reunVta||0,
      ts:Date.now()
    }).then(function(data){
      if(data) {
        r.id=data.id;
      } else {
        console.error('insertReporte failed — posible columna inexistente en BD');
      }
    });
  });
  if(me){
    me.reportado=true;
    me.reportado_count=(me.reportado_count||0)+1;
    me.racha=(me.racha||0)+1;
    me.horas+=(horas||0);
    if(imp)me.ingresos+=imp;
    if(benef)me.beneficio=(me.beneficio||0)+benef;
    if(mentorias)me.mentorias_total=(me.mentorias_total||0)+mentorias;
    if(asLegal||asFin||asTech)me.asesorias_total=(me.asesorias_total||0)+asLegal+asFin+asTech;
    var totalReu=(reunExp||0)+(reunVal||0)+(reunVta||0);
    if(totalReu)me.reuniones_total=(me.reuniones_total||0)+totalReu;
    if(selMood)me.mood=selMood;
    if(ayudaQuien){me.ayuda_count=(me.ayuda_count||0)+1;if(me.ayuda_count>=3)me.badge_conector=true;}
    me.badge_tuvo_bloqueo=bloqueoActual;
    me.bloqueo=bloqueoActual?((document.getElementById('rep-bl-0')||{}).value||''):'';
    DB.updatePerfil(cu.email,{
      horas:me.horas, ingresos:me.ingresos, beneficio:me.beneficio||0,
      racha:me.racha, reportado:true, reportado_count:me.reportado_count,
      mood:me.mood||null, bloqueo:me.bloqueo||'', ayuda_count:me.ayuda_count||0,
      mentorias_total:me.mentorias_total||0, asesorias_total:me.asesorias_total||0,
      reuniones_total:me.reuniones_total||0, badge_conector:me.badge_conector||false
    });
  }
  var ptEl=document.getElementById('rep-pts');
  if(ptEl)ptEl.textContent='+'+(50+Math.round(horas*0.5))+' pts base 🎉';
  var ok=document.getElementById('rep-ok');
  if(ok){ok.style.display='flex';setTimeout(function(){ok.style.display='none';},4000);}
  clearRep();updateBadgesEspeciales();renderReps();renderDash();renderEH();setTimeout(renderCharts,80);
  if(window.allReportes && userReportes.length) window.allReportes.unshift(Object.assign({},userReportes[0],{id:'r_'+Date.now(),autor_email:cu.email,ts:Date.now()}));
}

function clearRep(){
  ['rep-fb','rep-ayuda','rep-rsk','rep-imp','rep-benef','rep-h','rep-mentorias',
   'rep-asesoria-legal','rep-asesoria-fin','rep-asesoria-tech',
   'rep-reun-exp','rep-reun-val','rep-reun-vta'].forEach(function(id){
    var e=document.getElementById(id);if(e)e.value='';
  });
  document.querySelectorAll('.mood-btn').forEach(function(b){b.classList.remove('on');});
  selMood='';
  initRepProyectos();
}
