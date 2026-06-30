// ══ REPORTES DEL EQUIPO ══
var _reFiltro = 'todos';
var _reOrden  = 'nuevo';
var equipoComentarios = [];

function initReportesEquipo() {
  var pb = document.getElementById('re-persona-btns');
  if(pb) {
    pb.innerHTML = Object.keys(USERS).map(function(email) {
      var u = USERS[email];
      return '<button class="fb" onclick="setReFiltro(\''+email+'\',this)">'+u.name+'</button>';
    }).join('');
  }
  renderReportesEquipo();
}

function setReFiltro(f, btn) {
  _reFiltro = f;
  document.querySelectorAll('#re-persona-btns .fb, #re-f-todos').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
  renderReportesEquipo();
}

function setReOrden(o, btn) {
  _reOrden = o;
  ['re-ord-new','re-ord-old'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.remove('on');});
  if(btn) btn.classList.add('on');
  renderReportesEquipo();
}

function renderReportesEquipo() {
  var el = document.getElementById('re-list'); if(!el) return;

  var src = (window.allReportes || []).slice();

  if(_reFiltro !== 'todos') {
    src = src.filter(function(r){return r.autor_email === _reFiltro;});
  }

  src.sort(function(a,b){
    return _reOrden === 'nuevo' ? (b.ts - a.ts) : (a.ts - b.ts);
  });

  if(!src.length) {
    el.innerHTML = '<div class="empty">📄<p>No hay reportes todavía. Los reportes enviados aparecerán aquí.</p></div>';
    return;
  }

  var REACCIONES = ['👍','🔥','💪','🎉','❤️','👀'];

  el.innerHTML = src.map(function(r) {
    var u = USERS[r.autor_email] || {name:'?', ini:'?', av:'av0'};
    var comentarios = equipoComentarios.filter(function(c){return c.rep_id === r.id;});
    var reacciones = {};
    equipoComentarios.filter(function(c){return c.rep_id === r.id && c.tipo === 'emoji';}).forEach(function(c){
      reacciones[c.texto] = (reacciones[c.texto]||[]);
      reacciones[c.texto].push(c.autor_email);
    });

    var reacHtml = REACCIONES.map(function(emoji) {
      var users = reacciones[emoji] || [];
      var yoReaccioné = cu && users.indexOf(cu.email) >= 0;
      var names = users.map(function(e){return USERS[e]?USERS[e].name:e;}).join(', ');
      return '<button onclick="toggleReaccion(\''+r.id+'\',\''+emoji+'\')" '
        +'title="'+(names||'Reaccionar')+'" '
        +'style="padding:3px 8px;border-radius:20px;border:1px solid '+(yoReaccioné?'var(--purple)':'var(--border2)')+';background:'+(yoReaccioné?'var(--purple-l)':'var(--bg2)')+';cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;font-family:inherit">'
        +emoji+(users.length?'<span style="font-size:11px;font-weight:500;color:'+(yoReaccioné?'var(--purple-d)':'var(--text2)')+'">'+users.length+'</span>':'')
        +'</button>';
    }).join('');

    var comsHtml = comentarios.filter(function(c){return c.tipo==='texto';}).map(function(c){
      var cu2 = USERS[c.autor_email]||{name:'?',ini:'?',av:'av0'};
      return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">'
        +'<div class="av '+cu2.av+'" style="width:24px;height:24px;font-size:9px;flex-shrink:0">'+cu2.ini+'</div>'
        +'<div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:2px">'+cu2.name+' <span style="font-weight:400;color:var(--text3)">'+c.fecha+'</span></div>'
        +'<div style="font-size:13px;color:var(--text)">'+c.texto+'</div></div>'
        +'</div>';
    }).join('');

    return '<div class="card" style="margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:.875rem">'
        +'<div class="av '+u.av+'" style="width:36px;height:36px;font-size:13px;flex-shrink:0">'+u.ini+'</div>'
        +'<div style="flex:1">'
          +'<div style="font-size:14px;font-weight:700">'+u.name+'</div>'
          +'<div style="display:flex;gap:6px;margin-top:3px;flex-wrap:wrap">'
            +'<span class="tag tp" style="font-size:10px">'+r.periodo+'</span>'
            +'<span class="tag tt" style="font-size:10px">'+r.proyecto+'</span>'
            +(r.mood?'<span style="font-size:14px">'+r.mood+'</span>':'')
          +'</div>'
        +'</div>'
        +'<div style="font-size:11px;color:var(--text3)">'+r.fecha+'</div>'
      +'</div>'
      +'<div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:.875rem">'
        +(r.avances?'<div style="margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--text);text-transform:uppercase;letter-spacing:.04em">Avances</span><br>'+r.avances+'</div>':'')
        +(r.logro?'<div style="margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--text);text-transform:uppercase;letter-spacing:.04em">Logro</span><br>'+r.logro+'</div>':'')
        +(r.bloqueos?'<div style="margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--coral);text-transform:uppercase;letter-spacing:.04em">⚠ Bloqueos</span><br>'+r.bloqueos+'</div>':'')
        +(r.aprendizajes?'<div><span style="font-size:11px;font-weight:600;color:var(--text);text-transform:uppercase;letter-spacing:.04em">Aprendizajes</span><br>'+r.aprendizajes+'</div>':'')
      +'</div>'
      +(r.horas||r.importe||r.beneficio?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.875rem;padding-top:.625rem;border-top:1px solid var(--border)">'
        +(r.horas?'<span class="tag" style="background:var(--bg3);color:var(--text2)">⏱ '+r.horas+'h</span>':'')
        +(r.importe?'<span class="tag tt">💶 '+r.importe.toLocaleString('es-ES')+'€ fact.</span>':'')
        +(r.beneficio?'<span class="tag" style="background:var(--green-l);color:var(--green)">✓ '+r.beneficio.toLocaleString('es-ES')+'€ benef.</span>':'')
        +'</div>':'')
      +'<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:.75rem">'+reacHtml+'</div>'
      +(comsHtml?'<div style="margin-bottom:.75rem;padding:.625rem;background:var(--bg3);border-radius:var(--r)">'+comsHtml+'</div>':'')
      +'<div style="display:flex;gap:8px;align-items:center">'
        +'<div class="av '+(cu?USERS[cu.email].av:'av0')+'" style="width:28px;height:28px;font-size:10px;flex-shrink:0">'+(cu?USERS[cu.email].ini:'?')+'</div>'
        +'<input type="text" id="re-c-'+r.id+'" placeholder="Comenta este reporte..." style="flex:1;padding:7px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:13px;" onkeydown="reEnterCheck(event,this)">'
        +'<button class="btn btn-sm btn-p" style="padding:7px 12px;flex-shrink:0" onclick="reEnviar(this)">📨</button>'
      +'</div>'
      +'</div>';
  }).join('');
}

function reEnterCheck(e, input) {
  if(e.key==='Enter') reEnviar(input.nextElementSibling);
}

function reEnviar(btn) {
  if(!cu) return;
  var input = btn.previousElementSibling;
  if(!input || !input.value.trim()) return;
  var repId = input.id.replace('re-c-','');
  var comObj={rep_id:repId, tipo:'texto', texto:input.value.trim(), autor_email:cu.email,
    fecha:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}), ts:Date.now()};
  DB.insertComentario({reporte_id:repId, autor_email:cu.email, tipo:'texto', texto:comObj.texto});
  equipoComentarios.push(comObj);
  input.value='';
  renderReportesEquipo();
}

function toggleReaccion(repId, emoji) {
  if(!cu) return;
  var existing = equipoComentarios.findIndex(function(c){
    return c.rep_id===repId && c.tipo==='emoji' && c.texto===emoji && c.autor_email===cu.email;
  });
  if(existing >= 0) {
    if(equipoComentarios[existing].id) DB.deleteComentario(equipoComentarios[existing].id);
    equipoComentarios.splice(existing, 1);
  } else {
    var reacObj={rep_id:repId, tipo:'emoji', texto:emoji, autor_email:cu.email, fecha:'', ts:Date.now()};
    DB.insertComentario({reporte_id:repId, autor_email:cu.email, tipo:'emoji', texto:emoji})
      .then(function(d){if(d)reacObj.id=d.id;});
    equipoComentarios.push(reacObj);
  }
  renderReportesEquipo();
}
