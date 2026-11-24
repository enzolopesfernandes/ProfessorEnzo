/* Execute: node tests/validar-questoes.cjs
 * Testes de estrutura dos dados sem frameworks ou dependências extras.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['questions-luiza-23-11.js', 'questions-anderson-historia.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
}
const chapters = sandbox.window.CHAPTERS || [];
const fail = message => { throw new Error(message); };
const chapterIds = new Set(), questionIds = new Set();
if (chapters.length !== 2) fail('São esperados exatamente dois capítulos reais.');
for (const chapter of chapters) {
  if (!chapter.id || chapterIds.has(chapter.id)) fail('ID de capítulo duplicado/inválido.');
  chapterIds.add(chapter.id);
  if (!Array.isArray(chapter.alunos) || chapter.alunos.length !== 1) fail('Atividade sem aluno exclusivo: ' + chapter.id);
  const esperado = chapter.alunos[0] === 'luiza' ? 40 : chapter.alunos[0] === 'anderson' ? 30 : null;
  if (!Array.isArray(chapter.questoes) || chapter.questoes.length !== esperado) fail('Quantidade incorreta em ' + chapter.id);
  for (const [index, question] of chapter.questoes.entries()) {
    if (!question.id || questionIds.has(question.id)) fail('ID de questão duplicado/inválido: ' + question.id);
    questionIds.add(question.id);
    if (!question.enunciado?.trim() || !question.resolucao?.trim()) fail('Enunciado/resolução vazio na questão ' + (index + 1));
    if (question.tipo === 'multipla_escolha') {
      if (!Array.isArray(question.alternativas) || question.alternativas.length < 4 ||
          !Number.isInteger(question.correta) || question.correta < 0 || question.correta >= question.alternativas.length)
        fail('Alternativas ou gabarito inválidos: ' + question.id);
    } else if (question.tipo === 'sequencia') {
      if (!Array.isArray(question.itens) || !Array.isArray(question.respostasCorretas) ||
          question.itens.length !== question.respostasCorretas.length ||
          question.respostasCorretas.some(value => !question.valoresResposta?.includes(value)))
        fail('Sequência inválida: ' + question.id);
    } else if (question.tipo !== 'aberta') fail('Tipo de questão desconhecido: ' + question.id);
    if (question.grafico?.series?.some(s => s.valores.length !== question.grafico.categorias.length))
      fail('Gráfico inconsistente: ' + question.id);
  }
}
if (questionIds.size !== 70) fail('Quantidade total diferente de 70.');
if (chapters.find(c => c.alunos[0] === 'luiza')?.versao !== 2) fail('Revisão da Luiza precisa da versão 2.');
const anderson = chapters.find(c => c.alunos[0] === 'anderson');
if (!anderson || anderson.id !== 'revisao-historia-6ano') fail('Revisão de História de Anderson ausente.');
if (fs.existsSync(path.join(root, 'questions-anderson-23-11.js'))) fail('Arquivo antigo de Matemática de Anderson ainda existe.');
if (fs.existsSync(path.join(root, 'questions.js'))) fail('Arquivo de testes ainda existe.');
console.log('OK: História de Anderson (30), Matemática de Luiza (40), IDs únicos e estruturas válidas.');
