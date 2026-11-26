'use strict';

const ALUNOS = [
  { id: 'anderson', nome: 'Anderson', inicial: 'A', cor: 'violet' },
  { id: 'luiza', nome: 'Luiza', inicial: 'L', cor: 'peach' },
  // ID histórico preservado: links e progresso local continuam válidos.
  { id: 'jovana', nome: 'Giovana', inicial: 'G', cor: 'mint' }
];

const CHAPTERS = window.CHAPTERS || [];
const STORAGE_PREFIX = 'professor-enzo:quiz:v1:';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function getAluno(id) { return ALUNOS.find(item => item.id === id) || null; }
function getCapitulo(id) { return CHAPTERS.find(item => item.id === id) || null; }
function getCapitulosAluno(aluno) {
  if (!aluno) return [];
  return CHAPTERS.filter(capitulo => !capitulo.alunos || capitulo.alunos.includes(aluno.id));
}
function getParams() { return new URLSearchParams(window.location.search); }
function rota(pagina, aluno, capitulo) {
  if (pagina === 'index') return 'index.html';
  const params = new URLSearchParams({ aluno });
  if (capitulo) params.set('capitulo', capitulo);
  return `${pagina}.html?${params.toString()}`;
}
// Reedições de um capítulo ganham nova chave para não reaproveitar respostas antigas.
function keyState(aluno, capitulo) {
  const versao = getCapitulo(capitulo)?.versao;
  return `${STORAGE_PREFIX}${aluno}:${capitulo}${versao ? ':v' + versao : ''}`;
}
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
function confirmarReinicio(aluno, capitulo) {
  const titulo = getCapitulo(capitulo)?.titulo || 'esta atividade';
  if (!window.confirm(`Reiniciar "${titulo}"? Todas as respostas e o progresso desta atividade serão apagados neste navegador. Esta ação não pode ser desfeita.`)) {
    return false;
  }
  resetState(aluno, capitulo);
  return true;
}
function countCorrect(capitulo, state) {
  return capitulo.questoes.reduce((total, q, index) => {
    const resposta = state.respostas[index];
    const acertou = q.tipo === 'aberta'
      ? resposta && resposta.avaliacao === 'acertou'
      : q.tipo === 'sequencia'
        ? Array.isArray(resposta) && resposta.length === q.respostasCorretas.length
          && q.respostasCorretas.every((valor, i) => resposta[i] === valor)
        : resposta === q.correta;
    return total + (acertou ? 1 : 0);
  }, 0);
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
  if (!aluno) { window.location.replace('index.html'); return null; }
  const disponiveis = getCapitulosAluno(aluno);
  const capitulo = disponiveis.find(item => item.id === p.get('capitulo')) || disponiveis[0] || null;
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
    const capitulo = getCapitulosAluno(aluno)[0];
    const state = capitulo ? loadState(aluno.id, capitulo.id) : null;
    const respondidas = state ? Math.min(state.respostas.length, capitulo.questoes.length) : 0;
    const mensagem = !capitulo ? 'Nenhuma atividade disponível no momento'
      : state.concluido
        ? capitulo.questoes.some(q => q.tipo === 'aberta')
          ? `Revisão concluída · ${countCorrect(capitulo, state)} de ${capitulo.questoes.length} concluídas com sucesso`
          : `Revisão concluída · ${countCorrect(capitulo, state)} de ${capitulo.questoes.length} acertos`
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
  const { aluno } = ctx;
  setNomeAluno(aluno);
  const lista = $('#capitulos-lista');
  const capitulos = getCapitulosAluno(aluno);
  if (!capitulos.length) {
    lista.append(elem('p', 'empty-activities', 'Ainda não há atividades cadastradas para você.'));
    return;
  }
  for (const capitulo of capitulos) {
    const state = loadState(aluno.id, capitulo.id);
    const total = capitulo.questoes.length;
    const respondidas = Math.min(state.respostas.length, total);
    const progresso = Math.round(respondidas / Math.max(total, 1) * 100);
    const card = elem('article', 'chapter-card');
    card.innerHTML = '<div class="chapter-top"><span class="chapter-tag"></span></div><h2 class="chapter-name"></h2><p class="chapter-subtitle"></p><p class="chapter-desc"></p><div class="chapter-info"><span class="chapter-total"></span><span>Correção comentada</span></div><div class="progress-metadata"><strong>Seu progresso</strong><span class="chapter-progress-text"></span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill"></div></div><div class="chapter-actions"><a class="btn btn-primary chapter-start" href="#"></a><button type="button" class="btn btn-outline chapter-reset" hidden>Reiniciar atividade</button></div>';
    $('.chapter-tag', card).textContent = capitulo.subtitulo || 'Atividade';
    $('.chapter-name', card).textContent = capitulo.titulo;
    $('.chapter-subtitle', card).textContent = capitulo.subtitulo;
    $('.chapter-desc', card).textContent = capitulo.descricao;
    $('.chapter-total', card).textContent = `${total} questões`;
    $('.chapter-progress-text', card).textContent = state.concluido ? 'Concluída' : respondidas ? `${respondidas} de ${total} respondidas` : 'Ainda não iniciada';
    const bar = $('.progress-track', card);
    bar.setAttribute('aria-label', `Progresso de ${capitulo.titulo}`);
    bar.setAttribute('aria-valuenow', String(progresso));
    $('.progress-fill', card).style.width = `${progresso}%`;
    const iniciar = $('.chapter-start', card);
    iniciar.href = rota('quiz', aluno.id, capitulo.id);
    iniciar.textContent = state.concluido ? 'Ver resultado' : respondidas ? 'Continuar revisão' : 'Começar revisão';
    if (state.concluido) iniciar.href = rota('resultado', aluno.id, capitulo.id);
    const reiniciar = $('.chapter-reset', card);
    if (respondidas > 0 || state.concluido) {
      reiniciar.hidden = false;
      reiniciar.setAttribute('aria-label', `Reiniciar ${capitulo.titulo}`);
      reiniciar.addEventListener('click', () => {
        if (confirmarReinicio(aluno.id, capitulo.id)) {
          window.location.href = rota('quiz', aluno.id, capitulo.id);
        }
      });
    }
    lista.append(card);
  }
}


function initQuiz() {
  const ctx = getContext(); if (!ctx) return;
  const { aluno, capitulo } = ctx;
  setNomeAluno(aluno);
  if (!capitulo || !capitulo.questoes.length) {
    window.location.replace(rota('capitulos', aluno.id)); return;
  }
  const total = capitulo.questoes.length;
  let state = loadState(aluno.id, capitulo.id);
  if (state.concluido || state.indice >= total) {
    window.location.replace(rota('resultado', aluno.id, capitulo.id)); return;
  }
  let selected = null;
  $('#quiz-titulo').textContent = capitulo.titulo;
  const optionsContainer = $('#opcoes');
  const answerWrap = $('#resposta-aberta-wrap');
  const textarea = $('#resposta-texto');
  const selfCheck = $('#autoavaliacao');
  const btnAcertou = $('#avaliei-certo');
  const btnRevisar = $('#avaliei-revisar');
  const feedback = $('#feedback');
  const botaoConfirmar = $('#confirmar-resposta');
  const botaoProximo = $('#proxima-questao');
  const botaoReiniciar = $('#reiniciar-quiz');
  botaoReiniciar.addEventListener('click', () => {
    if (confirmarReinicio(aluno.id, capitulo.id)) {
      window.location.href = rota('quiz', aluno.id, capitulo.id);
    }
  });

  function render() {
    const index = state.indice;
    const questao = capitulo.questoes[index];
    const aberta = questao.tipo === 'aberta';
    const sequencia = questao.tipo === 'sequencia';
    const resposta = state.respostas[index];
    const confirmed = aberta
      ? !!(resposta && typeof resposta === 'object' && typeof resposta.texto === 'string')
      : sequencia
        ? Array.isArray(resposta) && resposta.length === questao.itens.length
        : Number.isInteger(resposta);
    selected = aberta || sequencia ? null : confirmed ? resposta : null;
    $('#questao-numero').textContent = String(index + 1).padStart(2, '0');
    $('#questao-contador').textContent = `Questão ${index + 1} de ${total}`;
    botaoReiniciar.hidden = !state.respostas.length && state.indice === 0;
    $('#progresso-quiz').style.width = `${(state.respostas.length / total) * 100}%`;
    $('#tema-questao').textContent = questao.assunto;
    $('#questao-enunciado').textContent = questao.enunciado;

    const subitens = $('#questao-subitens');
    subitens.replaceChildren();
    const temSubitens = Array.isArray(questao.subitens) && questao.subitens.length > 0;
    subitens.hidden = !temSubitens;
    if (temSubitens) questao.subitens.forEach(item => subitens.append(elem('li', '', item.replace(/^[a-h]\)\s*/, ''))));
    if (typeof window.renderGraficoQuestao === 'function') {
      window.renderGraficoQuestao($('#grafico-questao'), questao.grafico);
    } else {
      $('#grafico-questao').hidden = true;
    }
    if (questao.figura && typeof window.renderDiagramaQuestao === 'function') {
      window.renderDiagramaQuestao($('#grafico-questao'), questao.figura);
    }

    optionsContainer.hidden = aberta;
    answerWrap.hidden = !aberta;
    selfCheck.hidden = !aberta || !confirmed;
    optionsContainer.replaceChildren();
    if (aberta) {
      textarea.value = confirmed ? resposta.texto : '';
      textarea.disabled = confirmed;
      btnAcertou.setAttribute('aria-pressed', String(!!(confirmed && resposta.avaliacao === 'acertou')));
      btnRevisar.setAttribute('aria-pressed', String(!!(confirmed && resposta.avaliacao === 'revisar')));
      botaoConfirmar.innerHTML = `Conferir resposta ${svgIcon('arrow', 18)}`;
    } else if (sequencia) {
      botaoConfirmar.innerHTML = `Conferir sequência ${svgIcon('arrow', 18)}`;
      questao.itens.forEach((item, i) => {
        const row = elem('label', 'sequence-row');
        const statement = elem('span', 'sequence-statement', item);
        const select = elem('select', 'sequence-select');
        select.setAttribute('aria-label', `Resposta do item ${i + 1}`);
        const placeholder = elem('option', '', 'Escolha');
        placeholder.value = '';
        select.append(placeholder);
        questao.valoresResposta.forEach(valor => {
          const option = elem('option', '', valor);
          option.value = valor;
          select.append(option);
        });
        select.value = confirmed ? resposta[i] : '';
        select.disabled = confirmed;
        if (confirmed) row.classList.add(resposta[i] === questao.respostasCorretas[i] ? 'sequence-correct' : 'sequence-wrong');
        select.addEventListener('change', () => {
          botaoConfirmar.disabled = [...optionsContainer.querySelectorAll('select')].some(field => !field.value);
        });
        row.append(statement, select);
        optionsContainer.append(row);
      });
    } else {
      botaoConfirmar.innerHTML = `Confirmar resposta ${svgIcon('arrow', 18)}`;
      questao.alternativas.forEach((alternativa, idx) => {
        const button = elem('button', 'opcao');
        button.type = 'button';
        button.innerHTML = '<span class="opcao-letra"></span><span class="opcao-texto"></span><span class="opcao-indicador"></span>';
        $('.opcao-letra', button).textContent = String.fromCharCode(65 + idx);
        $('.opcao-texto', button).textContent = alternativa;
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
    }
    botaoConfirmar.hidden = confirmed;
    botaoConfirmar.disabled = aberta ? !textarea.value.trim()
      : sequencia ? [...optionsContainer.querySelectorAll('select')].some(field => !field.value)
      : selected === null;
    botaoProximo.hidden = !confirmed;
    botaoProximo.disabled = aberta ? !(confirmed && resposta.avaliacao) : false;
    botaoProximo.innerHTML = index === total - 1 ? `Ver meu resultado ${svgIcon('arrow', 18)}` : `Próxima questão ${svgIcon('arrow', 18)}`;
    feedback.hidden = !confirmed;
    if (confirmed) {
      if (aberta) {
        feedback.className = 'feedback feedback-neutro';
        $('#feedback-icone').innerHTML = svgIcon('book', 19);
        $('#feedback-titulo').textContent = 'Confira a resolução';
        $('#feedback-descricao').textContent = 'Compare com o que você escreveu e indique como se saiu.';
      } else {
        const acertou = sequencia
          ? questao.respostasCorretas.every((valor, i) => resposta[i] === valor)
          : selected === questao.correta;
        feedback.className = `feedback ${acertou ? 'feedback-certo' : 'feedback-errado'}`;
        $('#feedback-icone').innerHTML = svgIcon(acertou ? 'check' : 'x', 19);
        $('#feedback-titulo').textContent = acertou ? 'Muito bem! Você acertou.' : 'Confira o que precisa revisar.';
        $('#feedback-descricao').textContent = acertou
          ? 'Confira a resolução para reforçar o aprendizado.'
          : sequencia ? `Sequência correta: ${questao.respostasCorretas.join(', ')}`
            : `Resposta correta: ${String.fromCharCode(65 + questao.correta)}. ${questao.alternativas[questao.correta]}`;
      }
      $('#resolucao').textContent = questao.resolucao;
    }
  }

  textarea.addEventListener('input', () => {
    const questao = capitulo.questoes[state.indice];
    if (questao.tipo === 'aberta' && !state.respostas[state.indice]) {
      botaoConfirmar.disabled = !textarea.value.trim();
    }
  });
  for (const [botao, avaliacao] of [[btnAcertou, 'acertou'], [btnRevisar, 'revisar']]) {
    botao.addEventListener('click', () => {
      const questao = capitulo.questoes[state.indice];
      const resposta = state.respostas[state.indice];
      if (questao.tipo !== 'aberta' || !resposta || typeof resposta !== 'object') return;
      resposta.avaliacao = avaliacao;
      saveState(aluno.id, capitulo.id, state);
      render();
    });
  }

  botaoConfirmar.addEventListener('click', () => {
    const questao = capitulo.questoes[state.indice];
    if (state.respostas[state.indice] !== undefined) return;
    if (questao.tipo === 'aberta') {
      const texto = textarea.value.trim();
      if (!texto) return;
      state.respostas[state.indice] = { texto, avaliacao: null };
    } else if (questao.tipo === 'sequencia') {
      const values = [...optionsContainer.querySelectorAll('select')].map(field => field.value);
      if (values.length !== questao.itens.length || values.some(value => !value)) return;
      state.respostas[state.indice] = values;
    } else {
      if (selected === null) return;
      state.respostas[state.indice] = selected;
    }
    saveState(aluno.id, capitulo.id, state);
    render();
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  botaoProximo.addEventListener('click', () => {
    const questao = capitulo.questoes[state.indice];
    const resposta = state.respostas[state.indice];
    const answered = questao.tipo === 'aberta'
      ? !!(resposta && resposta.avaliacao)
      : questao.tipo === 'sequencia'
        ? Array.isArray(resposta) && resposta.length === questao.itens.length
        : Number.isInteger(resposta);
    if (!answered) return;
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
  if (!capitulo || !capitulo.questoes.length) {
    window.location.replace(rota('capitulos', aluno.id)); return;
  }
  const state = loadState(aluno.id, capitulo.id);
  const total = capitulo.questoes.length;
  if (!state.concluido || state.respostas.length !== total) {
    window.location.replace(rota('quiz', aluno.id, capitulo.id)); return;
  }
  const acertos = countCorrect(capitulo, state);
  const erros = total - acertos;
  const aberta = capitulo.questoes.some(questao => questao.tipo === 'aberta');
  const percentual = Math.round((acertos / Math.max(total, 1)) * 100);
  if (aberta) {
    $('#rotulo-percentual').textContent = 'de desempenho (inclui autoavaliação)';
    $('#rotulo-acertos').textContent = 'Acertos/Resolvidas';
    $('#rotulo-erros').textContent = 'Erros/A revisar';
  }
  $('#score-percentual').textContent = `${percentual}%`;
  $('#score-circulo').style.setProperty('--percentual', `${percentual}%`);
  $('#score-acertos').textContent = String(acertos);
  $('#score-erros').textContent = String(erros);
  $('#score-total').textContent = String(total);
  $('#mensagem-resultado').textContent = aberta
    ? 'O resultado combina questões corrigidas automaticamente e suas autoavaliações.'
    : percentual === 100 ? 'Excelente! Você acertou todas as questões.'
    : percentual >= 70 ? 'Ótimo trabalho! Continue praticando.'
    : 'Cada questão é uma chance de aprender mais.';
  const lista = $('#lista-revisao');
  capitulo.questoes.forEach((questao, index) => {
    const resposta = state.respostas[index];
    const isOpen = questao.tipo === 'aberta';
    const isSeq = questao.tipo === 'sequencia';
    const isCorrect = isOpen ? resposta.avaliacao === 'acertou'
      : isSeq ? Array.isArray(resposta) && questao.respostasCorretas.every((valor, i) => resposta[i] === valor)
      : resposta === questao.correta;
    const item = elem('details', `resumo-questao ${isCorrect ? 'resumo-certo' : 'resumo-errado'}`);
    const summary = elem('summary', 'resumo-cabecalho');
    summary.innerHTML = `<span class="resumo-status">${svgIcon(isCorrect ? 'check' : 'x', 16)}</span><span class="resumo-titulo"></span><span class="resumo-badge">${isOpen ? (isCorrect ? 'Resolvida' : 'Revisar') : (isCorrect ? 'Correta' : 'Incorreta')}</span><span class="resumo-chevron">⌄</span>`;
    $('.resumo-titulo', summary).textContent = `Questão ${String(index + 1).padStart(2, '0')} · ${questao.assunto}`;
    const body = elem('div', 'resumo-conteudo');
    const question = elem('p', 'resumo-enunciado', questao.enunciado);
    const sua = elem('p', 'resumo-sua-resposta', isOpen ? `Sua resposta: ${resposta.texto}`
      : isSeq ? `Sua sequência: ${resposta.join(', ')}`
      : `Sua resposta: ${questao.alternativas[resposta]}`);
    const certa = isOpen ? elem('p', '', 'Resolução comentada:')
      : isSeq ? elem('p', '', `Sequência correta: ${questao.respostasCorretas.join(', ')}`)
      : elem('p', '', `Resposta correta: ${questao.alternativas[questao.correta]}`);
    const resolucao = elem('p', 'resumo-explicacao', questao.resolucao);
    body.append(question, sua, certa, resolucao);
    item.append(summary, body);
    lista.append(item);
  });
  $('#voltar-capitulos').href = rota('capitulos', aluno.id, capitulo.id);
  $('#tentar-novamente').addEventListener('click', () => {
    if (confirmarReinicio(aluno.id, capitulo.id)) {
      window.location.href = rota('quiz', aluno.id, capitulo.id);
    }
  });
}

const pagina = document.body.dataset.page;
if (pagina === 'home') initHome();
if (pagina === 'capitulos') initCapitulos();
if (pagina === 'quiz') initQuiz();
if (pagina === 'resultado') initResultado();
