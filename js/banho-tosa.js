(function() {
  'use strict';

  const PRICING_URL = '../assets/config/service-pricing.json';

  const els = {};
  let pricing = null;

  // Utils
  const money = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

  function q(sel, root = document) { return root.querySelector(sel); }
  function qa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function setHidden(el, hidden) { if (el) el.style.display = hidden ? 'none' : ''; }
  function setDisabled(el, disabled) { if (el) el.disabled = !!disabled; }

  function loadPricing() {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Primeiro, tentar carregar do Firestore se disponível
        if (window.db) {
          try {
            const doc = await window.db.collection('settings').doc('servicePricing').get();
            if (doc.exists) {
              const data = doc.data();

              resolve(data.pricing);
              return;
            }
          } catch (firestoreError) {
            console.warn('⚠️ Erro ao carregar do Firestore:', firestoreError);
          }
        }

        // 2. Segundo, tentar carregar do localStorage (preços atualizados pelo admin)
        const savedPricing = localStorage.getItem('servicePricing');
        if (savedPricing) {
          try {
            const parsedPricing = JSON.parse(savedPricing);

            resolve(parsedPricing);
            return;
          } catch (error) {
            console.warn('⚠️ Erro ao parsear preços do localStorage:', error);
          }
        }

        // 3. Fallback: carregar do arquivo JSON
        const response = await fetch(PRICING_URL);
        if (!response.ok) throw new Error('Falha ao carregar tabela de preços');
        const data = await response.json();

        resolve(data);
        
      } catch (error) {
        console.error('❌ Erro ao carregar preços:', error);
        reject(error);
      }
    });
  }

  function initElements() {
    els.container = q('#serviceEstimator');
    if (!els.container) return false;

    els.type = q('#svcPetType');
    els.sizeGroup = q('#svcDogSizeGroup');
    els.size = q('#svcDogSize');
  // suporte a dois selects de serviço: svcType1 (obrigatório) e svcType2 (opcional)
  els.service1 = q('#svcType1');
  els.service2 = q('#svcType2');
    els.coat = q('#svcCoat');

    els.addons = qa('input[name="svcAddon"]');

    els.summary = q('#svcSummary');
    els.baseSpan = q('#svcBasePrice');
    els.addonsList = q('#svcAddonsList');
    els.totalSpan = q('#svcTotal');
    els.note = q('#svcNote');

  els.appointmentForm = q('#appointmentForm');
  els.submitBtn = els.appointmentForm ? els.appointmentForm.querySelector('button[type="submit"]') : null;
  els.obs = q('#notes'); // reaproveita observações do formulário
    return true;
  }

  function getSelection() {
  const type = els.type.value || '';
  const isDog = type === 'Cao';
  const size = isDog ? (els.size.value || '') : 'Unico';
  const service1 = els.service1 ? (els.service1.value || '') : '';
  const service2 = els.service2 ? (els.service2.value || '') : '';
  const coat = els.coat.value || '';

  const selectedAddons = els.addons.filter(a => a.checked).map(a => a.value);

  return { type, size, service1, service2, coat, addons: selectedAddons };
  }

  function calcEstimate(sel) {
    if (!pricing) return { ok: false, message: 'Tabela de preços não carregada.' };

    // validações básicas
    if (!sel.type || (!sel.service1 && !sel.service2)) {
      return { ok: false, message: 'Selecione tipo de pet e pelo menos um serviço.' };
    }
    if (sel.type === 'Cao' && !sel.size) {
      return { ok: false, message: 'Selecione o porte do cão.' };
    }

    const baseTable = pricing.base[sel.type];
    const tier = baseTable && baseTable[sel.size];
    // calcular preço base para um ou dois serviços
    let baseSum = 0;
    const breakdownBases = [];

    const computeServiceBase = (svc) => {
      if (!svc) return null;
      const v = tier ? tier[svc] : null;
      return (v == null) ? null : v;
    };

    const base1 = computeServiceBase(sel.service1);
    const base2 = computeServiceBase(sel.service2);

    if (base1 == null && base2 == null) {
      return { ok: false, message: 'Combinação sem preço definido.' };
    }

    // pelagem e soma
    const coatMultiplier = (sel.coat && pricing.coatMultipliers && pricing.coatMultipliers[sel.coat]) ? pricing.coatMultipliers[sel.coat] : 1;

    if (base1 != null) {
      const adj1 = Math.round(base1 * coatMultiplier);
      baseSum += adj1;
      breakdownBases.push({ key: sel.service1, base: adj1 });
    }
    if (base2 != null) {
      const adj2 = Math.round(base2 * coatMultiplier);
      baseSum += adj2;
      breakdownBases.push({ key: sel.service2, base: adj2 });
    }

    // adicionais
    const breakdown = [];
    let addonsTotal = 0;
    sel.addons.forEach(key => {
      const cfg = pricing.addons[key];
      if (!cfg) return;
      let addPrice = 0;
      if (cfg.prices) {
        // preço fixo por tipo
        const p = cfg.prices[sel.type];
        if (typeof p === 'number') addPrice = p;
      }
      if (!addPrice && cfg.percentOfBase) {
        addPrice = Math.max(baseSum * cfg.percentOfBase, cfg.min || 0);
      }
      if (!addPrice && cfg.tieredByCoat && cfg.tieredByCoat[sel.coat]) {
        addPrice = cfg.tieredByCoat[sel.coat];
      }
      if (addPrice) {
        addonsTotal += addPrice;
        breakdown.push({ key, label: cfg.label, price: addPrice });
      }
    });

  const total = baseSum + addonsTotal;
  return { ok: true, base: baseSum, addons: breakdown, total, bases: breakdownBases };
  }

  function render() {
    const sel = getSelection();

    // visibilidade porte
    setHidden(els.sizeGroup, sel.type !== 'Cao');

    const result = calcEstimate(sel);

    if (!result.ok) {
      setDisabled(els.submitBtn, true);
      els.baseSpan.textContent = '-';
      els.totalSpan.textContent = '-';
      els.addonsList.innerHTML = '';
      els.note.textContent = result.message || 'Preencha as opções para ver o valor.';
      return;
    }

  els.baseSpan.textContent = money(result.base);
    els.totalSpan.textContent = money(result.total);
    els.note.textContent = 'Valor estimado. A confirmação ocorre contatando a loja.';

    els.addonsList.innerHTML = '';
    result.addons.forEach(a => {
      const li = document.createElement('li');
      li.textContent = `${a.label}: + ${money(a.price)}`;
      els.addonsList.appendChild(li);
    });

    // mostrar detalhamento dos serviços (quando houver dois)
    if (result.bases && result.bases.length) {
      result.bases.forEach(b => {
        const li = document.createElement('li');
        const labelMap = {
          Banho: 'Banho',
          TosaHigienica: 'Tosa Higiênica',
          TosaTotal: 'Tosa Total',
          BanhoTosa: 'Banho e Tosa'
        };
        li.textContent = `${labelMap[b.key] || b.key}: ${money(b.base)}`;
        els.addonsList.appendChild(li);
      });
    }

    setDisabled(els.submitBtn, false);
  }

  function buildWhatsAppMessage() {
    const sel = getSelection();
    const result = calcEstimate(sel);
    const lines = [];

    lines.push('Agendar Banho & Tosa – Orçamento Estimado');
    // Dados do formulário de agendamento
    const ownerName = q('#ownerName')?.value?.trim();
    const petName = q('#petName')?.value?.trim();
    const petTypeForm = q('#petType')?.value || '';
    const dogSizeForm = q('#dogSize')?.value || '';
    if (ownerName) lines.push(`Cliente: ${ownerName}`);
    if (petName) lines.push(`Pet: ${petName}`);
    if (petTypeForm) lines.push(`Tipo informado no formulário: ${petTypeForm}`);
    if (dogSizeForm) lines.push(`Porte informado no formulário: ${dogSizeForm}`);

  lines.push(`Tipo: ${sel.type || '-'}`);
  if (sel.type === 'Cao') lines.push(`Porte: ${sel.size || '-'}`);
  // Serviços selecionados
  const svcList = [];
  if (sel.service1) svcList.push(sel.service1);
  if (sel.service2) svcList.push(sel.service2);
  const svcLabelMap = { Banho: 'Banho', TosaHigienica: 'Tosa Higiênica', TosaTotal: 'Tosa Total', BanhoTosa: 'Banho e Tosa' };
  lines.push(`Serviços: ${svcList.length ? svcList.map(s => svcLabelMap[s] || s).join(' + ') : '-'}`);
  if (sel.coat) lines.push(`Pelagem: ${sel.coat}`);
    if (result.ok) {
      if (result.addons.length) {
        lines.push('Adicionais:');
        result.addons.forEach(a => lines.push(`- ${a.label}: + ${money(a.price)}`));
      }
      lines.push(`Preço estimado: ${money(result.total)}`);
    } else {
      lines.push('Preço estimado: -');
    }
    const obs = els.obs && els.obs.value ? els.obs.value.trim() : '';
    if (obs) lines.push(`Observações: ${obs}`);
    return lines.join('\n');
  }

  function attachEvents() {
  [els.type, els.size, els.service1, els.service2, els.coat].forEach(el => el && el.addEventListener('change', render));
    els.addons.forEach(a => a.addEventListener('change', render));

    if (els.appointmentForm) {
      els.appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = buildWhatsAppMessage();
        const encoded = encodeURIComponent(msg);
        window.open(`https://wa.me/551334559994?text=${encoded}`, '_blank');
      });
    }
  }

  function init() {
    if (!initElements()) return;
    loadPricing()
      .then(cfg => { 
        pricing = cfg; 
        render(); 
        attachEvents(); 
        
        // Escutar atualizações de preços do painel admin
        window.addEventListener('servicePricingUpdated', (event) => {

          pricing = event.detail.pricing;
          render();
        });

        // Escutar mudanças em tempo real do Firestore
        if (window.db) {
          window.db.collection('settings').doc('servicePricing')
            .onSnapshot((doc) => {
              if (doc.exists) {
                const data = doc.data();
                if (data.pricing && JSON.stringify(data.pricing) !== JSON.stringify(pricing)) {

                  pricing = data.pricing;
                  render();
                  
                  // Atualizar localStorage também
                  localStorage.setItem('servicePricing', JSON.stringify(data.pricing));
                  
                 
                }
              }
            }, (error) => {
              console.warn('⚠️ Erro ao escutar mudanças do Firestore:', error);
            });
        }
      })
      .catch(err => {
        console.warn('Erro ao carregar preços:', err);
        if (els.note) els.note.textContent = 'Não foi possível carregar a tabela de preços.';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('headerLoaded', () => { try { render(); } catch(_){} });
})();
