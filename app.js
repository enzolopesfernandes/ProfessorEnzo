'use strict';

const ALUNOS = [
  { id: 'anderson', nome: 'Anderson', inicial: 'A', cor: 'violet' },
  { id: 'luiza', nome: 'Luiza', inicial: 'L', cor: 'peach' },
  { id: 'jovana', nome: 'Jovana', inicial: 'J', cor: 'mint' }
];

const CHAPTERS = window.CHAPTERS || [];
const STORAGE_PREFIX = 'professor-enzo:quiz:v1:';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function getAluno(id) { return ALUNOS.find(item => item.id === id) || null; }
function getCapitulo(id) { return CHAPTERS.find(item => item.id === id) || null; }
function getParams() { return new URLSearchParams(window.location.search); }
function rota(pagina, aluno, capitulo = CHAPTERS[0]?.id || 'revisao-final') {
  if (pagina === 'index') return 'index.html';
  const params = new URLSearchParams({ aluno, capitulo });
  return `${pagina}.html?${params.toString()}`;
}
function keyState(aluno, capitulo) { return `${STORAGE_PREFIX}${aluno}:${capitulo}`; }
function loadState(aluno, capitulo) {
  try {
    const raw = localStorage.getItem(keyState(aluno, capitulo));
    const state = raw ? JSON.parse(raw) : null;
    if (state && Array.isArray(state.respostas)) return state;
  } catch (error) { console.warn('Não foi possível ler o progresso local.', error); }
  return { indice: 0, respostas: [], concluido: false };
}
function saveState(aluno, capitulo, state) {
  try { localStorage.setItem(keyState(aluno, capitulo), JSON.stringify(state)); }
  catch (error) { console.warn('Progresso não pôde ser salvo neste navegador.', error); }
}
function resetState(aluno, capitulo) {
  const state = { indice: 0, respostas: [], concluido: false };
  saveState(aluno, capitulo, state);
  return state;
}
function countCorrect(capitulo, state) {
  return capitulo.questoes.reduce((total, q, index) => total + (state.respostas[index] === q.correta ? 1 : 0), 0);
}
function elem(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = String(content);
  return element;
}
function svgIcon(name, size = 20) {
  const path = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 13 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trophy: '<path d="M8 21h8m-4-4v4M7 3h10v7a5 5 0 0 1-10 0V3Z"/><path d="M7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4"/>'
  }[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
function getContext() {
  const p = getParams();
  const aluno = getAluno(p.get('aluno'));
  const capitulo = getCapitulo(p.get('capitulo')) || CHAPTERS[0];
  if (!aluno || !capitulo) { window.location.replace('index.html'); return null; }
  return { aluno, capitulo };
}
function setNomeAluno(aluno) {
  $$('[data-aluno-nome]').forEach(el => el.textContent = aluno.nome);
  $$('[data-iniciais]').forEach(el => el.textContent = aluno.inicial);
  $$('[data-link-capitulos]').forEach(el => el.href = rota('capitulos', aluno.id));
}

function initHome() {
  const container = $('#alunos-grid');
  for (const aluno of ALUNOS) {
    const capitulo = CHAPTERS[0];
    const state = loadState(aluno.id, capitulo.id);
    const respondidas = Math.min(state.respostas.length, capitulo.questoes.length);
    const mensagem = state.concluido
      ? `Revisão concluída · ${countCorrect(capitulo, state)} de ${capitulo.questoes.length} acertos`
      : respondidas > 0 ? `${respondidas} de ${capitulo.questoes.length} questões respondidas` : 'Atividades disponíveis';
    const a = elem('a', `aluno-card aluno-${aluno.cor}`);
    a.href = rota('capitulos', aluno.id);
    a.setAttribute('aria-label', `Abrir atividades de ${aluno.nome}`);
    a.innerHTML = `<span class="avatar avatar-${aluno.cor}" aria-hidden="true">${aluno.inicial}</span><span class="card-details"><span class="aluno-name">${aluno.nome}</span><span class="aluno-status"></span></span><span class="card-arrow">${svgIcon('arrow', 20)}</span>`;
    $('.aluno-status', a).textContent = mensagem;
    container.append(a);
  }
}

function initCapitulos() {
  const ctx = getContext(); if (!ctx) return;
  const { aluno, capitulo } = ctx;
  setNomeAluno(aluno);
  const state = loadState(aluno.id, capitulo.id);
  const total = capitulo.questoes.length;
  const respondidas = Math.min(state.respostas.length, total);
  $('#capitulo-titulo').textContent = capitulo.titulo;
  $('#capitulo-subtitulo').textContent = capitulo.subtitulo;
  $('#capitulo-descricao').textContent = capitulo.descricao;
  $('#total-questoes').textContent = String(total).padStart(2, '0');
  $('#progresso-texto').textContent = state.concluido ? 'Revisão concluída' : respondidas ? `${respondidas} de ${total} respondidas` : 'Ainda não iniciada';
  $('#progresso-barra').style.width = `${(respondidas / Math.max(total, 1)) * 100}%`;
  const iniciar = $('#iniciar-quiz');
  iniciar.href = rota('quiz', aluno.id, capitulo.id);
  $('#iniciar-texto').textContent = state.concluido ? 'Refazer questões' : respondidas ? 'Continuar revisão' : 'Começar revisão';
  if (state.concluido) {
    $('#ver-resultado').hidden = false;
    $('#ver-resultado').href = rota('resultado', aluno.id, capitulo.id);
    iniciar.addEventListener('click', () => resetState(aluno.id, capitulo.id));
  }
}

function initQuiz() {
  const ctx = getContext(); if (!ctx) return;
  const { aluno, capitulo } = ctx;
  setNomeAluno(aluno);
  const total = capitulo.questoes.length;
  if (!total) { window.location.replace(rota('capitulos', aluno.id)); return; }
  let state = loadState(aluno.id, capitulo.id);
  if (state.concluido || state.indice >= total) {
    window.location.replace(rota('resultado', aluno.id, capitulo.id)); return;
  }
  let selected = null;
  $('#quiz-titulo').textContent = capitulo.titulo;
  $('#total-quiz').textContent = String(total).padStart(2, '0');
  const optionsContainer = $('#opcoes');
  const feedback = $('#feedback');
  const botaoConfirmar = $('#confirmar-resposta');
  const botaoProximo = $('#proxima-questao');

  function render() {
    const index = state.indice;
    const questao = capitulo.questoes[index];
    const confirmed = Number.isInteger(state.respostas[index]);
    selected = confirmed ? state.respostas[index] : null;
    $('#questao-numero').textContent = String(index + 1).padStart(2, '0');
    $('#questao-contador').textContent = `Questão ${index + 1} de ${total}`;
    $('#progresso-quiz').style.width = `${(state.respostas.length / total) * 100}%`;
    $('#tema-questao').textContent = questao.assunto;
    $('#questao-enunciado').textContent = questao.enunciado;
    optionsContainer.replaceChildren();
    questao.alternativas.forEach((resposta, idx) => {
      const button = elem('button', 'opcao');
      button.type = 'button';
      button.innerHTML = `<span class="opcao-letra">${String.fromCharCode(65 + idx)}</span><span class="opcao-texto"></span><span class="opcao-indicador"></span>`;
      $('.opcao-texto', button).textContent = resposta;
      button.setAttribute('aria-pressed', String(idx === selected));
      if (selected === idx) button.classList.add('is-selected');
      if (confirmed) {
        button.disabled = true;
        if (idx === questao.correta) {
          button.classList.add('is-correct');
          $('.opcao-indicador', button).innerHTML = svgIcon('check', 18);
        } else if (idx === selected) {
          button.classList.add('is-wrong');
          $('.opcao-indicador', button).innerHTML = svgIcon('x', 18);
        }
      } else {
        button.addEventListener('click', () => {
          selected = idx;
          $$('.opcao', optionsContainer).forEach((option, i) => {
            option.classList.toggle('is-selected', i === idx);
            option.setAttribute('aria-pressed', String(i === idx));
          });
          botaoConfirmar.disabled = false;
        });
      }
      optionsContainer.append(button);
    });
    botaoConfirmar.hidden = confirmed;
    botaoConfirmar.disabled = selected === null;
    botaoProximo.hidden = !confirmed;
    botaoProximo.innerHTML = index === total - 1 ? `Ver meu resultado ${svgIcon('arrow', 18)}` : `Próxima questão ${svgIcon('arrow', 18)}`;
    feedback.hidden = !confirmed;
    if (confirmed) {
      const acertou = selected === questao.correta;
      feedback.className = `feedback ${acertou ? 'feedback-certo' : 'feedback-errado'}`;
      $('#feedback-icone').innerHTML = svgIcon(acertou ? 'check' : 'x', 19);
      $('#feedback-titulo').textContent = acertou ? 'Muito bem! Você acertou.' : 'Ainda não! Vamos entender.';
      $('#feedback-descricao').textContent = acertou
        ? 'Confira a resolução para reforçar o aprendizado.'
        : `Resposta correta: ${String.fromCharCode(65 + questao.correta)}. ${questao.alternativas[questao.correta]}`;
      $('#resolucao').textContent = questao.resolucao;
    }
  }
  botaoConfirmar.addEventListener('click', () => {
    if (selected === null || Number.isInteger(state.respostas[state.indice])) return;
    state.respostas[state.indice] = selected;
    saveState(aluno.id, capitulo.id, state);
    render();
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  botaoProximo.addEventListener('click', () => {
    if (!Number.isInteger(state.respostas[state.indice])) return;
    if (state.indice === total - 1) {
      state.concluido = true;
      state.indice = total;
      saveState(aluno.id, capitulo.id, state);
      window.location.href = rota('resultado', aluno.id, capitulo.id);
      return;
    }
    state.indice += 1;
    saveState(aluno.id, capitulo.id, state);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  render();
}

function initResultado() {
  const ctx = getContext(); if (!ctx) return;
  const { aluno, capitulo } = ctx;
  setNomeAluno(aluno);
  const state = loadState(aluno.id, capitulo.id);
  const total = capitulo.questoes.length;
  if (!state.concluido || state.respostas.length !== total) {
    window.location.replace(rota('quiz', aluno.id, capitulo.id)); return;
  }
  const acertos = countCorrect(capitulo, state);
  const erros = total - acertos;
  const percentual = Math.round((acertos / Math.max(total, 1)) * 100);
  $('#score-percentual').textContent = `${percentual}%`;
  $('#score-circulo').style.setProperty('--percentual', `${percentual}%`);
  $('#score-acertos').textContent = String(acertos);
  $('#score-erros').textContent = String(erros);
  $('#score-total').textContent = String(total);
  $('#mensagem-resultado').textContent = percentual === 100
    ? 'Excelente! Você acertou todas as questões.'
    : percentual >= 70 ? 'Ótimo trabalho! Continue praticando.'
    : 'Cada questão é uma chance de aprender mais.';
  const lista = $('#lista-revisao');
  capitulo.questoes.forEach((questao, index) => {
    const isCorrect = state.respostas[index] === questao.correta;
    const item = elem('details', `resumo-questao ${isCorrect ? 'resumo-certo' : 'resumo-errado'}`);
    const summary = elem('summary', 'resumo-cabecalho');
    summary.innerHTML = `<span class="resumo-status">${svgIcon(isCorrect ? 'check' : 'x', 16)}</span><span class="resumo-titulo"></span><span class="resumo-badge">${isCorrect ? 'Correta' : 'Incorreta'}</span><span class="resumo-chevron">⌄</span>`;
    $('.resumo-titulo', summary).textContent = `Questão ${String(index + 1).padStart(2, '0')} · ${questao.assunto}`;
    const body = elem('div', 'resumo-conteudo');
    const question = elem('p', 'resumo-enunciado', questao.enunciado);
    const sua = elem('p', '', `Sua resposta: ${questao.alternativas[state.respostas[index]]}`);
    const certa = elem('p', '', `Resposta correta: ${questao.alternativas[questao.correta]}`);
    const resolucao = elem('p', 'resumo-explicacao', questao.resolucao);
    body.append(question, sua, certa, resolucao);
    item.append(summary, body);
    lista.append(item);
  });
  $('#voltar-capitulos').href = rota('capitulos', aluno.id, capitulo.id);
  $('#tentar-novamente').addEventListener('click', () => {
    resetState(aluno.id, capitulo.id);
    window.location.href = rota('quiz', aluno.id, capitulo.id);
  });
}

const pagina = document.body.dataset.page;
if (pagina === 'home') initHome();
if (pagina === 'capitulos') initCapitulos();
if (pagina === 'quiz') initQuiz();
if (pagina === 'resultado') initResultado();
