/**
 * WebAluno - Simulador de Médias e Aprovação
 * Projetado com foco em IHC (Heurísticas de Nielsen, Feedback Imediato e Modelo Mental Transparente)
 */

const MODALITIES = {
  presencial: {
    id: 'presencial',
    name: 'Modalidade Presencial',
    requiresFrequency: true,
    minAverage: 6.0,
    minFrequency: 75,
    components: [
      {
        code: 'NT',
        name: 'Nota TEAS (NT)',
        weight: 2,
        description: 'Peso 2 (vale 20% da média = até 2,0 pts)',
        defaultGrade: 8.0
      },
      {
        code: 'AP',
        name: 'Avaliação Professor (AP)',
        weight: 2,
        description: 'Peso 2 (vale 20% da média = até 2,0 pts)',
        defaultGrade: 7.5
      },
      {
        code: 'AF',
        name: 'Avaliação Final (AF)',
        weight: 3,
        description: 'Peso 3 (vale 30% da média = até 3,0 pts)',
        defaultGrade: 6.5
      },
      {
        code: 'AI',
        name: 'Avaliação Integrada (AI)',
        weight: 3,
        description: 'Peso 3 (vale 30% da média = até 3,0 pts)',
        defaultGrade: 7.0
      }
    ]
  },
  online: {
    id: 'online',
    name: 'Modalidade On-Line (EAD)',
    requiresFrequency: false,
    minAverage: 6.0,
    minFrequency: 0,
    components: [
      {
        code: 'NT',
        name: 'Nota TEAS (NT)',
        weight: 3,
        description: 'Peso 3 (vale 30% da média = até 3,0 pts)',
        defaultGrade: 8.0
      },
      {
        code: 'FD',
        name: 'Fórum de Discussão (FD)',
        weight: 1,
        description: 'Peso 1 (vale 10% da média = até 1,0 pt)',
        defaultGrade: 9.0
      },
      {
        code: 'AF',
        name: 'Avaliação Final (AF)',
        weight: 6,
        description: 'Peso 6 (vale 60% da média = até 6,0 pts)',
        defaultGrade: 6.0
      }
    ]
  }
};

// Estado da aplicação
const state = {
  currentModality: 'presencial',
  grades: {
    presencial: {
      NT: { value: 8.0, unknown: false },
      AP: { value: 7.5, unknown: false },
      AF: { value: 6.5, unknown: false },
      AI: { value: 7.0, unknown: false }
    },
    online: {
      NT: { value: 8.0, unknown: false },
      FD: { value: 9.0, unknown: false },
      AF: { value: 6.0, unknown: false }
    }
  },
  frequency: {
    mode: 'percent', // 'percent' ou 'classes'
    percent: 85,
    totalClasses: 80,
    absences: 12
  }
};

// Utilitários de formatação brasileira (vírgula decimal)
function formatBR(num, decimals = 1) {
  if (num === null || num === undefined || Number.isNaN(num)) return '0,0';
  return Number(num).toFixed(decimals).replace('.', ',');
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Elementos do DOM
const els = {
  tabPresencial: document.getElementById('tab-presencial'),
  tabOnline: document.getElementById('tab-online'),
  painelCalculo: document.getElementById('painel-calculo'),
  gradesList: document.getElementById('grades-list'),
  frequencyCard: document.getElementById('frequency-card'),
  headerFreqRule: document.getElementById('header-freq-rule'),

  // Frequência
  freqStatusPill: document.getElementById('freq-status-pill'),
  freqModePercent: document.getElementById('freq-mode-percent'),
  freqModeClasses: document.getElementById('freq-mode-classes'),
  freqPanelPercent: document.getElementById('freq-panel-percent'),
  freqPanelClasses: document.getElementById('freq-panel-classes'),
  inputFreqPercent: document.getElementById('input-freq-percent'),
  sliderFreqPercent: document.getElementById('slider-freq-percent'),
  inputTotalAulas: document.getElementById('input-total-aulas'),
  inputTotalFaltas: document.getElementById('input-total-faltas'),
  maxFaltasHint: document.getElementById('max-faltas-hint'),
  freqFeedbackBox: document.getElementById('freq-feedback-box'),

  // Resultado Hero
  resultHeroCard: document.getElementById('result-hero-card'),
  resultBadgeText: document.getElementById('result-badge-text'),
  resultModalityTag: document.getElementById('result-modality-tag'),
  scoreCaption: document.getElementById('score-caption'),
  finalAverageValue: document.getElementById('final-average-value'),
  goalDiffLabel: document.getElementById('goal-diff-label'),
  goalDiffValue: document.getElementById('goal-diff-value'),
  averageProgressFill: document.getElementById('average-progress-fill'),
  resultExplanationText: document.getElementById('result-explanation-text'),
  neededGradeBox: document.getElementById('needed-grade-box'),
  neededTitle: document.getElementById('needed-title'),
  neededDescription: document.getElementById('needed-description'),

  // Quadro da Conta Passo a Passo
  formulaLettersNum: document.getElementById('formula-letters-num'),
  formulaSubstitutedNum: document.getElementById('formula-substituted-num'),
  formulaMultipliedNum: document.getElementById('formula-multiplied-num'),
  formulaFinalStep: document.getElementById('formula-final-step'),
  pointsSlicesList: document.getElementById('points-slices-list'),

  // Botões de ação rápida e Modal
  btnQuantoPreciso: document.getElementById('btn-quanto-preciso'),
  btnExemplo: document.getElementById('btn-exemplo'),
  btnLimpar: document.getElementById('btn-limpar'),
  btnComoFunciona: document.getElementById('btn-como-funciona'),
  modalAjuda: document.getElementById('modal-ajuda'),
  btnFecharModal: document.getElementById('btn-fechar-modal'),
  btnEntendiModal: document.getElementById('btn-entendi-modal')
};

/**
 * Renderiza os cards de entrada de notas para a modalidade selecionada
 */
function renderGradeInputs() {
  const modality = MODALITIES[state.currentModality];
  const currentGrades = state.grades[state.currentModality];

  els.gradesList.innerHTML = '';

  modality.components.forEach((comp) => {
    const gradeData = currentGrades[comp.code];
    const maxPointsInAverage = (comp.weight).toFixed(1).replace('.', ',');
    const currentPointsInAverage = formatBR((gradeData.value * comp.weight) / 10, 2);

    const card = document.createElement('div');
    card.className = `grade-item-card ${gradeData.unknown ? 'is-unknown' : ''}`;
    card.id = `card-${comp.code}`;

    card.innerHTML = `
      <div class="grade-top-row">
        <div class="grade-title-group">
          <span class="sigla-pill sigla-${comp.code}">${comp.code}</span>
          <div class="grade-name-info">
            <label for="input-grade-${comp.code}" class="grade-full-name">${comp.name}</label>
            <span class="grade-weight-explain">${comp.description}</span>
          </div>
        </div>

        <label class="unknown-toggle-label" title="Marque se você ainda não fez esta prova e quer saber quanto precisa tirar nela">
          <input
            type="checkbox"
            class="unknown-toggle-checkbox"
            data-code="${comp.code}"
            ${gradeData.unknown ? 'checked' : ''}
          />
          <span>Ainda não tenho</span>
        </label>
      </div>

      <div class="grade-controls-row">
        <div class="number-stepper">
          <button
            type="button"
            class="btn-step"
            data-action="dec"
            data-code="${comp.code}"
            aria-label="Diminuir 0,5 na nota ${comp.code}"
          >&minus;</button>
          <input
            type="number"
            id="input-grade-${comp.code}"
            class="grade-number-input"
            data-code="${comp.code}"
            min="0"
            max="10"
            step="0.1"
            value="${gradeData.value}"
            aria-label="Nota de ${comp.name} de 0 a 10"
          />
          <button
            type="button"
            class="btn-step"
            data-action="inc"
            data-code="${comp.code}"
            aria-label="Aumentar 0,5 na nota ${comp.code}"
          >+</button>
        </div>

        <div class="slider-wrapper">
          <input
            type="range"
            id="slider-grade-${comp.code}"
            class="grade-slider"
            data-code="${comp.code}"
            min="0"
            max="10"
            step="0.1"
            value="${gradeData.value}"
            aria-label="Controle deslizante para ${comp.name}"
          />
          <div class="slider-ticks" aria-hidden="true">
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6 (Média)</span>
            <span>8</span>
            <span>10</span>
          </div>
        </div>

        <div class="contribution-pill" id="contrib-pill-${comp.code}">
          <span>Soma na média:</span>
          <strong id="contrib-val-${comp.code}">+${currentPointsInAverage} de ${maxPointsInAverage} pts</strong>
        </div>
      </div>

      <div class="unknown-placeholder-msg" id="unknown-msg-${comp.code}">
        <span>🎯 Calculando automaticamente quanto você precisa tirar em <strong>${comp.code}</strong>...</span>
      </div>
    `;

    els.gradesList.appendChild(card);
  });

  attachGradeCardListeners();
}

/**
 * Conecta eventos de digitação, slider, botões -/+ e checkbox "Ainda não tenho"
 */
function attachGradeCardListeners() {
  // Inputs numéricos
  els.gradesList.querySelectorAll('.grade-number-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const code = e.target.dataset.code;
      let raw = e.target.value.replace(',', '.');
      if (raw === '') {
        state.grades[state.currentModality][code].value = 0;
        const slider = document.getElementById(`slider-grade-${code}`);
        if (slider) slider.value = 0;
        updateCalculationsOnly(code);
        return;
      }
      let parsed = parseFloat(raw);
      if (Number.isNaN(parsed)) parsed = 0;
      parsed = clamp(parsed, 0, 10);

      // Se o usuário digitou algo maior que 10, corrige no campo imediatamente
      if (parseFloat(raw) > 10 || parseFloat(raw) < 0) {
        e.target.value = parsed;
      }

      state.grades[state.currentModality][code].value = parsed;
      const slider = document.getElementById(`slider-grade-${code}`);
      if (slider) slider.value = parsed;

      updateCalculationsOnly(code);
    });

    input.addEventListener('blur', (e) => {
      const code = e.target.dataset.code;
      const val = state.grades[state.currentModality][code].value;
      e.target.value = Number(val.toFixed(1));
    });
  });

  // Sliders
  els.gradesList.querySelectorAll('.grade-slider').forEach((slider) => {
    slider.addEventListener('input', (e) => {
      const code = e.target.dataset.code;
      const val = clamp(parseFloat(e.target.value) || 0, 0, 10);
      state.grades[state.currentModality][code].value = val;

      const numInput = document.getElementById(`input-grade-${code}`);
      if (numInput) numInput.value = Number(val.toFixed(1));

      updateCalculationsOnly(code);
    });
  });

  // Botões -0,5 e +0,5
  els.gradesList.querySelectorAll('.btn-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      const action = btn.dataset.action;
      const current = state.grades[state.currentModality][code].value;
      const delta = action === 'inc' ? 0.5 : -0.5;
      const next = clamp(Math.round((current + delta) * 10) / 10, 0, 10);

      state.grades[state.currentModality][code].value = next;

      const numInput = document.getElementById(`input-grade-${code}`);
      const slider = document.getElementById(`slider-grade-${code}`);
      if (numInput) numInput.value = Number(next.toFixed(1));
      if (slider) slider.value = next;

      updateCalculationsOnly(code);
    });
  });

  // Checkbox "Ainda não tenho"
  els.gradesList.querySelectorAll('.unknown-toggle-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const code = e.target.dataset.code;
      const isUnknown = e.target.checked;
      state.grades[state.currentModality][code].unknown = isUnknown;

      const card = document.getElementById(`card-${code}`);
      if (card) {
        card.classList.toggle('is-unknown', isUnknown);
      }

      updateCalculationsOnly(code);
    });
  });
}

/**
 * Atualiza todas as contas, o quadro passo a passo, as fatias e o resultado final sem recriar os inputs (preserva o foco)
 */
function updateCalculationsOnly() {
  const modality = MODALITIES[state.currentModality];
  const currentGrades = state.grades[state.currentModality];

  let knownWeightedSum = 0; // Soma de (Nota * Peso) das notas que o aluno já tem
  let unknownWeightSum = 0; // Soma dos pesos das notas marcadas como "Ainda não tenho"
  const unknownComponents = [];

  modality.components.forEach((comp) => {
    const item = currentGrades[comp.code];
    const maxPoints = formatBR(comp.weight, 1);

    if (item.unknown) {
      unknownWeightSum += comp.weight;
      unknownComponents.push(comp);
    } else {
      const weighted = item.value * comp.weight;
      knownWeightedSum += weighted;

      const contribEl = document.getElementById(`contrib-val-${comp.code}`);
      if (contribEl) {
        contribEl.textContent = `+${formatBR(weighted / 10, 2)} de ${maxPoints} pts`;
      }
    }
  });

  const currentAverage = knownWeightedSum / 10;
  const hasUnknowns = unknownComponents.length > 0;

  // Cálculo de quanto falta para atingir 6,0 (60 pontos na soma antes de dividir por 10)
  const targetWeightedTotal = modality.minAverage * 10; // 60
  const missingWeightedPoints = Math.max(0, targetWeightedTotal - knownWeightedSum);
  const requiredGradeOnUnknowns = unknownWeightSum > 0
    ? missingWeightedPoints / unknownWeightSum
    : 0;

  // Atualiza mensagem dentro de cada card marcado como "Ainda não tenho"
  unknownComponents.forEach((comp) => {
    const msgEl = document.getElementById(`unknown-msg-${comp.code}`);
    if (!msgEl) return;

    if (missingWeightedPoints <= 0) {
      msgEl.innerHTML = `<span>🎉 Você já garantiu <strong>6,0 pontos</strong> com as outras notas! Mesmo com <strong>0,0</strong> em ${comp.code} você atinge a média.</span>`;
    } else if (requiredGradeOnUnknowns > 10) {
      msgEl.innerHTML = `<span>⚠️ Para fechar com 6,0 seria necessário <strong>${formatBR(requiredGradeOnUnknowns, 1)}</strong> em ${comp.code} (acima da nota máxima 10,0).</span>`;
    } else {
      const pluralText = unknownComponents.length > 1
        ? `tirar média <strong>${formatBR(requiredGradeOnUnknowns, 1)}</strong> nas avaliações pendentes`
        : `tirar pelo menos <strong>${formatBR(requiredGradeOnUnknowns, 1)}</strong> (de 10,0) nesta avaliação`;
      msgEl.innerHTML = `<span>🎯 Meta em <strong>${comp.code}</strong>: você precisa ${pluralText} para fechar com Média Final 6,0.</span>`;
    }
  });

  // Atualiza Frequência (se Presencial)
  const isFreqOk = updateFrequencyUI();

  // Atualiza Card Hero de Resultado
  updateHeroResult({
    modality,
    currentAverage,
    knownWeightedSum,
    hasUnknowns,
    unknownComponents,
    requiredGradeOnUnknowns,
    missingWeightedPoints,
    isFreqOk
  });

  // Atualiza Quadro Pedagógico Passo a Passo
  updateStepByStepBoard(modality, currentGrades, knownWeightedSum, currentAverage, requiredGradeOnUnknowns);

  // Atualiza Fatias de Pontos
  updatePointsSlices(modality, currentGrades);
}

/**
 * Atualiza a interface e cálculos da seção de Frequência (75%)
 */
function updateFrequencyUI() {
  const modality = MODALITIES[state.currentModality];

  if (!modality.requiresFrequency) {
    els.frequencyCard.classList.add('hidden');
    els.headerFreqRule.innerHTML = `<strong>Modalidade On-Line:</strong> Aprovação baseada na Média Final &ge; 6,0`;
    return true;
  }

  els.frequencyCard.classList.remove('hidden');
  els.headerFreqRule.innerHTML = `<strong>Presencial:</strong> Frequência Mínima de 75% nas aulas`;

  let freqPercent = state.frequency.percent;

  if (state.frequency.mode === 'classes') {
    const total = Math.max(1, state.frequency.totalClasses);
    const faltas = clamp(state.frequency.absences, 0, total);
    const presencas = total - faltas;
    freqPercent = Math.round((presencas / total) * 1000) / 10;
    state.frequency.percent = freqPercent;

    const maxFaltasPermitidas = Math.floor(total * 0.25);
    const saldoFaltas = maxFaltasPermitidas - faltas;

    if (saldoFaltas >= 0) {
      els.maxFaltasHint.textContent = `Limite de 25%: até ${maxFaltasPermitidas} faltas (você ainda pode faltar ${saldoFaltas})`;
    } else {
      els.maxFaltasHint.textContent = `Limite de 25%: até ${maxFaltasPermitidas} faltas (você ultrapassou em ${Math.abs(saldoFaltas)})`;
    }
  }

  const isApprovedFreq = freqPercent >= modality.minFrequency;
  const formattedFreq = formatBR(freqPercent, freqPercent % 1 === 0 ? 0 : 1);

  els.freqStatusPill.textContent = `${formattedFreq}% • ${isApprovedFreq ? 'Aprovado na Frequência' : 'Abaixo de 75%'}`;
  els.freqStatusPill.className = `header-helper-badge ${isApprovedFreq ? 'status-ok' : 'status-fail'}`;

  if (isApprovedFreq) {
    els.freqFeedbackBox.className = 'freq-feedback-box ok';
    els.freqFeedbackBox.innerHTML = `✅ Sua frequência está em <strong>${formattedFreq}%</strong>, cumprindo o mínimo exigido de <strong>75%</strong>.`;
  } else {
    els.freqFeedbackBox.className = 'freq-feedback-box fail';
    els.freqFeedbackBox.innerHTML = `⚠️ Atenção: Sua frequência está em <strong>${formattedFreq}%</strong> (abaixo do mínimo obrigatório de <strong>75%</strong> na modalidade presencial).`;
  }

  return isApprovedFreq;
}

/**
 * Atualiza o Card Principal de Resultado (Hero Card)
 */
function updateHeroResult({
  modality,
  currentAverage,
  hasUnknowns,
  unknownComponents,
  requiredGradeOnUnknowns,
  missingWeightedPoints,
  isFreqOk
}) {
  els.resultModalityTag.textContent = modality.name;
  els.finalAverageValue.textContent = formatBR(currentAverage, 2);

  // Largura da barra de progresso (0 a 10 -> 0% a 100%)
  const progressPercent = clamp((currentAverage / 10) * 100, 0, 100);
  els.averageProgressFill.style.width = `${progressPercent}%`;

  const diff = currentAverage - modality.minAverage;

  if (hasUnknowns) {
    // Modo Simulação de Meta ("Ainda não tenho essa nota")
    els.resultHeroCard.className = 'result-hero-card status-simulating';
    els.resultBadgeText.textContent = 'SIMULANDO QUANTO FALTA PARA PASSAR';
    els.scoreCaption.textContent = 'PONTOS JÁ GARANTIDOS NA MÉDIA';
    els.goalDiffLabel.textContent = 'Falta p/ Média 6,0';
    els.goalDiffValue.textContent = missingWeightedPoints > 0
      ? `${formatBR(missingWeightedPoints / 10, 2)} pts`
      : '0,00 pts';

    els.neededGradeBox.classList.remove('hidden');
    const namesList = unknownComponents.map((c) => `${c.code} (peso ${c.weight})`).join(' e ');

    if (missingWeightedPoints <= 0) {
      els.neededTitle.textContent = 'Você já atingiu 6,0 pontos garantidos!';
      els.neededDescription.innerHTML = `Mesmo sem somar a nota de <strong>${namesList}</strong>, você já acumulou <strong>${formatBR(currentAverage, 2)}</strong> na média final.`;
      els.resultExplanationText.innerHTML = `Excelente! Suas notas já lançadas garantem os <strong>6,0 pontos</strong> necessários na média.`;
    } else if (requiredGradeOnUnknowns > 10) {
      els.neededTitle.textContent = 'Atenção: Pontuação necessária ultrapassa 10,0';
      els.neededDescription.innerHTML = `Faltam <strong>${formatBR(missingWeightedPoints / 10, 2)} pontos</strong> para chegar a 6,0. Seria necessário tirar <strong>${formatBR(requiredGradeOnUnknowns, 2)}</strong> em <strong>${namesList}</strong>.`;
      els.resultExplanationText.innerHTML = `Com as notas atuais você tem <strong>${formatBR(currentAverage, 2)}</strong> garantidos. Desmarque <em>"Ainda não tenho"</em> para simular diferentes notas.`;
    } else {
      els.neededTitle.textContent = unknownComponents.length === 1
        ? `Você precisa tirar ${formatBR(requiredGradeOnUnknowns, 1)} em ${unknownComponents[0].code} para fechar com 6,0!`
        : `Você precisa de média ${formatBR(requiredGradeOnUnknowns, 1)} nas avaliações pendentes!`;
      els.neededDescription.innerHTML = `Você já garantiu <strong>${formatBR(currentAverage, 2)} pontos</strong> na Média Final e faltam apenas <strong>${formatBR(missingWeightedPoints / 10, 2)} pontos</strong> para alcançar 6,00.`;
      els.resultExplanationText.innerHTML = `Para conquistar os <strong>${formatBR(missingWeightedPoints / 10, 2)} pontos</strong> que faltam na média, basta tirar nota <strong>${formatBR(requiredGradeOnUnknowns, 1)}</strong> (de 0 a 10) em <strong>${namesList}</strong>.`;
    }
    return;
  }

  // Modo Completo (Todas as notas preenchidas)
  els.neededGradeBox.classList.add('hidden');
  els.scoreCaption.textContent = 'MÉDIA FINAL (MF)';

  const isGradeApproved = currentAverage >= modality.minAverage - 1e-9;

  if (diff >= 0) {
    els.goalDiffLabel.textContent = 'Acima da média';
    els.goalDiffValue.textContent = `+${formatBR(diff, 2)}`;
  } else {
    els.goalDiffLabel.textContent = 'Faltam p/ 6,0';
    els.goalDiffValue.textContent = `${formatBR(diff, 2)}`;
  }

  if (isGradeApproved && isFreqOk) {
    els.resultHeroCard.className = 'result-hero-card status-approved';
    els.resultBadgeText.textContent = 'APROVADO NO SEMESTRE';
    els.resultExplanationText.innerHTML = modality.requiresFrequency
      ? `🎉 <strong>Parabéns!</strong> Sua Média Final é <strong>${formatBR(currentAverage, 2)}</strong> (mínimo 6,0) e sua frequência está acima dos 75% exigidos.`
      : `🎉 <strong>Parabéns!</strong> Sua Média Final na modalidade On-Line é <strong>${formatBR(currentAverage, 2)}</strong>, atingindo o mínimo de 6,0 para aprovação.`;
  } else if (isGradeApproved && !isFreqOk) {
    els.resultHeroCard.className = 'result-hero-card status-failed';
    els.resultBadgeText.textContent = 'ATENÇÃO: REPROVADO POR FREQUÊNCIA';
    els.resultExplanationText.innerHTML = `⚠️ Sua Média Final (<strong>${formatBR(currentAverage, 2)}</strong>) é suficiente (&ge; 6,0), porém sua frequência está abaixo do mínimo obrigatório de <strong>75%</strong>.`;
  } else {
    els.resultHeroCard.className = 'result-hero-card status-failed';
    els.resultBadgeText.textContent = 'MÉDIA ABAIXO DE 6,0';
    const pointsMissing = Math.abs(diff);
    els.resultExplanationText.innerHTML = `Sua Média Final simulada está em <strong>${formatBR(currentAverage, 2)}</strong>. Faltam <strong>${formatBR(pointsMissing, 2)} pontos na média</strong> para atingir o mínimo de 6,00. Experimente aumentar as notas nos controles ao lado para simular quanto precisaria!`;
  }
}

/**
 * Atualiza o Quadro Pedagógico com os 4 passos da conta substituída ao vivo
 */
function updateStepByStepBoard(modality, currentGrades) {
  const lettersParts = [];
  const substitutedParts = [];
  const multipliedParts = [];
  let sumMultiplied = 0;

  modality.components.forEach((comp) => {
    const item = currentGrades[comp.code];
    const chipClass = `math-term-chip sigla-${comp.code}`;

    // Passo 1: (NT × 2)
    lettersParts.push(`<span class="${chipClass}">(${comp.code} &times; ${comp.weight})</span>`);

    if (item.unknown) {
      // Quando marcada como "Ainda não tenho"
      substitutedParts.push(`<span class="${chipClass}">(? &times; ${comp.weight})</span>`);
      multipliedParts.push(`<span class="${chipClass}">0,0</span>`);
    } else {
      const valFormatted = formatBR(item.value, 1);
      const product = item.value * comp.weight;
      sumMultiplied += product;

      // Passo 2: (8,0 × 2)
      substitutedParts.push(`<span class="${chipClass}">(${valFormatted} &times; ${comp.weight})</span>`);

      // Passo 3: 16,0
      multipliedParts.push(`<span class="${chipClass}">${formatBR(product, 1)}</span>`);
    }
  });

  els.formulaLettersNum.innerHTML = lettersParts.join(' <strong>+</strong> ');
  els.formulaSubstitutedNum.innerHTML = substitutedParts.join(' <strong>+</strong> ');
  els.formulaMultipliedNum.innerHTML = multipliedParts.join(' <strong>+</strong> ');

  const finalAvg = sumMultiplied / 10;
  els.formulaFinalStep.innerHTML = `${formatBR(sumMultiplied, 1)} &divide; 10 = <span>${formatBR(finalAvg, 2)}</span>`;
}

/**
 * Atualiza a visualização de "Fatias de Pontos" (Quanto cada nota contribui direto na média)
 */
function updatePointsSlices(modality, currentGrades) {
  els.pointsSlicesList.innerHTML = '';

  modality.components.forEach((comp) => {
    const item = currentGrades[comp.code];
    const maxPoints = comp.weight; // Peso 2 -> 2.0 pts, Peso 3 -> 3.0 pts, Peso 6 -> 6.0 pts
    const earnedPoints = item.unknown ? 0 : (item.value * comp.weight) / 10;
    const fillPercent = clamp((earnedPoints / maxPoints) * 100, 0, 100);

    const row = document.createElement('div');
    row.className = 'slice-row';
    row.innerHTML = `
      <div class="slice-header">
        <span><strong>${comp.name}</strong> • ${ item.unknown ? 'Ainda não lançada' : `Nota ${formatBR(item.value, 1)} &times; 0,${comp.weight}` }</span>
        <span><strong>+${formatBR(earnedPoints, 2)} pt</strong> de ${formatBR(maxPoints, 1)} possíveis</span>
      </div>
      <div class="slice-bar-bg">
        <div class="slice-bar-fill" style="width: ${fillPercent}%;"></div>
      </div>
    `;
    els.pointsSlicesList.appendChild(row);
  });
}

/**
 * Alterna entre Modalidade Presencial e Modalidade On-Line
 */
function switchModality(newModality) {
  if (!MODALITIES[newModality]) return;

  // Preserva notas em comum (NT e AF) para melhor experiência do usuário (UX)
  const prevModality = state.currentModality;
  if (prevModality !== newModality) {
    ['NT', 'AF'].forEach((sharedCode) => {
      if (state.grades[prevModality][sharedCode] && state.grades[newModality][sharedCode]) {
        state.grades[newModality][sharedCode].value = state.grades[prevModality][sharedCode].value;
      }
    });
  }

  state.currentModality = newModality;

  const isPresencial = newModality === 'presencial';
  els.tabPresencial.classList.toggle('active', isPresencial);
  els.tabPresencial.setAttribute('aria-selected', String(isPresencial));

  els.tabOnline.classList.toggle('active', !isPresencial);
  els.tabOnline.setAttribute('aria-selected', String(!isPresencial));

  els.painelCalculo.setAttribute('aria-labelledby', isPresencial ? 'tab-presencial' : 'tab-online');

  renderGradeInputs();
  updateCalculationsOnly();
}

/**
 * Inicializa todos os ouvintes globais (Abas, Frequência, Ações Rápidas e Modal)
 */
function initEvents() {
  els.tabPresencial.addEventListener('click', () => switchModality('presencial'));
  els.tabOnline.addEventListener('click', () => switchModality('online'));

  // Alternância do modo de frequência (% direta vs cálculo por faltas)
  els.freqModePercent.addEventListener('click', () => {
    state.frequency.mode = 'percent';
    els.freqModePercent.classList.add('active');
    els.freqModeClasses.classList.remove('active');
    els.freqPanelPercent.classList.remove('hidden');
    els.freqPanelClasses.classList.add('hidden');
    els.inputFreqPercent.value = Math.round(state.frequency.percent);
    els.sliderFreqPercent.value = Math.round(state.frequency.percent);
    updateCalculationsOnly();
  });

  els.freqModeClasses.addEventListener('click', () => {
    state.frequency.mode = 'classes';
    els.freqModeClasses.classList.add('active');
    els.freqModePercent.classList.remove('active');
    els.freqPanelClasses.classList.remove('hidden');
    els.freqPanelPercent.classList.add('hidden');
    updateCalculationsOnly();
  });

  // Inputs de frequência (%)
  els.inputFreqPercent.addEventListener('input', (e) => {
    const val = clamp(parseFloat(e.target.value) || 0, 0, 100);
    state.frequency.percent = val;
    els.sliderFreqPercent.value = val;
    updateCalculationsOnly();
  });

  els.sliderFreqPercent.addEventListener('input', (e) => {
    const val = clamp(parseFloat(e.target.value) || 0, 0, 100);
    state.frequency.percent = val;
    els.inputFreqPercent.value = val;
    updateCalculationsOnly();
  });

  // Inputs de aulas e faltas
  els.inputTotalAulas.addEventListener('input', (e) => {
    state.frequency.totalClasses = Math.max(1, parseInt(e.target.value, 10) || 1);
    updateCalculationsOnly();
  });

  els.inputTotalFaltas.addEventListener('input', (e) => {
    state.frequency.absences = Math.max(0, parseInt(e.target.value, 10) || 0);
    updateCalculationsOnly();
  });

  // Botão "Quanto preciso na Prova Final?"
  els.btnQuantoPreciso.addEventListener('click', () => {
    if (state.currentModality === 'presencial') {
      state.grades.presencial.NT.unknown = false;
      state.grades.presencial.AP.unknown = false;
      state.grades.presencial.AI.unknown = false;
      state.grades.presencial.AF.unknown = true;
    } else {
      state.grades.online.NT.unknown = false;
      state.grades.online.FD.unknown = false;
      state.grades.online.AF.unknown = true;
    }
    renderGradeInputs();
    updateCalculationsOnly();
  });

  // Botão "Ver Exemplo Prático"
  els.btnExemplo.addEventListener('click', () => {
    if (state.currentModality === 'presencial') {
      state.grades.presencial = {
        NT: { value: 8.0, unknown: false },
        AP: { value: 7.0, unknown: false },
        AF: { value: 6.0, unknown: false },
        AI: { value: 6.0, unknown: false }
      };
      state.frequency.percent = 85;
      state.frequency.totalClasses = 80;
      state.frequency.absences = 12;
      els.inputFreqPercent.value = 85;
      els.sliderFreqPercent.value = 85;
    } else {
      state.grades.online = {
        NT: { value: 7.5, unknown: false },
        FD: { value: 9.0, unknown: false },
        AF: { value: 6.0, unknown: false }
      };
    }
    renderGradeInputs();
    updateCalculationsOnly();
  });

  // Botão "Limpar Notas"
  els.btnLimpar.addEventListener('click', () => {
    const currentObj = state.grades[state.currentModality];
    Object.keys(currentObj).forEach((code) => {
      currentObj[code].value = 0;
      currentObj[code].unknown = false;
    });
    renderGradeInputs();
    updateCalculationsOnly();
  });

  // Modal Educativo "Entenda a Conta"
  const openModal = () => {
    els.modalAjuda.classList.remove('hidden');
    els.btnComoFunciona.setAttribute('aria-expanded', 'true');
  };
  const closeModal = () => {
    els.modalAjuda.classList.add('hidden');
    els.btnComoFunciona.setAttribute('aria-expanded', 'false');
  };

  els.btnComoFunciona.addEventListener('click', openModal);
  els.btnFecharModal.addEventListener('click', closeModal);
  els.btnEntendiModal.addEventListener('click', closeModal);
  els.modalAjuda.addEventListener('click', (e) => {
    if (e.target === els.modalAjuda) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modalAjuda.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderGradeInputs();
  initEvents();
  updateCalculationsOnly();
});
