/* RUMBO V1 · navegación diaria y revisión consciente del plan. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const planPage = byId('cartera');
  const rebPage = byId('rebalanceo');
  const planGrid = planPage.querySelector('.grid');
  const selectionCard = byId('models').closest('.card');
  const identityCard = byId('userName').closest('.card');
  const personalCard = byId('customCard');
  const selectedCard = byId('selected');
  const planCard = document.createElement('div');
  planCard.id = 'activePlanCard';
  planCard.className = 'card active-plan-card';
  planGrid.insertBefore(planCard, selectionCard);

  // El objetivo puede cambiar, pero los activos que aún se poseen siguen contando.
  const plannedAssets = assets;
  let showingModelDetails = false;
  assets = function () {
    const planned = plannedAssets();
    if (!s.type || showingModelDetails) return planned;
    const seen = new Set(planned.map(a => a.id));
    const catalog = {...PROD, ...(s.assetArchive || {})};
    (s.custom || []).forEach(a => {
      catalog[a.id] = {id:a.id,name:a.name,short:a.name,color:a.color};
    });
    Object.entries(s.hold || {}).forEach(([id, amount]) => {
      if (!(Number(amount) > 0) || seen.has(id)) return;
      const old = catalog[id] || {id,name:'Activo anterior',short:'Activo anterior',color:'#a7bac0'};
      planned.push({...old,id,short:old.short || old.name,w:0});
      seen.add(id);
    });
    return planned;
  };
  const originalAllocation = allocation;
  allocation = function (list, current, amount) {
    if (!list.some(x => x.w === 0)) return originalAllocation(list,current,amount);
    const active = list.map((x,i) => ({x,i})).filter(({x}) => x.w > 0);
    if (!active.length) return list.map(() => 0);
    const proposed = originalAllocation(active.map(({x}) => x),active.map(({i}) => current[i]),amount);
    const result = list.map(() => 0);
    active.forEach(({i},j) => {result[i] = proposed[j]});
    return result;
  };
  const originalInfo = window.info;
  window.info = id => {
    showingModelDetails = true;
    try {originalInfo(id)} finally {showingModelDetails = false}
  };

  // El cuarto acceso de la barra es el plan. Horizonte y datos viven en el menú.
  const addNav = document.querySelector('.nav [data-v="aportar"]');
  addNav.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-5 5 5-5 5 5M4 19h16"/></svg><span>Aportar</span>';
  const planNav = document.querySelector('.nav [data-v="cartera"]');
  planNav.setAttribute('aria-label','Mi plan');
  planNav.querySelector('span').textContent = 'Mi plan';

  const contributePage = document.createElement('section');
  contributePage.id = 'aportar';
  contributePage.className = 'view';
  contributePage.innerHTML = '<div class="hero"><div class="heroIn"><div><span class="kick">APORTACIÓN PERIÓDICA</span><h1>Aportar</h1><p>Dirige tu próxima aportación según el plan y los saldos actuales.</p></div></div></div><div class="grid"><div class="card contribute-input"><div class="head"><h2>Próxima aportación</h2><span class="pill" id="addPlanName">Sin plan</span></div><div id="contributeControls"></div><p class="flow-help">Es una propuesta. Tus saldos no cambiarán hasta que registres una aportación realizada.</p></div></div>';
  rebPage.after(contributePage);
  const contributeGrid = contributePage.querySelector('.grid');
  const inputField = byId('newMoney').closest('.field');
  inputField.querySelector('label').textContent = 'Importe previsto';
  const controls = byId('contributeControls');
  controls.append(inputField, byId('calc'));
  const resultCard = byId('results').closest('.card');
  resultCard.querySelector('.head h2').textContent = 'Reparto propuesto';
  contributeGrid.append(resultCard);
  const register = document.createElement('button');
  register.id = 'registerContribution';
  register.className = 'btn flow-register';
  register.type = 'button';
  register.textContent = 'Registrar aportación realizada';
  resultCard.append(register);
  const lastRecord = document.createElement('p');
  lastRecord.id = 'lastContribution';
  lastRecord.className = 'flow-help';
  resultCard.append(lastRecord);

  byId('rebalanceFlow')?.remove();
  const oldActions = byId('clear').closest('.actions');
  const clearSaldos = byId('clear');
  oldActions.remove();
  const reviewCard = document.createElement('div');
  reviewCard.id = 'rebalanceReview';
  reviewCard.className = 'card rebalance-review';
  rebPage.querySelector('.grid').append(reviewCard);
  const rebHero = rebPage.querySelector('.heroIn > div');
  rebHero.querySelector('.kick').textContent = 'CARTERA ACTUAL';
  rebHero.querySelector('p').textContent = 'Comprueba cuánto tienes y cómo se compara con tu objetivo.';
  rebHero.querySelector('.auto-chip')?.remove();

  const settings = document.createElement('section');
  settings.id = 'ajustes';
  settings.className = 'view';
  settings.innerHTML = '<div class="hero"><div class="heroIn"><div><span class="kick">DATOS LOCALES</span><h1>Ajustes</h1><p>Gestiona la información guardada en este dispositivo.</p></div></div></div><div class="grid"><div class="card"><div class="head"><h2>Datos de la cartera</h2></div><p class="flow-help">Puedes borrar solo los saldos o restablecer toda la aplicación. Ambas acciones piden confirmación.</p><div class="actions" id="settingsActions"></div></div></div>';
  document.querySelector('main').append(settings);
  clearSaldos.textContent = 'Borrar saldos';
  byId('settingsActions').append(clearSaldos);
  const resetButton = byId('resetPortfolio');
  resetButton.textContent = 'Restablecer todos los datos';
  byId('settingsActions').append(resetButton);
  byId('resetModal').querySelector('h3').textContent = 'Restablecer todos los datos';
  byId('resetModal').querySelector('p').textContent = 'Se borrarán el plan, los saldos, las aportaciones registradas y los ajustes de este dispositivo. No se puede deshacer.';

  const menu = byId('appMenu');
  menu.innerHTML = '<span class="menu-title">Más opciones</span><button type="button" id="openHorizon">Horizonte</button><button type="button" id="openSettings">Ajustes</button>';
  function closeMenu() {
    menu.classList.remove('on');
    byId('appMenuBtn').setAttribute('aria-expanded','false');
    byId('appMenuBtn').setAttribute('aria-label','Abrir menú');
  }
  byId('openHorizon').onclick = () => {closeMenu();go('horizonte')};
  byId('openSettings').onclick = () => {closeMenu();go('ajustes')};

  const flowModal = document.createElement('div');
  flowModal.id = 'planFlowModal';
  flowModal.className = 'plan-flow-modal';
  flowModal.innerHTML = '<div class="plan-flow-box" role="dialog" aria-modal="true" aria-labelledby="planFlowTitle"><div id="planFlowContent"></div></div>';
  document.body.append(flowModal);
  const content = byId('planFlowContent');
  let reviewing = false;
  let snapshot = null;
  let reason = '';
  let lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    content.innerHTML = html;
    flowModal.classList.add('on');
    content.querySelector('button,select')?.focus();
  }
  function closeModal() {
    flowModal.classList.remove('on');
    content.replaceChildren();
    lastFocus?.focus?.();
  }
  flowModal.addEventListener('click', e => {if (e.target === flowModal) closeModal()});
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && flowModal.classList.contains('on')) closeModal()});
  const copyCustom = () => (s.custom || []).map(a => ({...a}));
  const label = type => type === 'custom' ? (String(s.customName || '').trim() || 'Personalizada') : MODELS[type]?.name || 'Sin plan';
  const blocks = (type, custom) => {
    if (type === 'custom') return (custom || []).map(a => [a.name,+a.pct || 0]);
    const b = MODELS[type]?.blocks;
    return b ? [['Renta variable',b.eq],['Renta fija',b.bond],['Criptomonedas',b.crypto]].filter(([,v]) => v > 0) : [];
  };
  const blockMarkup = list => list.map(([name,value]) => '<div class="plan-flow-row"><span>'+esc(name)+'</span><strong>'+pct(value)+'</strong></div>').join('');
  function archivePlan() {
    s.assetArchive ||= {};
    assets().forEach(a => {s.assetArchive[a.id] = {id:a.id,name:a.name,short:a.short,color:a.color}});
    if (snapshot) snapshot.custom.forEach(a => {s.assetArchive[a.id] = {id:a.id,name:a.name,short:a.name,color:a.color}});
  }

  function renderPlanState() {
    const active = !!s.type;
    planPage.classList.toggle('plan-active',active);
    planPage.classList.toggle('plan-reviewing',reviewing);
    selectionCard.classList.toggle('selection-card',true);
    identityCard.classList.toggle('identity-card',true);
    planCard.hidden = !active;
    selectedCard.hidden = !active;
    const hero = planPage.querySelector('.heroIn > div');
    hero.querySelector('.kick').textContent = active ? 'TU ESTRATEGIA' : 'PRIMER PASO';
    hero.querySelector('h1').textContent = 'Mi plan';
    hero.querySelector('p').textContent = active ? 'El reparto que guía tus aportaciones y revisiones.' : 'Escoge una estrategia para empezar o crea la tuya.';
    if (!active) return;
    const m = model();
    const targets = blocks(s.type,s.custom);
    planCard.innerHTML = '<span class="plan-eyebrow">PLAN ACTIVO</span><div class="plan-active-head"><div><h2>'+esc(pname())+'</h2><p>Tu reparto objetivo para el largo plazo.</p></div><span class="pill">'+(m?'Riesgo '+m.risk+'/7':'Personalizada')+'</span></div><div class="plan-weights">'+blockMarkup(targets)+'</div><div class="plan-actions"><button type="button" class="btn ghost tiny" id="reviewPlan">Revisar mi plan</button>'+(reviewing?'<button type="button" class="btn ghost tiny" id="cancelPlanReview">Cancelar revisión</button>':'')+'</div>';
    byId('reviewPlan').onclick = beginReview;
    if (reviewing) byId('cancelPlanReview').onclick = cancelReview;
  }

  function beginReview() {
    if (reviewing) {
      selectionCard.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    openModal('<span class="plan-eyebrow">REVISAR MI PLAN</span><h2 id="planFlowTitle">¿Por qué quieres revisarlo?</h2><p>Esta pausa ayuda a distinguir una decisión duradera de una reacción al mercado.</p><label class="flow-label" for="planReason">Motivo principal</label><select id="planReason"><option value="">Selecciona un motivo</option><option value="objetivo">Cambió mi objetivo u horizonte</option><option value="situacion">Cambió mi situación personal</option><option value="riesgo">Quiero ajustar el riesgo que asumo</option><option value="mercado">Me preocupa una caída del mercado</option><option value="otro">Otro motivo</option></select><div class="flow-buttons"><button type="button" class="btn ghost" id="flowCancel">Cancelar</button><button type="button" class="btn" id="flowNext">Comparar planes</button></div>');
    byId('flowCancel').onclick = closeModal;
    byId('flowNext').onclick = () => {
      reason = byId('planReason').value;
      if (!reason) {byId('planReason').focus();return}
      snapshot = {type:s.type,custom:copyCustom(),customName:s.customName};
      reviewing = true;
      closeModal();render();
      selectionCard.scrollIntoView({behavior:'smooth',block:'start'});
    };
  }
  function cancelReview() {
    if (snapshot) {s.custom=snapshot.custom;s.customName=snapshot.customName}
    reviewing=false;snapshot=null;reason='';
    customEditor.hidden=true;
    customToggle.setAttribute('aria-expanded','false');
    personalCard.classList.remove('custom-open');
    save();render();
  }
  const originalGo = go;
  go = function (id) {
    if (reviewing && id !== 'cartera') cancelReview();
    originalGo(id);
  };

  function offerPlan(candidate) {
    const currentType = snapshot?.type || s.type;
    const previousCustom = snapshot?.custom || s.custom;
    const previousName = snapshot?.customName || s.customName;
    const nextName = candidate.type === 'custom' ? candidate.name : MODELS[candidate.type].name;
    const isChange = !!currentType;
    const warning = reason === 'mercado' ? '<p class="flow-caution">Si tus objetivos y circunstancias siguen siendo los mismos, una caída por sí sola merece una revisión pausada. También puedes continuar si has comprobado que tu plan ya no encaja contigo.</p>' : '';
    openModal('<span class="plan-eyebrow">'+(isChange?'COMPARA ANTES DE CAMBIAR':'CONFIRMA TU PLAN')+'</span><h2 id="planFlowTitle">'+(isChange?'Revisar el nuevo reparto':'Vas a fijar '+esc(nextName))+'</h2><p>RUMBO usará estos porcentajes para orientar tus aportaciones y revisiones. Es un plan de largo plazo; comprueba que encaja contigo.</p><div class="plan-compare">'+(isChange?'<div><h3>Actual · '+esc(currentType==='custom'?previousName:MODELS[currentType].name)+'</h3>'+blockMarkup(blocks(currentType,previousCustom))+'</div>':'')+'<div><h3>Nuevo · '+esc(nextName)+'</h3>'+blockMarkup(blocks(candidate.type,candidate.custom))+'</div></div>'+warning+(isChange?'<p class="flow-help">Tus saldos e historial se conservarán. Cambiar el objetivo no ejecuta operaciones.</p>':'')+'<div class="flow-buttons"><button type="button" class="btn ghost" id="flowCancel">Volver</button><button type="button" class="btn" id="flowConfirm">Confirmar plan</button></div>');
    byId('flowCancel').onclick = closeModal;
    byId('flowConfirm').onclick = () => {
      if (isChange) archivePlan();
      if (candidate.type === 'custom') {
        s.custom = candidate.custom;
        s.customName = candidate.name;
      } else if (snapshot) {
        s.custom = snapshot.custom;
        s.customName = snapshot.customName;
      }
      s.type = candidate.type;
      s.planSetAt = new Date().toISOString();
      if (isChange) {
        s.planHistory ||= [];
        s.planHistory.push({at:s.planSetAt,from:currentType,to:candidate.type,reason});
        s.transitionByContributions = true;
      }
      reviewing=false;snapshot=null;reason='';
      customEditor.hidden=true;
      personalCard.classList.remove('custom-open');
      closeModal();save();render();go('inicio');
    };
  }

  window.choose = id => {
    if (!MODELS[id]) return;
    if (s.type && !reviewing) {beginReview();return}
    if (reviewing && id === snapshot?.type) return;
    offerPlan({type:id});
  };
  customToggle.onclick = () => {
    const open = customEditor.hidden;
    customEditor.hidden = !open;
    customToggle.setAttribute('aria-expanded',String(open));
    personalCard.classList.toggle('custom-open',open);
    customToggle.firstChild.textContent = open?'Cerrar ':'Crear la mía ';
    customToggle.querySelector('span').textContent = open?'−':'↗';
    if (open) customEditor.scrollIntoView({behavior:'smooth',block:'start'});
  };
  useCustom.onclick = () => {
    const sum = s.custom.reduce((z,a) => z+(+a.pct || 0),0);
    if (Math.abs(sum-100) > .01) {alert('El reparto suma '+pct(sum)+'. Debe sumar 100%.');return}
    if (!s.custom.length || s.custom.some(a => !String(a.name||'').trim())) {alert('Pon un nombre a todos los activos.');return}
    const name = customName.value.trim() || 'Mi cartera';
    offerPlan({type:'custom',name,custom:copyCustom()});
  };

  function renderReview() {
    const a = assets(), t = total();
    if (!a.length) {
      reviewCard.innerHTML = '<div class="head"><h2>Revisión del reparto</h2></div><p class="flow-help">Crea tu plan para comparar tus saldos con los porcentajes objetivo.</p>';
      return;
    }
    if (!t) {
      reviewCard.innerHTML = '<div class="head"><h2>Revisión del reparto</h2></div><p class="flow-help">Introduce tus saldos actuales para ver las desviaciones. Se guardarán en este dispositivo.</p>';
      return;
    }
    const off = a.filter(x => x.w === 0 && +s.hold[x.id] > 0);
    reviewCard.innerHTML = '<div class="head"><h2>Actual frente a objetivo</h2><span class="pill">'+euro.format(t)+'</span></div><div class="review-rows">'+a.map(x => {
      const value = +s.hold[x.id] || 0, actual = value/t*100, diff = actual-x.w;
      return '<div class="review-row"><div><strong>'+esc(x.short)+'</strong><small>'+euro.format(value)+'</small></div><div><span>Ahora '+pct(actual)+'</span><span>Objetivo '+pct(x.w)+'</span></div><b class="'+(Math.abs(diff)>3?'out':'')+'">'+(diff>=0?'+':'−')+pct(Math.abs(diff))+'</b></div>';
    }).join('')+'</div>'+(off.length?'<div class="notice">Hay '+euro.format(off.reduce((v,x) => v+(+s.hold[x.id] || 0),0))+' en activos que ya no forman parte del objetivo. Siguen incluidos en el total. Revisa si las aportaciones bastan para ajustar el riesgo en un plazo adecuado.</div>':'<p class="flow-help">Las desviaciones muestran puntos porcentuales, no rentabilidad.</p>');
  }

  const baseCalcNow = calcNow;
  calcNow = function () {
    baseCalcNow();
    if (s.transitionByContributions) {
      byId('rebalanceAlert')?.querySelector('strong')?.replaceChildren(document.createTextNode('Transición gradual del plan'));
      const alert = byId('rebalanceAlert');
      if (alert) {
        alert.className = 'rebalance-alert watch';
        const paragraph = alert.querySelector('p');
        if (paragraph) paragraph.textContent = 'Este cálculo dirige la aportación hacia el nuevo objetivo. El cambio de plan no ejecuta ni propone ventas inmediatas.';
      }
      results.querySelectorAll('.res').forEach(row => {
        const action = row.querySelector('.act');
        if (action?.querySelector('.action-label')?.textContent === 'Revisar') {
          action.querySelector('.action-label').textContent = 'Mantener';
          action.querySelector('strong').textContent = '0 €';
          action.querySelector('strong').classList.remove('pause');
        }
        row.querySelectorAll('.detail-action.sell,.detail-action:has(.route-list)').forEach(el => el.remove());
      });
      rebNote.textContent = 'Cambio de objetivo: las próximas aportaciones acercan la cartera al nuevo reparto. Si tu nivel de riesgo actual no encaja con tus circunstancias, revisa el plan antes de operar.';
    }
    const off = assets().filter(x => x.w === 0 && +s.hold[x.id] > 0);
    if (off.length) {
      rebNote.textContent += ' Los activos fuera del plan conservan su saldo y requieren una revisión aparte.';
      off.forEach(x => {
        const panel = byId('asset-detail-'+x.id);
        const detail = panel?.querySelector('.detail-action');
        if (detail) detail.textContent = 'Fuera del objetivo actual. Las aportaciones no comprarán este activo; revisa su peso en Rebalanceo.';
        const explanation = panel?.querySelector('.detail-explain');
        if (explanation) explanation.textContent = 'Este saldo sigue incluido en el valor total, aunque el plan actual ya no asigna aportaciones a este activo.';
      });
    }
  };
  function renderContribution() {
    byId('addPlanName').textContent = s.type ? pname() : 'Sin plan';
    register.disabled = !s.type || !(Number(byId('newMoney').value) > 0);
    const last = (s.contributions || []).at(-1);
    lastRecord.textContent = last ? 'Última aportación registrada: '+euro.format(last.amount)+' · '+new Date(last.at).toLocaleDateString('es-ES') : '';
  }
  byId('newMoney').addEventListener('input',() => {
    register.disabled = !s.type || !(Number(byId('newMoney').value) > 0);
    calcNow();
  });
  register.onclick = () => {
    const a=assets(), m=Math.max(0,+byId('newMoney').value || 0);
    if (!a.length || !m) return;
    const amounts=allocation(a,a.map(x => +s.hold[x.id] || 0),m);
    openModal('<span class="plan-eyebrow">REGISTRAR APORTACIÓN</span><h2 id="planFlowTitle">¿La has realizado con estos importes?</h2><p>Esto solo actualiza tus saldos guardados en RUMBO. La aplicación no compra activos.</p><div class="plan-compare"><div>'+a.map((x,i) => '<div class="plan-flow-row"><span>'+esc(x.short)+'</span><strong>'+euro.format(amounts[i])+'</strong></div>').join('')+'</div></div><p class="flow-help">Si invertiste otros importes, cancela y actualiza los saldos reales en Rebalanceo.</p><div class="flow-buttons"><button type="button" class="btn ghost" id="flowCancel">Cancelar</button><button type="button" class="btn" id="flowConfirm">Sí, registrar</button></div>');
    byId('flowCancel').onclick=closeModal;
    byId('flowConfirm').onclick=() => {
      a.forEach((x,i) => {s.hold[x.id]=Math.round(((+s.hold[x.id]||0)+amounts[i])*100)/100});
      s.money=m;
      s.contributions ||= [];
      s.contributions.push({at:new Date().toISOString(),amount:m,allocations:Object.fromEntries(a.map((x,i) => [x.id,amounts[i]]))});
      closeModal();save();render();go('inicio');
    };
  };
  clearSaldos.onclick = () => {
    openModal('<span class="plan-eyebrow">DATOS LOCALES</span><h2 id="planFlowTitle">¿Borrar los saldos?</h2><p>El valor de la cartera volverá a cero. Tu plan y el historial de aportaciones seguirán guardados.</p><div class="flow-buttons"><button type="button" class="btn ghost" id="flowCancel">Cancelar</button><button type="button" class="btn" id="flowConfirm">Borrar saldos</button></div>');
    byId('flowCancel').onclick=closeModal;
    byId('flowConfirm').onclick=() => {s.hold={};closeModal();save();render();go('inicio')};
  };

  const baseRender = render;
  render = function () {
    baseRender();
    renderPlanState();
    renderReview();
    renderContribution();
  };
  render();
})();
