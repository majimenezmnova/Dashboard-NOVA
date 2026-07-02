// ══ SUPABASE CONFIG ══
const SUPA_URL = 'https://hwapyvywbnwmbnxmcicd.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YXB5dnl3Ym53bWJueG1jaWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODI5NTcsImV4cCI6MjA5NzE1ODk1N30.BW4WtvewkQrNfh9BTehO-XGV1p_x6S6T6wR_2ANslzY';
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

// ══ DB HELPERS ══
const DB = {
  // Perfiles
  async getPerfiles() {
    const { data, error } = await sb.from('perfiles').select('*');
    if(error) { console.error('getPerfiles error:', error); return []; }
    return data || [];
  },
  async updatePerfil(email, fields) {
    const { error } = await sb.from('perfiles').update(fields).eq('email', email);
    if(error) console.error('updatePerfil error:', error);
  },

  // Proyectos
  async getProyectos() {
    const { data, error } = await sb.from('proyectos').select('*').order('created_at');
    if(error) { console.error('getProyectos error:', error); return []; }
    return data || [];
  },
  async upsertProyecto(p) {
    if (p.id) {
      const { error } = await sb.from('proyectos').update(p).eq('id', p.id);
      if(error) console.error('upsertProyecto error:', error);
    } else {
      const { data, error } = await sb.from('proyectos').insert(p).select().single();
      if(error) { console.error('insertProyecto error:', error); return null; }
      return data;
    }
  },
  async deleteProyecto(id) {
    const { error } = await sb.from('proyectos').delete().eq('id', id);
    if(error) console.error('deleteProyecto error:', error);
  },

  // Horas
  async getHoras() {
    const { data, error } = await sb.from('horas').select('*').order('fecha', { ascending: false }).order('created_at', { ascending: false });
    if(error) { console.error('getHoras error:', error); return []; }
    return data || [];
  },
  async insertHora(h) {
    // Eliminar campo 'tipo' si la tabla no lo tiene — no causa error pero lo quitamos por seguridad
    var payload = Object.assign({}, h);
    delete payload.tipo;
    const { data, error } = await sb.from('horas').insert(payload).select().single();
    if(error) { console.error('insertHora error:', error); return null; }
    return data;
  },
  async deleteHora(id) {
    const { error } = await sb.from('horas').delete().eq('id', id);
    if(error) console.error('deleteHora error:', error);
  },

  // Reportes
  async getReportes() {
    const { data, error } = await sb.from('reportes').select('*').order('created_at', { ascending: false });
    if(error) { console.error('getReportes error:', error); return []; }
    return data || [];
  },
  async insertReporte(r) {
    const { data, error } = await sb.from('reportes').insert(r).select().single();
    if(error) { console.error('insertReporte error:', error); return null; }
    return data;
  },

  // Comentarios
  async getComentarios() {
    const { data, error } = await sb.from('comentarios').select('*').order('created_at');
    if(error) { console.error('getComentarios error:', error); return []; }
    return data || [];
  },
  async insertComentario(c) {
    const { data, error } = await sb.from('comentarios').insert(c).select().single();
    if(error) { console.error('insertComentario error:', error); return null; }
    return data;
  },
  async deleteComentario(id) {
    const { error } = await sb.from('comentarios').delete().eq('id', id);
    if(error) console.error('deleteComentario error:', error);
  },

  // Movimientos
  async getMovimientos() {
    const { data, error } = await sb.from('movimientos').select('*').order('fecha', { ascending: false });
    if(error) { console.error('getMovimientos error:', error); return []; }
    return data || [];
  },
  async insertMovimiento(m) {
    const { data, error } = await sb.from('movimientos').insert(m).select().single();
    if(error) { console.error('insertMovimiento error:', error); return null; }
    return data;
  },
  async deleteMovimiento(id) {
    const { error } = await sb.from('movimientos').delete().eq('id', id);
    if(error) console.error('deleteMovimiento error:', error);
  },

  // KPIs
  async getKpis() {
    const { data, error } = await sb.from('kpis').select('*').order('ts', { ascending: false });
    if(error) { console.error('getKpis error:', error); return []; }
    return data || [];
  },
  async insertKpi(k) {
    const { data, error } = await sb.from('kpis').insert(k).select().single();
    if(error) { console.error('insertKpi error:', error); return null; }
    return data;
  },
  async deleteKpi(id) {
    const { error } = await sb.from('kpis').delete().eq('id', id);
    if(error) console.error('deleteKpi error:', error);
  }
};

// ══ REALTIME SUBSCRIPTIONS ══
function initRealtime() {
  sb.channel('nova-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles' },   () => syncPerfiles())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' },  () => syncProyectos())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'horas' },      () => syncHoras())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' },   () => syncReportes())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios' },() => syncComentarios())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos' },() => syncMovimientos())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kpis' },       () => syncKpis())
    .subscribe();
}

// ══ SYNC FUNCTIONS ══
async function syncPerfiles() {
  var data = await DB.getPerfiles();
  data.forEach(function(p) {
    var tm = TEAM.find(function(t){return t.email===p.email;});
    if(tm) {
      tm.horas=p.horas||0; tm.ingresos=p.ingresos||0; tm.beneficio=p.beneficio||0;
      tm.racha=p.racha||0; tm.reportado=p.reportado||false; tm.reportado_count=p.reportado_count||0;
      tm.mood=p.mood||null; tm.bloqueo=p.bloqueo||''; tm.ayuda_count=p.ayuda_count||0;
      tm.mentorias_total=p.mentorias_total||0; tm.asesorias_total=p.asesorias_total||0;
      tm.reuniones_total=p.reuniones_total||0; tm.badge_semana_bestia=p.badge_semana_bestia||false;
      tm.badge_conector=p.badge_conector||false; tm.badge_chapado=p.badge_chapado||false;
    }
  });
  renderDash(); renderRanking(); renderEH();
}

async function syncProyectos() {
  var data = await DB.getProyectos();
  proyectos = data.map(function(p) {
    return {
      id:p.id, nombre:p.nombre, desc:p.descripcion||'', estado:p.estado,
      meta:p.meta||0, miembros:p.miembros||[], ingresos:p.ingresos||0,
      gastos:p.gastos||0, beneficio:p.beneficio||0, horas_total:p.horas_total||0,
      reportes_count:p.reportes_count||0, aprendizajes_count:p.aprendizajes_count||0,
      avances_count:p.avances_count||0, bloqueos_count:p.bloqueos_count||0
    };
  });
  renderProyCards(); updSelects(); renderDash();
}

async function syncHoras() {
  var data = await DB.getHoras();
  // allHoras contiene TODOS los registros de todos los miembros del equipo
  allHoras = data.map(function(h) {
    return {id:h.id, email:h.email, proyecto:h.proyecto||'', descripcion:h.descripcion||'',
            horas:parseFloat(h.horas)||0, fecha:h.fecha, ini:h.hora_ini||'', fin:h.hora_fin||''};
  });
  // Horas del usuario actual desde Supabase
  var mySupaHoras = allHoras.filter(function(h){return cu && h.email===cu.email;});
  // Entradas locales pendientes que aún no tienen id real de Supabase
  var localPendientes = userHoras.filter(function(h){return String(h.id).startsWith('local_');});
  // Eliminar locales que ya existen en Supabase (misma fecha + hora_ini + hora_fin + horas ≈ iguales)
  // Evita duplicados cuando realtime llega antes del .then() callback
  localPendientes = localPendientes.filter(function(lh){
    return !mySupaHoras.some(function(sh){
      return sh.fecha === lh.fecha
        && sh.ini   === lh.ini
        && sh.fin   === lh.fin
        && Math.abs(sh.horas - lh.horas) < 0.01
        && sh.email === lh.email;
    });
  });
  userHoras = mySupaHoras.concat(localPendientes);
  // Orden descendente por fecha (más reciente primero)
  userHoras.sort(function(a,b){return a.fecha > b.fecha ? -1 : a.fecha < b.fecha ? 1 : 0;});
  renderHCList(); renderHCHist(); renderHDash(); renderDash();
}

async function syncReportes() {
  var data = await DB.getReportes();
  window.allReportes = data.map(function(r) {
    return {
      id:r.id, autor_email:r.autor_email, periodo:r.periodo, proyecto:r.proyecto||'',
      mood:r.mood||'', avances:r.avances||'', logro:r.logro||'', bloqueos:r.bloqueos||'',
      aprendizajes:r.aprendizajes||'', proximos:r.proximos||'', feedback:r.feedback||'',
      ayuda:r.ayuda||'', ayuda_quien:r.ayuda_quien||'', riesgo:r.riesgo||'',
      horas:r.horas||0, importe:r.importe||0, beneficio:r.beneficio||0,
      mentorias:r.mentorias||0, ts:r.ts||0,
      asLegal:r.as_legal||0, asFin:r.as_fin||0, asTech:r.as_tech||0,
      reunExp:r.reun_exp||0, reunVal:r.reun_val||0, reunVta:r.reun_vta||0,
      fecha:new Date(r.created_at).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})
    };
  });
  userReportes = window.allReportes.filter(function(r){return cu&&r.autor_email===cu.email;});
  renderReps(); renderReportesEquipo();
}

async function syncComentarios() {
  var data = await DB.getComentarios();
  equipoComentarios = data.map(function(c) {
    return {id:c.id, rep_id:c.reporte_id, tipo:c.tipo, texto:c.texto, autor_email:c.autor_email,
      fecha:new Date(c.created_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}), ts:new Date(c.created_at).getTime()};
  });
  renderReportesEquipo();
}

async function syncMovimientos() {
  var data = await DB.getMovimientos();
  movimientos = data.map(function(m) {
    return {id:m.id, tipo:m.tipo, importe:m.importe, proyecto:m.proyecto,
      concepto:m.concepto, categoria:m.categoria, fecha:m.fecha, personas:m.personas||[], factura:m.factura};
  });
  renderFinanzas(); renderDash();
}

async function syncKpis() {
  var data = await DB.getKpis();
  kpis = data.map(function(k) {
    return {id:k.id, email:k.email, tipo:k.tipo, puntos:k.puntos||1, nota:k.nota||'', fecha:k.fecha, ts:k.ts||0};
  });
  if(document.getElementById('page-kpis') && document.getElementById('page-kpis').classList.contains('on')) {
    renderKpisPage();
  }
}

// ══ CARGA INICIAL ══
async function cargarTodo() {
  await Promise.all([syncPerfiles(), syncProyectos(), syncHoras(), syncReportes(), syncComentarios(), syncMovimientos(), syncKpis()]);
  renderAll();
}
