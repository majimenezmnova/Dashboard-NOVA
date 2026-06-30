// ══ SISTEMA DE PUNTOS v3 ══
// 0.5pt/hora · 1pt/10€ · 50pt/período reportado · badges acumulables
function calcBadgePts(m){
  var bpts=0;
  // Horas
  if(m.horas>=30)  bpts+=15;
  if(m.horas>=80)  bpts+=30;
  if(m.horas>=150) bpts+=55;
  if(m.horas>=250) bpts+=100;
  if(m.horas>=400) bpts+=175;
  if(m.horas>=600) bpts+=300;
  // Racha
  if(m.racha>=3)  bpts+=20;
  if(m.racha>=5)  bpts+=45;
  if(m.racha>=8)  bpts+=80;
  if(m.racha>=10) bpts+=200;
  if(m.racha>=10&&m.horas>=(m.reportado_count||0)*20) bpts+=250;
  if(m.racha>=10&&m.horas>=(m.reportado_count||0)*20&&m.ingresos>0) bpts+=400;
  // Ingresos
  if(m.ingresos>0)      bpts+=20;
  if(m.ingresos>=1000)  bpts+=50;
  if(m.ingresos>=3000)  bpts+=100;
  if(m.ingresos>=5000)  bpts+=250;
  if(m.ingresos>=10000) bpts+=400;
  if(m.ingresos>=20000) bpts+=700;
  // Reportes
  if((m.reportado_count||0)>=1)  bpts+=10;
  if((m.reportado_count||0)>=4)  bpts+=30;
  if((m.reportado_count||0)>=7)  bpts+=60;
  if((m.reportado_count||0)>=10) bpts+=150;
  if((m.reportado_count||0)>=10&&(m.mentorias_total||0)>=10) bpts+=200;
  if((m.reportado_count||0)>=10&&(m.mentorias_total||0)>=10&&(m.asesorias_total||0)>=10) bpts+=350;
  // Reuniones
  if((m.reuniones_total||0)>=5)  bpts+=15;
  if((m.reuniones_total||0)>=15) bpts+=35;
  if((m.reuniones_total||0)>=30) bpts+=65;
  if((m.reuniones_total||0)>=50) bpts+=120;
  // Mentorías + asesorías combinadas
  var mTot=(m.mentorias_total||0)+(m.asesorias_total||0);
  if(mTot>=3)  bpts+=15;
  if(mTot>=8)  bpts+=35;
  if(mTot>=15) bpts+=65;
  if(mTot>=25) bpts+=120;
  // Especiales
  if(m.badge_semana_bestia) bpts+=50;
  if(m.badge_conector)      bpts+=25;
  if(m.badge_chapado)       bpts+=300;
  return bpts;
}

function pts(m){
  var h=Math.round(m.horas*0.5);
  var e=Math.round(m.ingresos/10);
  var r=(m.reportado_count||0)*50;
  var b=calcBadgePts(m);
  return {total:h+e+r+b, h:h, e:e, r:r, b:b};
}
function monL(d){var x=new Date(d),dw=x.getDay(),df=dw===0?-6:1-dw;x.setDate(x.getDate()+df);x.setHours(0,0,0,0);return x;}
function monD(d){var m=monL(d),s=new Date(m);s.setDate(s.getDate()+6);s.setHours(23,59,59,999);return s;}
function fmtSem(d){var m=monL(d),s=monD(d),o={day:'numeric',month:'short'};return m.toLocaleDateString('es-ES',o)+' – '+s.toLocaleDateString('es-ES',o);}
function fmtE(n){return n===0?'<span style="color:var(--text3)">—</span>':(n>0?'+':'')+n.toLocaleString('es-ES')+'€';}
function colB(n){return n>0?'color:#3B6D11;font-weight:600':n<0?'color:#A32D2D;font-weight:600':'color:var(--text3)';}
