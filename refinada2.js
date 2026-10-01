/* RUMBO · Refinada 2. Extiende la V1 refinada sin modificar sus archivos originales. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const money=n=>Math.round(Number(n)||0).toLocaleString('de-DE')+' €';
const exact=n=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const percent=n=>Number(n).toLocaleString('es-ES',{maximumFractionDigits:2})+'%';
const svg=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">'+path+'</svg>';
const icons={inicio:svg('<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>'),cartera:svg('<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M8 6V3h8v3M3 12h18m-11 0v3h4v-3"/>'),activos:svg('<circle cx="8" cy="8" r="5"/><circle cx="16" cy="16" r="5"/>'),rebalanceo:svg('<path d="M12 3v18M3 12h18"/>'),horizonte:svg('<path d="M3 20V4m0 16h18M6 15l5-5 4 3 6-9"/>')};
const globe=svg('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>');
function badge(a){return '<span class="asset-symbol" style="--asset:'+esc(a.color)+'">'+(a.id==='btc'?'<img src="/assets/coins/btc.svg" alt="">':a.id==='eth'?'<img src="/assets/coins/eth.png" alt="">':a.id==='world'||a.id==='em'?globe:a.id==='bonds'?svg('<path d="M4 9h16M3 21h18M5 9v12m7-12v12m7-12v12M3 7l9-4 9 4z"/>'):esc(a.short.slice(0,1)))+'</span>'}
const nav=document.querySelector('.nav');nav.id='r2Nav';
nav.innerHTML=[['inicio','Inicio'],['cartera','Cartera'],['activos','Activos'],['rebalanceo','Aportar'],['horizonte','Horizonte']].map(([id,name])=>'<button data-v="'+id+'" aria-label="'+name+'">'+icons[id]+'<span>'+name+'</span></button>').join('');
nav.querySelectorAll('button').forEach(b=>b.onclick=()=>go(b.dataset.v));
const assetPage=document.createElement('section');assetPage.id='activos';assetPage.className='view';assetPage.innerHTML='<div class="r2-heading"><h1>Activos</h1><p>Los componentes de tu plan.</p></div><div id="assetCatalog"></div><button class="btn" id="editPlanFromAssets">Editar mi plan</button>';
document.querySelector('main').append(assetPage);
$('editPlanFromAssets').onclick=()=>{go('cartera');$('reviewPlan')?.click()};
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
window.r2Select=(i,id)=>{if(!PROD[id])return;s.custom[i].name=PROD[id].short;s.custom[i].color=PROD[id].color;save();renderCustom()};
window.r2Step=(i,d)=>{s.custom[i].pct=Math.max(0,Math.min(100,Number(s.custom[i].pct||0)+d));save();renderCustom()};
// Proporcional al déficit, mayor resto en céntimos, incluido objetivo cero.
allocation=function(list,values,amount){
 if(!list.length||!Number.isFinite(amount)||amount<0||values.some(v=>!Number.isFinite(v)||v<0)||list.some(x=>!Number.isFinite(x.w)||x.w<0)||Math.abs(list.reduce((z,x)=>z+x.w,0)-100)>1e-6)throw Error('Revisa los valores y los pesos: deben sumar 100%.');
 const cents=Math.round(amount*100),T=values.reduce((z,v)=>z+v,0)+cents/100;
 const deficits=list.map((x,i)=>Math.max(0,T*x.w/100-values[i])),D=deficits.reduce((z,v)=>z+v,0);
 if(!cents)return list.map(()=>0);
 const raw=deficits.map(d=>D?cents*d/D:0),out=raw.map(Math.floor);
 let rest=cents-out.reduce((z,v)=>z+v,0);const order=raw.map((v,i)=>({i,r:v-out[i]})).sort((a,b)=>b.r-a.r||a.i-b.i);
 for(let j=0;j<rest;j++)out[order[j%order.length].i]++;
 return out.map(v=>v/100);
};
const baseCalc=calcNow;
calcNow=function(){
 const list=assets(),input=$('newMoney');if(!list.length){$('results').innerHTML='';return}
 const A=Number(input.value),vals=list.map(a=>Number(s.hold[a.id]||0));
 if(!input.value.trim()||!Number.isFinite(A)||A<0||vals.some(v=>!Number.isFinite(v)||v<0)||Math.abs(list.reduce((z,a)=>z+a.w,0)-100)>1e-6){$('results').innerHTML='<p role="alert" class="r2-error">Introduce valores válidos y un reparto que sume 100%.</p>';$('registerContribution').disabled=true;if($('r2Residual'))$('r2Residual').hidden=true;return}
 try{baseCalc()}catch(e){$('results').textContent=e.message;$('registerContribution').disabled=true;return}
 const V=vals.reduce((z,v)=>z+v,0),adds=allocation(list,vals,A),T=V+A;
 const min=list.some((a,i)=>a.w===0&&vals[i]>0)?Infinity:Math.max(0,...list.filter(a=>a.w>0).map(a=>Number(s.hold[a.id]||0)/(a.w/100)-V));
 $('results').innerHTML=list.map((a,i)=>{const after=vals[i]+adds[i],weight=T?100*after/T:0,diff=weight-a.w,off=Math.abs(diff)>Math.max(5,a.w*.25),status=adds[i]>.004?'Aportar':off?'Revisar':'Mantener';
 return '<div class="r2-result"><div class="r2-result-top">'+badge(a)+'<strong>'+esc(a.short)+'</strong><div class="r2-result-value"><span class="'+(off?'warning':'')+'">'+status+'</span><b>'+money(adds[i])+'</b></div><button class="asset-more" aria-label="Detalle de '+esc(a.short)+'" aria-expanded="false" onclick="r2Detail(this)">+</button></div><div class="r2-track" aria-label="Peso final '+percent(weight)+'; objetivo '+percent(a.w)+'"><i style="width:'+Math.min(100,weight)+'%;background:'+(off?'#D7A94B':a.color)+'"></i><b style="left:'+a.w+'%"></b></div><div class="r2-detail" hidden><dl><div><dt>Capital actual</dt><dd>'+exact(vals[i])+'</dd></div><div><dt>Aportación exacta</dt><dd>'+exact(adds[i])+'</dd></div><div><dt>Objetivo en euros</dt><dd>'+exact(T*a.w/100)+'</dd></div><div><dt>Peso objetivo</dt><dd>'+percent(a.w)+'</dd></div><div><dt>Peso tras aportar</dt><dd>'+percent(weight)+'</dd></div><div><dt>Desviación residual</dt><dd>'+(diff>0?'+':'')+percent(diff).replace('%','')+' pp</dd></div></dl></div></div>'}).join('');
 $('contrib').textContent=money(A);
 let summary=$('r2Residual');if(!summary){summary=document.createElement('details');summary.id='r2Residual';$('results').after(summary)}
 summary.hidden=false;
 const residual=list.some((a,i)=>T&&Math.abs((vals[i]+adds[i])/T*100-a.w)>.000001);
 summary.innerHTML='<summary>'+(T===0?'Introduce tu capital para comparar':residual?'Quedan desviaciones · ver resumen':'Reparto objetivo alcanzado')+'</summary><p>Aportación mínima teórica para recuperar los pesos: <b>'+(Number.isFinite(min)?exact(min):'no es posible solo con aportaciones')+'</b>.</p><p>Sin cambios de precios ni costes. Los importes principales están redondeados; el detalle conserva los céntimos.</p>';
 $('rebalanceAlert')?.remove();
 $('registerContribution').disabled=!(A>0);
};
window.r2Detail=b=>{const d=b.closest('.r2-result').querySelector('.r2-detail');d.hidden=!d.hidden;b.textContent=d.hidden?'+':'−';b.setAttribute('aria-expanded',String(!d.hidden))};
// Horizonte propio, basado en el gráfico de áreas de Lovable, hasta 30 años.
let scenario=s.scenario||{years:30,monthly:s.money||1000,rate:6,inflation:0,fee:0};
const legacyH=document.createElement('div');legacyH.hidden=true;legacyH.append(...$('horizonte').childNodes);
$('horizonte').innerHTML='<div class="r2-heading"><span class="r2-eyebrow">SIMULACIÓN · HIPOTÉTICO</span><h1>Horizonte</h1><p>El tiempo también forma parte de tu plan.</p></div><div id="r2Projection"></div><div class="r2-horizon-controls"><label>Horizonte <strong id="r2Years"></strong><input id="r2YearInput" type="range" min="1" max="30" step="1"></label><div class="r2-fields">'+[['monthly','Aportación mensual (€)',0,10000000],['rate','Rentabilidad anual (%)',0,30],['inflation','Inflación anual (%)',0,20],['fee','Costes anuales (%)',0,5]].map(([k,label,min,max])=>'<label>'+label+'<input id="scenario-'+k+'" type="number" min="'+min+'" max="'+max+'" step="'+(k==='monthly'?'10':'.1')+'"></label>').join('')+'</div><p class="r2-fine">Capital inicial: <b id="r2Initial"></b>. Puedes cambiarlo en Cartera.</p><details><summary>Supuestos y límites</summary><p>Aportaciones al final de cada mes. Rentabilidad anual constante, con costes descontados. Si introduces inflación, los resultados se expresan en euros de hoy. No incluye impuestos ni cambios del mercado. Puedes perder capital.</p></details></div>';
$('horizonte').append(legacyH);
renderH=function(){
 const st=total(),years=scenario.years,m=scenario.monthly,r=Math.pow((1+scenario.rate/100)*(1-scenario.fee/100),1/12)-1;let val=st,paid=st;const points=[{v:st,p:st}];
 for(let month=1;month<=years*12;month++){val=val*(1+r)+m;paid+=m;if(month%12===0){let def=Math.pow(1+scenario.inflation/100,month/12);points.push({v:val/def,p:paid/def})}}
 const end=points.at(-1),max=Math.max(1,...points.flatMap(p=>[p.v,p.p]))*1.08,W=640,H=280,x=i=>52+i/years*566,y=v=>H-30-v/max*(H-55),line=k=>points.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(p[k]).toFixed(1)).join(' '),area=k=>line(k)+'L'+x(years)+','+(H-30)+'L52,'+(H-30)+'Z';
 $('r2Projection').innerHTML='<div class="r2-capital"><span>Capital final · '+years+' años</span><strong>'+money(end.v)+'</strong><small>'+(scenario.inflation?'En euros de hoy':'En euros nominales')+'</small></div><div class="r2-chart-legend"><span><i></i>Capital aportado</span><span><i></i>Valor estimado</span></div><svg class="r2-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Evolución hipotética hasta '+years+' años. Capital final '+money(end.v)+'"><defs><linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#39c6a3" stop-opacity=".6"/><stop offset="1" stop-color="#39c6a3" stop-opacity=".03"/></linearGradient></defs>'+[0,.25,.5,.75,1].map(t=>'<line x1="52" x2="618" y1="'+y(max*t)+'" y2="'+y(max*t)+'" stroke="#304b58" stroke-dasharray="3 5"/><text x="46" y="'+(y(max*t)+4)+'" text-anchor="end">'+Math.round(max*t/1000)+'k</text>').join('')+'<path d="'+area('v')+'" fill="url(#mintFill)"/><path d="'+area('p')+'" fill="#D9CCA8" opacity=".28"/><path d="'+line('p')+'" stroke="#D9CCA8" stroke-width="2" fill="none"/><path d="'+line('v')+'" stroke="#39C6A3" stroke-width="3" fill="none"/>'+[0,Math.round(years/3),Math.round(years*2/3),years].filter((v,i,a)=>a.indexOf(v)===i).map(n=>'<text x="'+x(n)+'" y="274" text-anchor="middle">'+n+' años</text>').join('')+'</svg><div class="r2-projection-totals"><div><span>Aportado</span><strong>'+money(end.p)+'</strong></div><div><span>Diferencia estimada</span><strong>'+money(end.v-end.p)+'</strong></div></div>';
 $('r2Years').textContent=years+' años';$('r2YearInput').value=years;$('r2Initial').textContent=money(st);for(const k of ['monthly','rate','inflation','fee'])$('scenario-'+k).value=scenario[k];
};
$('r2YearInput').oninput=e=>{scenario.years=Number(e.target.value);s.scenario=scenario;save();renderH()};
for(const k of ['monthly','rate','inflation','fee'])$('scenario-'+k).onchange=e=>{if(!e.target.value||!e.target.checkValidity()){e.target.reportValidity();return}scenario[k]=Number(e.target.value);s.scenario=scenario;save();renderH()};
const baseRender=render;render=function(){baseRender();polish()};
function polish(){
 const active=!!s.type,plan=$('activePlanCard');
 document.querySelector('#cartera .hero').hidden=true;
 const sel=$('models').closest('.card');sel.querySelector('.head h2').textContent='Elige tu cartera';
 if(!sel.querySelector('.r2-plan-intro')){const p=document.createElement('p');p.className='r2-plan-intro';p.textContent='Tres repartos de ejemplo, con distintos niveles de riesgo. O crea el tuyo.';sel.querySelector('.head').after(p)}
 plan.querySelector('.plan-active-head p')?.remove();
 $('rebalanceReview').hidden=true;$('selected').hidden=true;
 const holds=$('holds').closest('.card');holds.querySelector('h2').textContent='Tus activos';$('rebName').textContent=money(total());
 $('holds').querySelectorAll('.hold').forEach((row,i)=>{const a=assets()[i];row.querySelector('.badge')?.remove();row.insertAdjacentHTML('afterbegin',badge(a));const input=row.querySelector('input');input.setAttribute('aria-label','Capital actual de '+a.short);input.type='text';input.inputMode='decimal';input.value=Number(s.hold[a.id]||0).toLocaleString('de-DE',{maximumFractionDigits:2});input.onfocus=()=>{input.value=String(s.hold[a.id]||'')};input.onchange=()=>{if(input.value===''||!input.checkValidity()){input.setCustomValidity('Introduce un importe válido, mayor o igual que cero.');input.reportValidity();return}input.setCustomValidity('');const value=Number(input.value.replace(',','.'));if(!Number.isFinite(value)||value<0){input.setCustomValidity('Introduce un importe válido.');input.reportValidity();return}setH(a.id,value)};input.oninput=()=>input.setCustomValidity('')});
 $('assetCatalog').innerHTML=assets().map(a=>'<article class="r2-catalog-row">'+badge(a)+'<div><h2>'+esc(a.short)+'</h2><p>'+esc(notes[a.id]||'Componente definido por ti. Comprueba su riesgo, liquidez y costes.')+'</p><span>Objetivo '+percent(a.w)+'</span></div></article>').join('')||'<p class="r2-empty">Crea tu cartera para ver aquí sus activos.</p>';
 $('editPlanFromAssets').textContent=active?'Editar mi plan':'Crear mi cartera';
 document.querySelector('#rebalanceo h1').textContent='Aportar';document.querySelector('#rebalanceo .hero p').textContent='Calcula. Tú decides y ejecutas.';
 document.querySelector('#rebalanceo .hero .kick').hidden=true;document.querySelector('#rebalanceo .hero .num').hidden=true;
 document.querySelector('.contribute-input .head').hidden=true;document.querySelector('.contribute-input .flow-help').hidden=true;
 $('newMoney').previousElementSibling.textContent='Nueva aportación (€)';
 $('homeTotal').textContent=money(total());
}
const footer=document.createElement('footer');footer.className='r2-footer';footer.textContent='Contenido educativo. No es asesoramiento financiero ni una recomendación de inversión. Rentabilidades pasadas no garantizan resultados futuros.';document.querySelector('main').after(footer);
for(const ext of ['JSON','CSV']){let b=document.createElement('button');b.className='btn ghost';b.textContent='Exportar '+ext;b.onclick=()=>{const data=ext==='JSON'?JSON.stringify(s,null,2):'Activo;Capital actual;Peso objetivo\r\n'+assets().map(a=>[a.short,s.hold[a.id]||0,a.w].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+data],{type:ext==='JSON'?'application/json':'text/csv'})),link=document.createElement('a');link.href=url;link.download='rumbo-refinada-2.'+ext.toLowerCase();link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('settingsActions').append(b)}
render();go('inicio');
})();
