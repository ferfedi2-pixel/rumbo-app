/* RUMBO · Refinada 2. Extiende la V1 refinada sin modificar sus archivos originales. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const money=n=>Math.round(Number(n)||0).toLocaleString('de-DE')+' €';
const exact=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const percent=n=>Number(n).toLocaleString('es-ES',{maximumFractionDigits:2})+'%';
const deviationNumber=new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1});
function driftMarkup(asset,balance,value){
 if(!(balance>0))return '';
 const gap=100*value/balance-asset.w,rounded=Math.round(Math.abs(gap)*10)/10;
 const tone=rounded===0?'even':gap<0?'under':'over',sign=tone==='even'?'':gap<0?'−':'+';
 return '<small class="r34-drift r34-drift-'+tone+'" aria-label="Desviación '+sign+deviationNumber.format(rounded)+' puntos porcentuales">Desviación <span>'+sign+deviationNumber.format(rounded)+' %</span></small>';
}

const svg=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">'+path+'</svg>';
const icons={inicio:svg('<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>'),cartera:svg('<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M8 6V3h8v3M3 12h18m-11 0v3h4v-3"/>'),activos:svg('<circle cx="8" cy="8" r="5"/><circle cx="16" cy="16" r="5"/>'),rebalanceo:svg('<path d="M12 3v18M3 12h18"/>'),horizonte:svg('<path d="M3 20V4m0 16h18M6 15l5-5 4 3 6-9"/>')};
const globe=svg('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>');
function badge(a){return '<span class="asset-symbol" style="--asset:'+esc(a.color)+'">'+(a.id==='btc'?'<img src="/assets/coins/btc.svg" alt="">':a.id==='eth'?'<img src="/assets/coins/eth.png" alt="">':a.id==='world'||a.id==='em'?globe:a.id==='bonds'?svg('<path d="M4 9h16M3 21h18M5 9v12m7-12v12m7-12v12M3 7l9-4 9 4z"/>'):esc(a.short.slice(0,1)))+'</span>'}
const nav=document.querySelector('.nav');nav.id='r2Nav';
nav.innerHTML=[['inicio','Inicio'],['cartera','Cartera'],['rebalanceo','Aportar'],['horizonte','Horizonte']].map(([id,name])=>'<button data-v="'+id+'" aria-label="'+name+'">'+icons[id]+'<span>'+name+'</span></button>').join('');
nav.querySelectorAll('button').forEach(b=>b.onclick=()=>go(b.dataset.v));
const assetPage=document.createElement('section');assetPage.id='activos';assetPage.className='view';assetPage.innerHTML='<div class="r2-heading"><h1>Planes</h1><p>Tu reparto, con toda la información a mano.</p></div><div id="assetCatalog"></div><button class="btn" id="editPlanFromAssets">Editar mi plan</button>';
document.querySelector('main').append(assetPage);
$('editPlanFromAssets').onclick=()=>{customToggle.click()};
// Los planes se consultan juntos; Cartera queda dedicada a los saldos.
const planSelection=$('models').closest('.card'),customPlan=$('customCard');
const activeOverview=document.createElement('div');activeOverview.id='reviewActivePlan';
assetPage.querySelector('.r2-heading').after(activeOverview);
const componentHeading=document.createElement('h3');componentHeading.className='review-section-label';componentHeading.id='reviewComponentsTitle';componentHeading.textContent='Composición del plan';
$('assetCatalog').before(componentHeading);
const planCosts=document.createElement('details');planCosts.id='reviewPlanCosts';planCosts.className='review-cost-details';
$('assetCatalog').after(planCosts);
assetPage.append(planSelection,customPlan);
const originalGo=go;go=function(id){originalGo(id);document.body.dataset.page=id;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===id?'page':'false'))};
// Pesos de ejemplo estables: no actualizar objetivos por datos de mercado.
$('refresh').onclick=()=>{};$('refresh').hidden=true;
for(const a of Object.values(PROD)){a.detail=a.name;delete a.isin;delete a.ter}
const notes={world:'Renta variable de países desarrollados. Puede sufrir caídas importantes.',em:'Renta variable de mercados emergentes. Añade exposición geográfica con riesgos propios.',bonds:'Renta fija global. Su valor también puede caer por tipos de interés, crédito o divisa.',btc:'Criptoactivo de alta volatilidad. Puede sufrir pérdidas muy elevadas.',eth:'Criptoactivo de alta volatilidad, con riesgos de mercado y tecnológicos.'};
// Editor: selección rápida, nombre, color y pasos de cinco puntos.
renderCustom=function(){
$('customAssets').innerHTML=s.custom.map((a,i)=>'<div class="r2-editor-row"><select aria-label="Seleccionar activo '+(i+1)+'" onchange="r2Select('+i+',this.value)"><option value="">Personalizado</option>'+Object.values(PROD).map(x=>'<option value="'+x.id+'" '+(a.name===x.short?'selected':'')+'>'+x.short+'</option>').join('')+'</select><div class="r2-editor-name"><input type="color" aria-label="Color '+(i+1)+'" value="'+esc(a.color)+'" onchange="editA('+i+',\'color\',this.value)"><input aria-label="Nombre '+(i+1)+'" value="'+esc(a.name)+'" placeholder="Nombre del activo" onchange="editA('+i+',\'name\',this.value)"></div><div class="r2-stepper"><button aria-label="Restar 5 puntos a '+esc(a.name)+'" onclick="r2Step('+i+',-5)">−</button><label><input aria-label="Porcentaje '+(i+1)+'" type="number" min="0" max="100" step="5" value="'+a.pct+'" onchange="editA('+i+',\'pct\',Math.max(0,Math.min(100,Number(this.value)||0)))"><span>%</span></label><button aria-label="Sumar 5 puntos a '+esc(a.name)+'" onclick="r2Step('+i+',5)">+</button><button class="r2-delete" aria-label="Eliminar '+esc(a.name)+'" onclick="delA('+i+')">×</button></div></div>').join('')||'<p>Añade el primer activo de tu plan.</p>';
const sum=s.custom.reduce((z,a)=>z+Number(a.pct||0),0);$('customSum').textContent=percent(sum);$('customSum').classList.toggle('invalid',Math.abs(sum-100)>.00001);$('useCustom').disabled=!s.custom.length||Math.abs(sum-100)>.00001;
};
window.editA=(i,k,v)=>{s.custom[i][k]=k==='pct'?+v:v;renderCustom()};
window.r2Select=(i,id)=>{if(!PROD[id])return;s.custom[i].name=PROD[id].short;s.custom[i].color=PROD[id].color;renderCustom()};
window.r2Step=(i,d)=>{s.custom[i].pct=Math.max(0,Math.min(100,Number(s.custom[i].pct||0)+d));renderCustom()};
// Optimización ponderada: minimiza la suma de (peso final - objetivo)^2 / objetivo.
function r34Band(weight){return Math.min(5,Math.max(2,weight*.2))}
allocation=function(list,values,amount){
 if(!list.length||values.length!==list.length||!Number.isFinite(amount)||amount<0||values.some(v=>!Number.isFinite(v)||v<0)||list.some(x=>!Number.isFinite(x.w)||x.w<0)||Math.abs(list.reduce((z,x)=>z+x.w,0)-100)>1e-6)throw Error('Revisa los valores y los pesos: deben sumar 100%.');
 const cents=Math.round(amount*100),V=values.reduce((z,v)=>z+v,0);
 if(!cents)return list.map(()=>0);
 const T=V+cents/100;
 const items=list.map((x,i)=>({i,w:x.w/100,g:T*x.w/100-values[i]})).filter(x=>x.w>0);
 const sorted=[...items].sort((a,b)=>b.g/b.w-a.g/a.w||a.i-b.i);
 let G=0,W=0,lambda=0;
 for(let k=0;k<sorted.length;k++){
  G+=sorted[k].g;W+=sorted[k].w;
  const cut=(G-cents/100)/W;
  if(k===sorted.length-1||cut>=sorted[k+1].g/sorted[k+1].w){lambda=cut;break}
 }
 const whole=list.map(()=>0);
 for(const x of items)whole[x.i]=Math.max(0,Math.floor((x.g-lambda*x.w)*100+1e-8));
 let rest=cents-whole.reduce((z,v)=>z+v,0);
 // Redondeo discreto óptimo: menor incremento marginal del error ponderado.
 while(rest>0){
  const best=items.reduce((a,b)=>((2*(whole[b.i]-b.g*100)+1)/b.w)<((2*(whole[a.i]-a.g*100)+1)/a.w)?b:a);
  whole[best.i]++;rest--;
 }
 while(rest<0){
  const best=items.filter(x=>whole[x.i]>0).reduce((a,b)=>((-2*(whole[b.i]-b.g*100)+1)/b.w)<((-2*(whole[a.i]-a.g*100)+1)/a.w)?b:a);
  whole[best.i]--;rest++;
 }
 return whole.map(v=>v/100);
};
const baseCalc=calcNow;
calcNow=function(){
 const list=assets(),input=$('newMoney');if(!list.length){$('results').innerHTML='';return}
 const A=Number(input.value),vals=list.map(a=>Number(s.hold[a.id]||0));
 if(!input.value.trim()||!Number.isFinite(A)||A<0||vals.some(v=>!Number.isFinite(v)||v<0)||Math.abs(list.reduce((z,a)=>z+a.w,0)-100)>1e-6){$('results').innerHTML='<p role="alert" class="r2-error">Introduce valores válidos y un reparto que sume 100%.</p>';$('registerContribution').disabled=true;if($('r2Residual'))$('r2Residual').hidden=true;return}
 try{baseCalc()}catch(e){$('results').textContent=e.message;$('registerContribution').disabled=true;return}
 const V=vals.reduce((z,v)=>z+v,0),adds=allocation(list,vals,A),T=V+A;
 const min=list.some((a,i)=>a.w===0&&vals[i]>0)?Infinity:Math.max(0,...list.filter(a=>a.w>0).map(a=>Number(s.hold[a.id]||0)/(a.w/100)-V));
 $('results').innerHTML=list.map((a,i)=>{const after=vals[i]+adds[i],weight=T?100*after/T:0,diff=weight-a.w,off=Math.abs(diff)>Math.max(5,a.w*.25),paused=adds[i]===0;
 return '<div class="r2-result"><div class="r2-result-top">'+badge(a)+'<div class="r2-result-name"><strong>'+esc(a.short)+'</strong>'+driftMarkup(a,V,vals[i])+'</div><div class="r2-result-value"><span class="'+(paused?'r34-pause':'')+'">'+(paused?'Pausar':'Aportar')+'</span><b>'+exact(adds[i])+'</b></div><button class="asset-more" aria-label="Detalle de '+esc(a.short)+'" aria-expanded="false" onclick="r2Detail(this)">+</button></div><div class="r2-track" aria-label="Peso final '+percent(weight)+'; objetivo '+percent(a.w)+'"><i style="width:'+Math.min(100,weight)+'%;background:'+(off?'#D7A94B':a.color)+'"></i><b style="left:'+a.w+'%"></b></div><div class="r2-detail" hidden><table class="review-allocation-compare" aria-label="Comparación de capital y peso de '+esc(a.short)+'"><thead><tr><th scope="col">Actual</th><th scope="col">Tras aportar</th><th scope="col">Objetivo</th></tr></thead><tbody><tr><td>'+exact(vals[i])+'</td><td>'+exact(after)+'</td><td>'+exact(T*a.w/100)+'</td></tr><tr><td>'+percent(V?vals[i]/V*100:0)+'</td><td>'+percent(weight)+'</td><td>'+percent(a.w)+'</td></tr></tbody></table></div></div>' }).join('');
 $('contrib').textContent=money(A);
 let summary=$('r2Residual');if(!summary){summary=document.createElement('details');summary.id='r2Residual';$('results').after(summary)}
 summary.hidden=false;
 const residual=list.some((a,i)=>T&&Math.abs((vals[i]+adds[i])/T*100-a.w)>.000001);
 summary.innerHTML='<summary>'+(T===0?'Introduce tu capital para comparar':residual?'Quedan desviaciones · ver resumen':'Reparto objetivo alcanzado')+'</summary><p>Aportación mínima teórica para recuperar los pesos: <b>'+(Number.isFinite(min)?exact(min):'no es posible solo con aportaciones')+'</b>.</p><p><b>Optimización ponderada:</b> se minimizan las desviaciones finales teniendo en cuenta el peso objetivo de cada activo, sin ventas. Los activos con objetivo cero no reciben aportaciones. Las bandas no alteran el reparto.</p><p>Sin cambios de precios ni costes. El cálculo conserva los céntimos.</p>';
 $('rebalanceAlert')?.remove();
 $('registerContribution').disabled=!(A>0);
};
window.r2Detail=b=>{const d=b.closest('.r2-result').querySelector('.r2-detail');d.hidden=!d.hidden;b.textContent=d.hidden?'+':'−';b.setAttribute('aria-expanded',String(!d.hidden))};
// Horizonte: simulación en euros nominales, con supuestos independientes de la cartera.
const scenarioFields=[
 {key:'capital',label:'Saldo de partida',unit:'€',min:0,max:1e9},
 {key:'monthly',label:'Aportación mensual',unit:'€',min:0,max:1e9},
 {key:'rate',label:'Rentabilidad anual',unit:'%',min:-100,max:100},
 {key:'fee',label:'Costes anuales',unit:'%',min:0,max:100}
];
const legacyH=document.createElement('div');legacyH.hidden=true;legacyH.append(...$('horizonte').childNodes);
$('horizonte').innerHTML=`<div class="r2-heading"><span class="r2-eyebrow">SIMULACIÓN · HIPOTÉTICO</span><h1>Horizonte</h1><p>El tiempo también forma parte de tu plan.</p></div>
<div id="r2Projection"></div><div class="r2-horizon-controls">
 <label for="r2YearInput">Horizonte <strong id="r2Years"></strong></label><input id="r2YearInput" aria-label="Horizonte en años" type="range" min="1" max="30" step="1">
 <form id="r2ScenarioForm">
  <div class="r2-fields">${scenarioFields.map(({key,label,unit,min,max})=>`<div class="r2-scenario-field"><label for="scenario-${key}">${label}<span class="r2-scenario-unit" hidden> (${unit})</span></label><output id="scenario-display-${key}"></output><input id="scenario-${key}" type="number" inputmode="decimal" min="${min}" max="${max}" step="any" required disabled hidden></div>`).join('')}</div>
  <div class="r2-scenario-actions"><button type="button" class="btn ghost" id="r2UsePortfolio">Usar mi cartera</button><button type="submit" class="btn" id="r2EditScenario">Editar valores</button></div>
  <p class="r2-scenario-status" id="r2ScenarioStatus" role="status"></p>
 </form>
 <details><summary>Supuestos y límites</summary><p>Los valores de cartera toman el saldo total y el último importe indicado en Aportar como aportación mensual. Los planes RUMBO usan su rentabilidad supuesta y los gastos corrientes ponderados por pesos objetivo. En un plan propio, la rentabilidad y los costes parten de 0 % hasta que los indiques.</p><p>El cálculo descuenta los costes de la rentabilidad supuesta y añade las aportaciones al final de cada mes. Los resultados se expresan en euros nominales, sin impuestos ni ajuste por inflación. Los costes de referencia no incluyen compraventas ni otros costes de operación. Puedes perder capital.</p></details>
</div>`;
$('horizonte').append(legacyH);
let scenarioEditing=false;
const scenarioYears=()=>Math.min(30,Math.max(1,Math.round(Number(s.scenario?.years)||30)));
function portfolioScenario(){
 const active=model();
 const fee=active?(window.rumboProductDetails?.weightedAnnualCost(assets().filter(a=>a.w>0))??0):0;
 return {capital:total(),monthly:Number(s.money)||0,rate:active?.rate??0,fee:Number(fee.toFixed(8))};
}
const scenarioValues=()=>s.scenario?.values??portfolioScenario();
const scenarioEuro=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',useGrouping:'always',minimumFractionDigits:0,maximumFractionDigits:2});
const scenarioRate=new Intl.NumberFormat('es-ES',{maximumFractionDigits:3});
function renderScenarioControls(values){
 for(const {key,unit} of scenarioFields){
  const input=$('scenario-'+key),display=$('scenario-display-'+key);
  input.disabled=input.hidden=!scenarioEditing;
  display.hidden=scenarioEditing;
  input.parentElement.querySelector('.r2-scenario-unit').hidden=!scenarioEditing;
  if(!scenarioEditing)display.textContent=unit==='€'?scenarioEuro.format(values[key]):scenarioRate.format(values[key])+' %';
 }
 $('r2EditScenario').textContent=scenarioEditing?'OK':'Editar valores';
 $('r2ScenarioStatus').textContent=scenarioEditing?'Prueba otros valores. Solo se aplican a esta simulación.':s.scenario?.values?'Valores de simulación · tu cartera sigue igual.':model()?'Datos de tu cartera y supuestos de tu plan.':s.type?'Datos de tu cartera · indica la rentabilidad y los costes si los conoces.':'Define tus valores para probar una simulación.';
}
renderH=function(){
 const values=scenarioValues(),{capital:st,monthly:m,rate,fee}=values,years=scenarioYears(),r=Math.pow((1+rate/100)*(1-fee/100),1/12)-1;
 let val=st,paid=st;const points=[{v:st,p:st}];
 for(let month=1;month<=years*12;month++){val=val*(1+r)+m;paid+=m;if(month%12===0)points.push({v:val,p:paid})}
 const end=points.at(-1),max=Math.max(1,...points.flatMap(p=>[p.v,p.p]))*1.08,W=640,H=280,x=i=>52+i/years*566,y=v=>H-30-v/max*(H-55),line=k=>points.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(p[k]).toFixed(1)).join(' '),area=k=>line(k)+'L'+x(years)+','+(H-30)+'L52,'+(H-30)+'Z';
 const axis=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:1});
 $('r2Projection').innerHTML='<div class="r2-capital"><span>Capital final · '+years+' años</span><strong>'+money(end.v)+'</strong><small>En euros nominales</small></div><div class="r2-chart-legend"><span><i></i>Capital de partida y aportaciones</span><span><i></i>Valor estimado</span></div><svg class="r2-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Evolución hipotética hasta '+years+' años. Capital final '+money(end.v)+'"><defs><linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#39c6a3" stop-opacity=".6"/><stop offset="1" stop-color="#39c6a3" stop-opacity=".03"/></linearGradient></defs>'+[0,.25,.5,.75,1].map(t=>'<line x1="52" x2="618" y1="'+y(max*t)+'" y2="'+y(max*t)+'" stroke="#304b58" stroke-dasharray="3 5"/><text x="46" y="'+(y(max*t)+4)+'" text-anchor="end">'+axis.format(max*t)+'</text>').join('')+'<path d="'+area('v')+'" fill="url(#mintFill)"/><path d="'+area('p')+'" fill="#D9CCA8" opacity=".28"/><path d="'+line('p')+'" stroke="#D9CCA8" stroke-width="2" fill="none"/><path d="'+line('v')+'" stroke="#39C6A3" stroke-width="3" fill="none"/>'+[0,Math.round(years/3),Math.round(years*2/3),years].filter((v,i,a)=>a.indexOf(v)===i).map(n=>'<text x="'+x(n)+'" y="274" text-anchor="middle">'+n+' años</text>').join('')+'</svg><div class="r2-projection-totals"><div><span>Capital y aportaciones</span><strong>'+money(end.p)+'</strong></div><div><span>Diferencia estimada</span><strong>'+money(end.v-end.p)+'</strong></div></div>';
 $('r2Years').textContent=years+(years===1?' año':' años');$('r2YearInput').value=years;
 renderScenarioControls(values);
};
$('r2YearInput').oninput=e=>{s.scenario={years:Number(e.target.value),values:s.scenario?.values??null};save();renderH()};
$('r2ScenarioForm').onsubmit=e=>{
 e.preventDefault();
 if(!scenarioEditing){
  const values=scenarioValues();
  scenarioEditing=true;
  for(const {key} of scenarioFields)$('scenario-'+key).value=values[key];
  renderScenarioControls(values);
  $('scenario-capital').focus();
  return;
 }
 const values=Object.fromEntries(scenarioFields.map(({key})=>[key,$('scenario-'+key).valueAsNumber]));
 s.scenario={years:scenarioYears(),values};
 scenarioEditing=false;save();renderH();$('r2EditScenario').focus();
};
$('r2UsePortfolio').onclick=()=>{
 s.scenario={years:scenarioYears(),values:null};
 scenarioEditing=false;save();renderH();
 $('r2ScenarioStatus').textContent='Datos de tu cartera aplicados.';
};
const goWithReviewNav=go;
go=function(id){if(id!=='horizonte')scenarioEditing=false;goWithReviewNav(id)};
// Los importes se validan y guardan juntos. El reparto solo usa saldos confirmados.
const balanceList=$('holds'),balanceForm=document.createElement('form');
balanceForm.id='r34BalanceForm';balanceList.before(balanceForm);balanceForm.append(balanceList);
balanceForm.insertAdjacentHTML('beforeend','<div class="r34-balance-actions"><button type="submit" class="btn" id="r34SaveBalances">Actualizar</button><span role="status" id="r34BalanceStatus"></span></div>');
const balanceFormat=new Intl.NumberFormat('es-ES',{useGrouping:'always',maximumFractionDigits:2});
const readBalance=text=>{
 const v=text.trim();
 if(/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(v))return Number(v.replaceAll('.','').replace(',','.'));
 if(/^\d+\.\d{1,2}$/.test(v))return Number(v);
 return NaN;
};
balanceForm.onsubmit=e=>{
 e.preventDefault();
 const next={...s.hold},list=assets(),inputs=balanceList.querySelectorAll('input');
 for(let i=0;i<inputs.length;i++){
  const input=inputs[i],value=readBalance(input.value);
  if(!Number.isFinite(value)||value>Number.MAX_SAFE_INTEGER/100){
   input.setCustomValidity('Introduce un saldo válido, mayor o igual que cero, con hasta dos decimales.');input.reportValidity();return;
  }
  next[list[i].id]=value;
 }
 s.hold=next;save();render();$('r34BalanceStatus').textContent='Saldos actualizados.';
};
$('results').closest('.card').querySelector('.head').hidden=true;
const baseRender=render;render=function(){baseRender();polish()};
function polish(){
 const active=!!s.type,plan=$('activePlanCard');
 document.querySelector('#cartera .hero').hidden=true;
 const sel=$('models').closest('.card');sel.querySelector('.head h2').textContent=active?'Otros planes':'Elige un plan';
 if(!sel.querySelector('.r2-plan-intro')){const p=document.createElement('p');p.className='r2-plan-intro';p.textContent='Tres repartos de ejemplo, con distintos niveles de riesgo. O crea el tuyo.';sel.querySelector('.head').after(p)}
 plan.querySelector('.plan-active-head p')?.remove();
 $('rebalanceReview').hidden=true;$('selected').hidden=true;
 const holds=$('holds').closest('.card');holds.querySelector('h2').textContent='Saldos actuales';$('rebName').textContent=money(total());
 const held=assets(),balance=total();$('r34BalanceStatus').textContent='';
 $('holds').querySelectorAll('.hold').forEach((row,i)=>{
  const a=held[i],value=Number(s.hold[a.id]||0),input=row.querySelector('input'),name=row.querySelector('b');
  row.querySelector('.badge')?.remove();row.insertAdjacentHTML('afterbegin',badge(a));
  name.nextElementSibling?.remove();name.insertAdjacentHTML('afterend',driftMarkup(a,balance,value));
  input.setAttribute('aria-label','Saldo actual de '+a.short);input.removeAttribute('onchange');input.type='text';input.inputMode='decimal';input.required=true;input.placeholder='';input.value=balanceFormat.format(value);
  if(!input.parentElement.classList.contains('r34-euro-field')){
    const wrap=document.createElement('span');wrap.className='r34-euro-field';
    input.before(wrap);wrap.append(input);
   }
   input.onfocus=()=>{input.dataset.previousBalance=input.value;input.value='';};
   input.onblur=()=>{if(!input.value.trim())input.value=input.dataset.previousBalance||'0';};
   input.oninput=()=>{input.setCustomValidity('');$('r34BalanceStatus').textContent='Cambios sin guardar.';};
 });
 $('assetCatalog').innerHTML=assets().map(a=>'<article class="r2-catalog-row">'+badge(a)+'<div><h2>'+esc(a.short)+'</h2><p>'+esc(notes[a.id]||'Componente definido por ti. Comprueba su riesgo, liquidez y costes.')+'</p><span>Objetivo '+percent(a.w)+'</span></div></article>').join('')||'<p class="r2-empty">Crea tu cartera para ver aquí sus activos.</p>';
 $('editPlanFromAssets').textContent='Editar mi plan';$('editPlanFromAssets').hidden=s.type!=='custom';
 document.querySelector('#rebalanceo h1').textContent='Aportar';document.querySelector('#rebalanceo .hero p').textContent='Calcula. Tú decides y ejecutas.';
 document.querySelector('#rebalanceo .hero .kick').hidden=true;document.querySelector('#rebalanceo .hero .num').hidden=true;
 document.querySelector('.contribute-input .head').hidden=true;document.querySelector('.contribute-input .flow-help').hidden=true;
 $('newMoney').previousElementSibling.textContent='Nueva aportación (€)';
 $('homeTotal').textContent=money(total());

}
const footer=document.createElement('footer');footer.className='r2-footer';footer.textContent='Invertir implica riesgo de pérdida.';document.querySelector('main').after(footer);
for(const ext of ['JSON','CSV']){let b=document.createElement('button');b.className='btn ghost';b.textContent='Exportar '+ext;b.onclick=()=>{const data=ext==='JSON'?JSON.stringify(s,null,2):'Activo;Capital actual;Peso objetivo\r\n'+assets().map(a=>[a.short,s.hold[a.id]||0,a.w].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+data],{type:ext==='JSON'?'application/json':'text/csv'})),link=document.createElement('a');link.href=url;link.download='rumbo-refinada-2.'+ext.toLowerCase();link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('settingsActions').append(b)}
render();go('inicio');
})();
