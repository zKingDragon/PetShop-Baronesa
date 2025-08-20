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
    return fetch(PRICING_URL).then(r => {
      if (!r.ok) throw new Error('Falha ao carregar tabela de preços');
      return r.json();
    });
  }

  function initElements() {
    els.container = q('#serviceEstimator');
    if (!els.container) return false;

    els.type = q('#svcPetType');
    els.sizeGroup = q('#svcDogSizeGroup');
    els.size = q('#svcDogSize');
    els.service = q('#svcType');
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
    const service = els.service.value || '';
    const coat = els.coat.value || '';

    const selectedAddons = els.addons.filter(a => a.checked).map(a => a.value);

    return { type, size, service, coat, addons: selectedAddons };
  }

  function calcEstimate(sel) {
    if (!pricing) return { ok: false, message: 'Tabela de preços não carregada.' };

    // validações básicas
    if (!sel.type || !sel.service) {
      return { ok: false, message: 'Selecione tipo de pet e serviço.' };
    }
    if (sel.type === 'Cao' && !sel.size) {
      return { ok: false, message: 'Selecione o porte do cão.' };
    }

    const baseTable = pricing.base[sel.type];
    const tier = baseTable && baseTable[sel.size];
    const base = tier ? tier[sel.service] : null;
    if (base == null) {
      return { ok: false, message: 'Combinação sem preço definido.' };
    }

    // pelagem
    let baseAdj = base;
    if (sel.coat && pricing.coatMultipliers && pricing.coatMultipliers[sel.coat]) {
      baseAdj = Math.round(base * pricing.coatMultipliers[sel.coat]);
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
        addPrice = Math.max(baseAdj * cfg.percentOfBase, cfg.min || 0);
      }
      if (!addPrice && cfg.tieredByCoat && cfg.tieredByCoat[sel.coat]) {
        addPrice = cfg.tieredByCoat[sel.coat];
      }
      if (addPrice) {
        addonsTotal += addPrice;
        breakdown.push({ key, label: cfg.label, price: addPrice });
      }
    });

    const total = baseAdj + addonsTotal;
    return { ok: true, base: baseAdj, addons: breakdown, total };
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
    els.note.textContent = 'Valor estimado. A confirmação ocorre na loja.';

    els.addonsList.innerHTML = '';
    result.addons.forEach(a => {
      const li = document.createElement('li');
      li.textContent = `${a.label}: + ${money(a.price)}`;
      els.addonsList.appendChild(li);
    });

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
    lines.push(`Serviço: ${sel.service || '-'}`);
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
    [els.type, els.size, els.service, els.coat].forEach(el => el && el.addEventListener('change', render));
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
      .then(cfg => { pricing = cfg; render(); attachEvents(); })
      .catch(err => {
        console.warn('Erro ao carregar preços:', err);
        if (els.note) els.note.textContent = 'Não foi possível carregar a tabela de preços.';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('headerLoaded', () => { try { render(); } catch(_){} });
})();
