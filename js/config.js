var USERS={
  'majimenezm.nova@gmail.com':   {pass:'1234',name:'Migue',   ini:'MI',role:'junta', av:'av0'},
  'zarkojr.nova@gmail.com':      {pass:'1234',name:'Zarko',   ini:'ZA',role:'member',av:'av1'},
  'luiscastillonn.nova@gmail.com':{pass:'1234',name:'Casti',  ini:'CA',role:'junta', av:'av2'},
  'carlarey.nova@gmail.com':     {pass:'1234',name:'Carla',   ini:'CL',role:'member',av:'av3'},
  'fernandosf.nova@gmail.com':   {pass:'1234',name:'Fer',     ini:'FE',role:'junta', av:'av4'},
  'fernandogg.nova@gmail.com':   {pass:'1234',name:'Fernando',ini:'FN',role:'member',av:'av5'},
  'manuelure.nova@gmail.com':    {pass:'1234',name:'Manu',    ini:'MN',role:'member',av:'av6'},
  'diegob.nova@gmail.com':       {pass:'1234',name:'Diego',   ini:'DI',role:'member',av:'av7'},
  'angeltc.nova@gmail.com':      {pass:'1234',name:'Angel',   ini:'AN',role:'member',av:'av8'}
};
var TEAM=Object.keys(USERS).map(function(e){return{email:e,horas:0,ingresos:0,racha:0,reportado:false,reportado_count:0,mood:null,proyecto:'',bloqueo:'',bonus:0,badge_semana_bestia:false,badge_desbloqueado:false,badge_conector:false,badge_chapado:false,ayuda_count:0,mentorias_total:0,asesorias_total:0,reuniones_total:0,beneficio:0,badge_tuvo_bloqueo:false};});
var MOOD_HIST=[];
var ALL_BADGES=[
  // ── HORAS ──
  {sec:'horas', icon:'⏱', lbl:'Arrancando',    desc:'30h registradas',   req:function(m){return m.horas>=30;},  pts:15,  tier:'Bronce',   cls:'bi-coral'},
  {sec:'horas', icon:'⏱', lbl:'Trabajador',    desc:'80h registradas',   req:function(m){return m.horas>=80;},  pts:30,  tier:'Plata',    cls:'bi-gray'},
  {sec:'horas', icon:'⏱', lbl:'Máquina',       desc:'150h registradas',  req:function(m){return m.horas>=150;}, pts:55,  tier:'Oro',      cls:'bi-gold'},
  {sec:'horas', icon:'⏱', lbl:'Nova no para',  desc:'250h registradas',  req:function(m){return m.horas>=250;}, pts:100, tier:'Platino',  cls:'bi-purple'},
  {sec:'horas', icon:'💎', lbl:'400 horas',     desc:'400h registradas (~3h/día)',   req:function(m){return m.horas>=400;}, pts:175, tier:'Diamante', cls:'bi-teal'},
  {sec:'horas', icon:'🌌', lbl:'600 horas',     desc:'600h registradas (~4.5h/día)', req:function(m){return m.horas>=600;}, pts:300, tier:'Nova',     cls:'bi-purple'},
  // ── RACHA ──
  {sec:'racha', icon:'🔥', lbl:'Constante',     desc:'3 períodos seguidos',       req:function(m){return m.racha>=3;},  pts:20,  tier:'Bronce',   cls:'bi-coral'},
  {sec:'racha', icon:'🔥', lbl:'Disciplinado',  desc:'5 períodos seguidos',       req:function(m){return m.racha>=5;},  pts:45,  tier:'Plata',    cls:'bi-gray'},
  {sec:'racha', icon:'🔥', lbl:'Imparable',     desc:'8 períodos seguidos',       req:function(m){return m.racha>=8;},  pts:80,  tier:'Oro',      cls:'bi-gold'},
  {sec:'racha', icon:'🔥', lbl:'Leyenda',       desc:'Los 10 períodos sin fallar',req:function(m){return m.racha>=10;}, pts:200, tier:'Platino',  cls:'bi-purple'},
  {sec:'racha', icon:'💎', lbl:'Reporte + horas', desc:'10 períodos con reporte Y +20h cada uno', req:function(m){return m.racha>=10&&m.horas>=(m.reportado_count||0)*20;}, pts:250, tier:'Diamante', cls:'bi-teal'},
  {sec:'racha', icon:'🌌', lbl:'El inmortal',   desc:'10 períodos sin fallar + mínimo 200h totales', req:function(m){return m.racha>=10&&m.horas>=200;}, pts:400, tier:'Nova', cls:'bi-purple'},
  // ── INGRESOS ──
  {sec:'ingresos', icon:'💶', lbl:'Primer euro',         desc:'Primer ingreso registrado', req:function(m){return m.ingresos>0;},       pts:20,  tier:'Bronce',   cls:'bi-coral'},
  {sec:'ingresos', icon:'💶', lbl:'Facturando',          desc:'1.000€ acumulados',         req:function(m){return m.ingresos>=1000;},    pts:50,  tier:'Plata',    cls:'bi-gray'},
  {sec:'ingresos', icon:'💶', lbl:'Generador',           desc:'3.000€ acumulados',         req:function(m){return m.ingresos>=3000;},    pts:100, tier:'Oro',      cls:'bi-gold'},
  {sec:'ingresos', icon:'💶', lbl:'Máquina de hacer dinero', desc:'5.000€ acumulados',    req:function(m){return m.ingresos>=5000;},    pts:250, tier:'Platino',  cls:'bi-purple'},
  {sec:'ingresos', icon:'💎', lbl:'10.000€',             desc:'10.000€ acumulados',        req:function(m){return m.ingresos>=10000;},   pts:400, tier:'Diamante', cls:'bi-teal'},
  {sec:'ingresos', icon:'🌌', lbl:'Nova millonaria',     desc:'20.000€ acumulados — solo los auténticos', req:function(m){return m.ingresos>=20000;}, pts:700, tier:'Nova', cls:'bi-purple'},
  // ── REPORTES ──
  {sec:'reportes', icon:'📝', lbl:'Primer reporte', desc:'Primer reporte entregado',   req:function(m){return (m.reportado_count||0)>=1;},  pts:10,  tier:'Bronce',  cls:'bi-coral'},
  {sec:'reportes', icon:'📝', lbl:'Reflexivo',      desc:'4 reportes entregados',      req:function(m){return (m.reportado_count||0)>=4;},  pts:30,  tier:'Plata',   cls:'bi-gray'},
  {sec:'reportes', icon:'📝', lbl:'Comprometido',   desc:'7 reportes entregados',      req:function(m){return (m.reportado_count||0)>=7;},  pts:60,  tier:'Oro',     cls:'bi-gold'},
  {sec:'reportes', icon:'📝', lbl:'Sin excusas',    desc:'Los 10 reportes entregados', req:function(m){return (m.reportado_count||0)>=10;}, pts:150, tier:'Platino', cls:'bi-purple'},
  // ── REUNIONES ──
  {sec:'reuniones', icon:'🤝', lbl:'Primer encuentro', desc:'5 reuniones registradas',  req:function(m){return (m.reuniones_total||0)>=5;},  pts:15,  tier:'Bronce',  cls:'bi-coral'},
  {sec:'reuniones', icon:'🤝', lbl:'Networker',        desc:'15 reuniones registradas', req:function(m){return (m.reuniones_total||0)>=15;}, pts:35,  tier:'Plata',   cls:'bi-gray'},
  {sec:'reuniones', icon:'🤝', lbl:'Conector',         desc:'30 reuniones registradas', req:function(m){return (m.reuniones_total||0)>=30;}, pts:65,  tier:'Oro',     cls:'bi-gold'},
  {sec:'reuniones', icon:'🤝', lbl:'Máquina social',   desc:'50 reuniones registradas', req:function(m){return (m.reuniones_total||0)>=50;}, pts:120, tier:'Platino', cls:'bi-purple'},
  // ── MENTORÍAS ──
  {sec:'mentorias', icon:'🧠', lbl:'Curioso',        desc:'3 mentorías o asesorías registradas',  req:function(m){return (m.mentorias_total||0)+(m.asesorias_total||0)>=3;},  pts:15,  tier:'Bronce',  cls:'bi-coral'},
  {sec:'mentorias', icon:'🧠', lbl:'Aprendedor',     desc:'8 mentorías o asesorías registradas',  req:function(m){return (m.mentorias_total||0)+(m.asesorias_total||0)>=8;},  pts:35,  tier:'Plata',   cls:'bi-gray'},
  {sec:'mentorias', icon:'🧠', lbl:'El que aprende', desc:'15 mentorías o asesorías registradas', req:function(m){return (m.mentorias_total||0)+(m.asesorias_total||0)>=15;}, pts:65,  tier:'Oro',     cls:'bi-gold'},
  {sec:'mentorias', icon:'🧠', lbl:'Mentor addict',  desc:'25 mentorías o asesorías registradas', req:function(m){return (m.mentorias_total||0)+(m.asesorias_total||0)>=25;}, pts:120, tier:'Platino', cls:'bi-purple'},
  // ── ESPECIALES ──
  {sec:'especial', icon:'⚡', lbl:'Semana bestia', desc:'30h en una semana (lun-dom)',           req:function(m){return m.badge_semana_bestia||false;}, pts:50,  tier:'Especial',  cls:'bi-gold'},
  {sec:'especial', icon:'🤝', lbl:'Conector',      desc:'Ayuda pedida en 3 reportes distintos',  req:function(m){return m.badge_conector||false;},      pts:25,  tier:'Especial',  cls:'bi-gold'},
  {sec:'especial', icon:'👑', lbl:'El Chapado',    desc:'1.º en ranking el 15 de septiembre',    req:function(m){return m.badge_chapado||false;},        pts:300, tier:'Legendary', cls:'bi-gold'}
];
var MOTES=['🏆 El Chapado','🥈 El Constante','🥉 El Prometedor','⚡ En progreso','💪 Calentando','🎯 En la pista','🚀 Despegando','😴 Modo siesta','🐢 Paso a paso'];
var proyectos=[],userHoras=[],allHoras=[],userReportes=[],cu=null,selMood='',charts={},cf={per:'sem',proj:'sem'},sbOpen=true;
