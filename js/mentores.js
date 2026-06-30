// ══ MENTORES ══
var _mentorSubTab = 'proy';

var MENTORES_DB = {
  1: {fase:"Idea / Problem Discovery", mentores:[
    {nombre:"Ibai Martínez", tags:["Innovación","BusinessStrategy"]},
    {nombre:"Humberto Matas", tags:["ServiceDesign","BusinessStrategy"]},
    {nombre:"Juanki", tags:["DesignThinking","Innovación"]}
  ]},
  2: {fase:"Customer Discovery", mentores:[
    {nombre:"Siham Bennani", tags:["DesignThinking","ServiceDesign"]},
    {nombre:"Gorane Careira", tags:["DesignThinking","Leadership"]},
    {nombre:"Rafael Fuentes", tags:["DesignThinking","UX/UI","SocialImpact"]}
  ]},
  3: {fase:"Definición de Hipótesis", mentores:[
    {nombre:"Javier Bernad", tags:["BusinessStrategy","VisualThinking"]},
    {nombre:"Gustavo González", tags:["BusinessStrategy","Teampreneurship"]},
    {nombre:"Antonio López", tags:["BusinessStrategy","DesignThinking"]}
  ]},
  4: {fase:"Construcción del MVP", mentores:[
    {nombre:"Berenice M. Tovar", tags:["Prototyping","DesignThinking","VisualThinking"]},
    {nombre:"Lara Larrañaga", tags:["ProductDesign","DesignThinking"]},
    {nombre:"Berta Lázaro", tags:["Prototyping","ServiceDesign"]}
  ]},
  5: {fase:"Validación / Customer Validation", mentores:[
    {nombre:"Gwenn Vallégant", tags:["Ventas","CustomerService"]},
    {nombre:"Szabolcs Nemeth", tags:["Ventas","DesignThinking"]},
    {nombre:"Gonzalo M. Rocañín", tags:["Ventas","ServiceDesign"]}
  ]},
  6: {fase:"Medir", mentores:[
    {nombre:"Mathew Fernández", tags:["CRM","UX/UI","Communication"]},
    {nombre:"Humberto Benavente", tags:["CRM"]},
    {nombre:"Pedro Solórzano", tags:["ProjectManagement","BusinessStrategy"]}
  ]},
  7: {fase:"Aprender", mentores:[
    {nombre:"Merche Aranda", tags:["DesignThinking","VisualThinking","Leadership"]},
    {nombre:"Ivo Cadenas", tags:["DesignThinking","BusinessStrategy","Innovation"]},
    {nombre:"Joris Van Heukelom", tags:["DesignThinking","BusinessStrategy"]}
  ]},
  8: {fase:"Pivotar o Perseverar", mentores:[
    {nombre:"Javier Sevilla", tags:["BusinessStrategy","Investment"]},
    {nombre:"Pina de Paz", tags:["Investment","BusinessStrategy"]},
    {nombre:"Ignasi Bassas", tags:["BusinessStrategy","Leadership"]}
  ]},
  9: {fase:"Escalado / Growth", mentores:[
    {nombre:"Isabel Á. Mayoral", tags:["CampañasMarketing"]},
    {nombre:"Carla Filannino", tags:["Branding","Comunicación"]},
    {nombre:"Catalina Marqués", tags:["Ventas","Marketing","Postventa"]},
    {nombre:"Laura Muñóz", tags:["RedesSociales","ContenidoAudiovisual"]}
  ]},
  10: {fase:"Build-Measure-Learn Continuo", mentores:[
    {nombre:"Néstor Santana", tags:["Incubator","Accelerator","Teampreneurship"]},
    {nombre:"M. Sonia Borreguero", tags:["Finanzas","BusinessStrategy"]},
    {nombre:"Milagros Álvarez", tags:["ProcessImprovement","BudgetPlanning"]},
    {nombre:"Ernesto Gómez", tags:["EmployerBranding","Desarrollo"]}
  ]}
};
var MENTORES_ESPECIALES = [
  {nombre:"Lara",          area:"Branding"},
  {nombre:"Humberto Benavente", area:"Meta Ads"},
  {nombre:"Isa",           area:"Difusión en medios"},
  {nombre:"Antonio",       area:"Contactos Málaga / Ideas"},
  {nombre:"Eulalia",       area:"Comunicación ext. & int."},
  {nombre:"Josep",         area:"Consolidación proyecto"},
  {nombre:"Luis",          area:"Goat validación & roadmap"},
  {nombre:"Juanki",        area:"Design Thinking Málaga"},
  {nombre:"Ivo",           area:"Mundo empresarial"},
  {nombre:"Sonia",         area:"Finanzas"},
  {nombre:"Néstor",        area:"Aceleración"},
  {nombre:"Gus",           area:"Desarrollo proyecto"},
  {nombre:"Ignasi (Ranger)", area:"Goat en general"}
];

function swMentorSub(sub, btn) {
  _mentorSubTab = sub;
  document.querySelectorAll('#ptab-mentores .fb').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
  var ep = document.getElementById('ms-proy');
  var et = document.getElementById('ms-todos');
  if(ep) ep.style.display = sub==='proy' ? 'block' : 'none';
  if(et) et.style.display = sub==='todos' ? 'block' : 'none';
  if(sub==='todos') {
    setTimeout(function(){
      renderTodosMentores();
      var el=document.getElementById('todos-mentores-list');
      if(el && !el.innerHTML.trim()) setTimeout(renderTodosMentores, 200);
    }, 50);
  }
  if(sub==='proy') renderMentorCards(mentorFilterProy);
}

function renderTodosMentores() {
  var el = document.getElementById('todos-mentores-list'); if(!el) return;

  var total = 0;
  Object.values(MENTORES_DB).forEach(function(f){ total += f.mentores.length; });
  total += MENTORES_ESPECIALES.length;
  var lbl = document.getElementById('mentor-count-lbl');
  if(lbl) lbl.textContent = total + ' mentores disponibles';

  var html = '';

  Object.keys(MENTORES_DB).sort(function(a,b){return a-b;}).forEach(function(fnum) {
    var f = MENTORES_DB[fnum];
    html += '<div class="tmf-fase">'
      + '<div class="tmf-fase-hdr" onclick="toggleFaseCollapse(this)">'
        + '<div class="tmf-fase-num">'+fnum+'</div>'
        + '<div class="tmf-fase-name">'+f.fase+'</div>'
        + '<span style="font-size:11px;color:var(--text3)">'+f.mentores.length+' mentor'+(f.mentores.length!==1?'es':'')+'</span>'
        + '<i class="ti ti-chevron-down" style="font-size:13px;color:var(--text3);transition:transform .2s"></i>'
      + '</div>'
      + '<div class="tmf-fase-body">'
        + f.mentores.map(function(m) {
            var initials = m.nombre.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
            return '<div class="tmf-mentor-card">'
              + '<div class="tmf-mentor-ini">'+initials+'</div>'
              + '<div class="tmf-mentor-name">'+m.nombre+'</div>'
              + '<div class="tmf-mentor-tags">'+m.tags.map(function(t){return '<span class="tmf-tag">'+t+'</span>';}).join('')+'</div>'
              + '</div>';
          }).join('')
      + '</div></div>';
  });

  html += '<div class="tmf-fase">'
    + '<div class="tmf-fase-hdr" onclick="toggleFaseCollapse(this)">'
      + '<div class="tmf-fase-num" style="background:var(--amber-l);color:#633806">&#9733;</div>'
      + '<div class="tmf-fase-name">⭐ Profesionales para problemas concretos</div>'
      + '<span style="font-size:11px;color:var(--text3)">'+MENTORES_ESPECIALES.length+' especialistas</span>'
      + '<i class="ti ti-chevron-down" style="font-size:13px;color:var(--text3);transition:transform .2s"></i>'
    + '</div>'
    + '<div class="tmf-especial-grid">'
      + MENTORES_ESPECIALES.map(function(m) {
          return '<div class="tmf-esp-card">'
            + '<div class="tmf-esp-area">'+m.area+'</div>'
            + '<div class="tmf-esp-name">'+m.nombre+'</div>'
            + '</div>';
        }).join('')
    + '</div></div>';

  el.innerHTML = html;
}

function toggleFaseCollapse(hdr) {
  var body = hdr.nextElementSibling;
  var ico  = hdr.querySelector('.ti-chevron-down, .ti-chevron-up');
  if(!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if(ico) {
    ico.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
  }
}
