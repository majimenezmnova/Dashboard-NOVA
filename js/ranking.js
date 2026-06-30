// RANKING
function getBadges(m){
  return ALL_BADGES.filter(function(b){return b.req(m);}).map(function(b){
    return {lbl:b.tier+' · '+b.lbl, cls:b.cls, icon:b.icon, pts:b.pts};
  });
}

function checkBadgeSemanaBestia(email){
  var byWeek={};
  allHoras.filter(function(h){return h.email===email;}).forEach(function(h){
    var lun=monL(new Date(h.fecha+'T12:00:00')).toISOString().slice(0,10);
    byWeek[lun]=(byWeek[lun]||0)+h.horas;
  });
  return Object.values(byWeek).some(function(v){return v>=30;});
}

function checkChapado(){
  var hoy=new Date(), target=new Date(2026,8,15);
  var mismodia=hoy.getFullYear()===target.getFullYear()&&hoy.getMonth()===target.getMonth()&&hoy.getDate()===target.getDate();
  if(!mismodia) return null;
  var sorted=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;});
  return sorted[0]?sorted[0].email:null;
}

function updateBadgesEspeciales(){
  TEAM.forEach(function(m){
    m.badge_semana_bestia=checkBadgeSemanaBestia(m.email);
  });
  var chapado=checkChapado();
  TEAM.forEach(function(m){m.badge_chapado=(chapado===m.email);});
}

function renderRanking(){
  renderPodium('rk-podium',3);
  if(cu){var me=TEAM.find(function(t){return t.email===cu.email;});
    if(me){var p=pts(me);
      var elH=document.getElementById('my-ph');if(elH)elH.textContent=p.h+' pts';
      var elE=document.getElementById('my-pe');if(elE)elE.textContent=p.e+' pts';
      var elR=document.getElementById('my-pr');if(elR)elR.textContent=p.r+' pts';
      var elB=document.getElementById('my-pb');if(elB)elB.textContent=p.b+' pts';
    }
  }
  var sorted=[].concat(TEAM).sort(function(a,b){return pts(b).total-pts(a).total;});
  var medals=['🥇','🥈','🥉'];
  var rr=document.getElementById('rk-rows');if(!rr)return;
  rr.innerHTML=sorted.map(function(m,i){
    var u=USERS[m.email],p=pts(m),isMe=cu&&m.email===cu.email;
    return '<div class="rk-row" style="'+(isMe?'background:var(--purple-l)':'')+'">'
      +'<div class="rk-pos '+(i<3?'pos'+(i+1):'posN')+'">'+(i<3?medals[i]:(i+1))+'</div>'
      +'<div class="av '+u.av+'" style="width:30px;height:30px;font-size:11px">'+u.ini+'</div>'
      +'<div class="rk-info"><div class="rk-name">'+u.name+(isMe?' <span style="font-size:10px;color:var(--purple)">(tú)</span>':'')+'</div>'
      +'<div class="rk-title">'+MOTES[Math.min(i,MOTES.length-1)]+'</div>'
      +'<div class="rk-bgs">'+getBadges(m).map(function(b){return '<span class="bi '+b.cls+'">'+b.icon+' '+b.lbl+'</span>';}).join('')+'</div></div>'
      +'<div class="rk-pts"><div class="rk-pval">'+p.total+'</div><div class="rk-plbl">pts</div><div class="rk-pbrk">'+p.h+'h·'+p.e+'€·'+p.r+'rc</div></div>'
      +'</div>';
  }).join('');
  var bg=document.getElementById('badges-gallery');if(!bg)return;
  var me=cu?TEAM.find(function(t){return t.email===cu.email;}):null;
  var SECS=[
    {key:'horas',     label:'⏱ Trackeo de horas'},
    {key:'racha',     label:'🔥 Consistencia y racha'},
    {key:'ingresos',  label:'💶 Generación de ingresos'},
    {key:'reportes',  label:'📝 Reportes'},
    {key:'reuniones', label:'🤝 Reuniones'},
    {key:'mentorias', label:'🧠 Mentorías'},
    {key:'especial',  label:'⭐ Badges especiales'}
  ];
  var tierColors={Bronce:'#CD7F32',Plata:'#9B9B9B',Oro:'#F5A623',Platino:'#534AB7',Diamante:'#0E7490',Nova:'#7C3AED',Especial:'#D85A30',Legendary:'#F5A623'};
  bg.innerHTML=SECS.map(function(sec){
    var secBadges=ALL_BADGES.filter(function(b){return b.sec===sec.key;});
    return '<div style="grid-column:1/-1;font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;padding:.5rem 0 .25rem;border-top:1px solid var(--border);margin-top:.25rem">'+sec.label+'</div>'
      +secBadges.map(function(b){
        var ul=me&&b.req(me);
        var tc=tierColors[b.tier]||'#534AB7';
        var bg2=ul?(b.tier==='Nova'?'linear-gradient(160deg,#FAF5FF,#fff)':(b.tier==='Diamante'?'linear-gradient(160deg,#F0FDFF,#fff)':'var(--bg2)')):'var(--bg2)';
        var border2=ul?tc+'44':'var(--border)';
        return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border-radius:var(--rl);border:1px solid '+border2+';background:'+(ul?bg2:'var(--bg2)')+';opacity:'+(ul?1:.4)+';text-align:center">'
          +'<span style="font-size:22px">'+b.icon+'</span>'
          +'<span style="font-size:9px;font-weight:600;padding:1px 7px;border-radius:20px;background:'+tc+'22;color:'+tc+'">'+b.tier+'</span>'
          +'<div style="font-size:12px;font-weight:600">'+b.lbl+'</div>'
          +'<div style="font-size:10px;color:var(--text3);line-height:1.4">'+b.desc+'</div>'
          +'<div style="font-size:11px;font-weight:600;color:'+tc+'">+'+b.pts+' pts</div>'
          +'<div style="font-size:10px;font-weight:500;color:'+(ul?'#3B6D11':'var(--text3)')+';">'+(ul?'✓ Desbloqueado':'Bloqueado')+'</div>'
          +'</div>';
      }).join('');
  }).join('');
}

// EURO/HORA
function renderEH(){
  var datos=Object.keys(USERS).map(function(e){
    var u=USERS[e],m=TEAM.find(function(t){return t.email===e;});
    var horas=m?m.horas:0,fact=m?m.ingresos:0,eh=horas>0?Math.round(fact/horas*10)/10:0;
    return {name:u.name,av:u.av,ini:u.ini,horas:horas,fact:fact,eh:eh};
  });
  var tH=datos.reduce(function(s,d){return s+d.horas;},0),tF=datos.reduce(function(s,d){return s+d.fact;},0);
  var cEH=tH>0?Math.round(tF/tH*10)/10:0;
  var ec=document.getElementById('eh-col');if(ec)ec.textContent=cEH>0?cEH+'€/h':'—';
  var es=document.getElementById('eh-col-sub');if(es)es.textContent=tH.toFixed(1)+'h totales · '+tF.toLocaleString('es-ES')+'€ facturados';
  var maxEH=Math.max.apply(null,datos.map(function(d){return d.eh;}).concat([1]));
  var list=document.getElementById('eh-list');if(!list)return;
  list.innerHTML=datos.map(function(d){
    var pct=maxEH>0?Math.round(d.eh/maxEH*100):0;
    return '<div class="eh-row">'
      +'<div class="av '+d.av+'" style="width:26px;height:26px;font-size:10px;flex-shrink:0">'+d.ini+'</div>'
      +'<div class="eh-nm">'+d.name+'</div>'
      +'<div class="eh-bar"><div class="eh-bf" style="width:'+pct+'%"></div></div>'
      +'<div class="eh-h">'+d.horas.toFixed(1)+'h</div>'
      +'<div class="eh-f">'+(d.fact>0?d.fact.toLocaleString('es-ES')+'€':'—')+'</div>'
      +'<div class="eh-v" style="color:'+(d.eh>0?'var(--purple)':'var(--text3)')+'">'+(d.eh>0?d.eh+'€/h':'—')+'</div>'
      +'</div>';
  }).join('');
}
