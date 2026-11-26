/* Execute: node tests/validar-questoes.cjs
 * Valida a estrutura da recuperação de Geografia, sem dependências extras.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const fail = message => { throw new Error(message); };
const sources = [
  'questions-luiza-geografia-cap7.js',
  'questions-luiza-geografia-cap8.js'
];
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const source of sources) {
  vm.runInContext(fs.readFileSync(path.join(root, source), 'utf8'), sandbox, { filename: source });
}
const chapters = sandbox.window.CHAPTERS || [];
if (chapters.length !== 2) fail('São esperados dois capítulos de recuperação.');
const ids = new Set();
for (let chapNo = 7; chapNo <= 8; chapNo++) {
  const index = chapNo - 7;
  const chap = chapters[index];
  if (chap.id !== `geografia-capitulo-${chapNo}-recuperacao`) fail('ID ou ordem do capítulo incorretos.');
  if (chap.titulo !== `Capítulo ${chapNo} (recuperação)`) fail('Título incorreto.');
  if (!Array.isArray(chap.alunos) || chap.alunos.length !== 1 || chap.alunos[0] !== 'luiza') fail('Acesso deve ser exclusivo de Luiza.');
  if (!Array.isArray(chap.questoes) || chap.questoes.length !== 25) fail('Cada capítulo precisa ter 25 questões.');
  for (let i=0; i<25; i++) {
    const question=chap.questoes[i];
    const number=25*index+i+1;
    const expectedId=`luiza-geografia-${String(number).padStart(2,'0')}`;
    if (question.id !== expectedId || ids.has(question.id)) fail('ID de questão ausente ou duplicado: '+expectedId);
    ids.add(question.id);
    if (!question.enunciado?.trim() || !question.resolucao?.trim() || !question.assunto?.trim()) fail('Enunciado, assunto ou resolução ausente: '+expectedId);
    if (question.tipo==='multipla_escolha') {
      if (!Array.isArray(question.alternativas) || question.alternativas.length!==4 ||
          !Number.isInteger(question.correta) || question.correta<0 || question.correta>=4) fail('Alternativas inválidas: '+expectedId);
    } else if (question.tipo==='sequencia') {
      if (!Array.isArray(question.itens) || !Array.isArray(question.valoresResposta) || !Array.isArray(question.respostasCorretas) ||
          question.itens.length !== question.respostasCorretas.length ||
          question.respostasCorretas.some(v=>!question.valoresResposta.includes(v))) fail('Associação inválida: '+expectedId);
    } else if (question.tipo!=='aberta') fail('Tipo inválido: '+expectedId);
  }
}
if (ids.size !== 50) fail('Esperadas 50 questões.');
for (const p of ['questions-luiza-23-11.js','questions-anderson-historia.js','questions-anderson-23-11.js','questions.js']) {
  if (fs.existsSync(path.join(root,p))) fail('Arquivo antigo ainda presente: '+p);
}
for (const p of ['index.html','capitulos.html','quiz.html','resultado.html']) {
  const html=fs.readFileSync(path.join(root,p),'utf8');
  if (sources.some(s=>!html.includes('src="'+s+'"')) ||
      /src="questions-(?:anderson|luiza-23-11)/.test(html)) fail('Scripts de atividades incorretos em '+p);
}
console.log('OK: 2 capítulos da Luiza, 25 questões cada, 50 ao total, sem atividades anteriores.');
