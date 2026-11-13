/* RUMBO 3.4 · Pendiente de revisar — organización y legibilidad. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),pctReview=n=>Number(n).toLocaleString('es-ES',{maximumFractionDigits:2})+' %';
const money=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
const shortName=name=>String(name||'').replace(/^RUMBO\s+/i,'');
const totalRow=document.createElement('div');totalRow.className='review-portfolio-total';
totalRow.innerHTML='<span>Total de la cartera</span>';totalRow.append($('rebName'));$('r34BalanceForm').after(totalRow);
const balanceHint=document.createElement('p');balanceHint.className='review-balance-hint';balanceHint.textContent='Antes de aportar, indica el saldo actual de cada activo.';$('r34BalanceForm').before(balanceHint);
const emptyPortfolio=document.createElement('div');emptyPortfolio.id='reviewEmptyPortfolio';emptyPortfolio.innerHTML='<h1>Cartera</h1><p>Elige un plan para empezar a registrar tus saldos.</p><button type="button" class="btn">Ver planes →</button>';
emptyPortfolio.querySelector('button').onclick=()=>go('activos');$('cartera').append(emptyPortfolio);
const reviewVersion=document.createElement('p');reviewVersion.className='review-version';reviewVersion.textContent='3.4 · Pendiente de revisar';document.querySelector('.r2-footer').before(reviewVersion);
const baseRender=render;
render=function(){baseRender();renderReviewLayout();};
function renderReviewLayout(){
 const active=!!s.type,m=model(),list=assets().filter(a=>a.w>0),name=shortName(pname());
 $('reviewEmptyPortfolio').hidden=active;
 $('reviewComponentsTitle').hidden=!active;
 const overview=$('reviewActivePlan');overview.hidden=!active;
 const theme=s.type==='cumbre'?'#c4b2e5':s.type==='horizonte'?'#97cfda':'#97d4c1';overview.style.setProperty('--plan-color',theme);
 if(active){
  const blocks=m?[{label:'Renta variable',value:m.blocks.eq,color:'#86b8df'},{label:'Bonos',value:m.blocks.bond,color:'#8cd5bd'},{label:'Cripto',value:m.blocks.crypto,color:'#d6b8e7'}].filter(x=>x.value):list.map(a=>({label:a.short,value:a.w,color:a.color}));
  overview.innerHTML='<div class="review-plan-heading"><div><span class="review-active-label">✓ Plan activo'+(s.type==='custom'?' · Propio':' · RUMBO')+'</span><h2>'+esc(name)+'</h2></div>'+(m?'<span class="review-risk">Riesgo '+m.risk+'/7</span>':'')+'</div><div class="review-plan-bar" role="img" aria-label="'+esc(blocks.map(b=>b.label+' '+pctReview(b.value)).join(', '))+'">'+blocks.map(b=>'<i style="width:'+b.value+'%;background:'+b.color+'"></i>').join('')+'</div><div class="review-block-labels">'+blocks.map(b=>'<span><i style="background:'+b.color+'"></i>'+esc(b.label)+' <b>'+pctReview(b.value)+'</b></span>').join('')+'</div>';
 }
 const catalog=$('assetCatalog');catalog.hidden=!active;
 const costs=$('reviewPlanCosts');costs.hidden=!active;
 costs.innerHTML='<summary>Costes y criterios del plan <span aria-hidden="true">＋</span></summary><div class="r34-plan-details">'+(m?rumboProductDetails.costTable(list)+rumboProductDetails.selectionNotes(list):'<p>Los activos y los porcentajes de este plan los has definido tú. Consulta el ISIN, la clase y los costes en tu entidad; no deducimos las comisiones solo por el nombre.</p>')+(m?'<p class="r34-note">Riesgo en escala propia; no es el indicador oficial de los fondos. Rentabilidad supuesta para las simulaciones: '+pctReview(m.rate)+' anual, sin garantía. Las fichas conservan la fecha de revisión de sus fuentes.</p>':'')+'</div>';
 const selection=$('models').closest('.card');selection.querySelector('.head h2').textContent=active?'Otros planes':'Elige un plan';
 selection.querySelector('.r2-plan-intro').textContent=active?'Explora otros repartos antes de decidir un cambio.':'Tres repartos de ejemplo. También puedes crear el tuyo.';
 $('models').querySelectorAll('.model').forEach(card=>{
  const isCurrent=card.classList.contains('model-'+s.type);card.hidden=isCurrent;
  card.querySelector('.model-overline').textContent='PLAN DE EJEMPLO';
  const stat=card.querySelector('.model-stats span:last-child');stat.innerHTML='Supuesto anual <strong>'+pctReview(MODELS[[...card.classList].find(c=>/^model-(refugio|horizonte|cumbre)$/.test(c)).replace('model-','')].rate)+'</strong>';
 });
 $('models').closest('.card').querySelector('.portfolio-footnote').textContent='Riesgo en escala propia. Los rendimientos usados en las simulaciones son hipótesis, no previsiones.';
 $('customCard').hidden=s.type==='custom'&&$('customEditor').hidden;
 $('editPlanFromAssets').onclick=()=>{$('customCard').hidden=false;if($('customEditor').hidden)$('customToggle').click();};
 $('userName').closest('.card').hidden=true;
 $('rebName').textContent=money(total());
 $('activePlanCard').classList.add('review-plan-compact');
}
// Cerrar un editor propio vuelve a mostrar solo el plan activo.
const originalCustomToggle=$('customToggle').onclick;
$('customToggle').onclick=()=>{originalCustomToggle();if($('customEditor').hidden&&s.type==='custom')$('customCard').hidden=true;};
render();
})();
