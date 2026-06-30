// SIDEBAR
function toggleSB(){sbOpen=!sbOpen;document.getElementById('sidebar').classList.toggle('closed',!sbOpen);setTimeout(function(){renderCharts();renderRacha();},280);}
function toggleGrp(id,el){
  var g=document.getElementById(id),open=g.style.display==='none';
  g.style.display=open?'block':'none';
  var ico=document.getElementById('ico-rep');if(ico)ico.style.transform=open?'rotate(180deg)':'rotate(0)';
}

// NAV
var PTITLES={dashboard:'Dashboard',ranking:'Ranking & Badges','nuevo-reporte':'Nuevo reporte','mis-reportes':'📄 Mis reportes','reportes-equipo':'💬 Reportes del equipo','mis-horas':'Mis horas',proyectos:'Proyectos',finanzas:'Finanzas',equipo:'Vista del equipo',informe:'Informe global'};
function go(id,el){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('act');});
  document.getElementById('page-'+id).classList.add('on');
  if(el)el.classList.add('act');
  document.getElementById('tb-title').textContent=PTITLES[id]||id;
  if(id==='dashboard')setTimeout(function(){renderDash();renderCharts();renderRacha();},60);
  if(id==='ranking')renderRanking();
  if(id==='mis-horas')setTimeout(function(){updSelects();var hcf=document.getElementById('hc-fecha');if(hcf)hcf.valueAsDate=new Date();renderHCList();renderHCHist();},50);
  if(id==='proyectos')setTimeout(renderProyCards,50);
  if(id==='equipo')setTimeout(renderEquipo,50);
  if(id==='reportes-equipo')setTimeout(function(){initReportesEquipo();},50);
  if(id==='finanzas')setTimeout(function(){initFinanzas();renderFinanzas();},50);
  if(id==='nuevo-reporte')setTimeout(initRepPage,50);
  if(id==='informe')setTimeout(renderInforme,50);
}

// RENDER ALL
function renderAll(){
  renderDash();renderReps();renderProyCards();renderRanking();renderProyRanking();
  if(cu&&cu.role==='junta'){renderEquipo();renderInforme();}
  setTimeout(function(){renderCharts();renderRacha();},120);
}
