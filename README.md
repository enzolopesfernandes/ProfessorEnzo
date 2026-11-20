# Professor Enzo — Plataforma de revisão

Protótipo funcional, responsivo e 100% estático, pronto para GitHub + Netlify.

## Telas

- `index.html` — Escolha entre Anderson, Luiza e Giovana.
- `capitulos.html` — Capítulos disponíveis e progresso de cada aluno.
- `quiz.html` — Questões com correção imediata e resolução, acertando ou errando.
- `resultado.html` — Aproveitamento, acertos, erros e revisão de cada questão.

## Como publicar no Netlify

1. Crie um repositório no GitHub e envie todos os arquivos (exceto `build_html.py`, que é opcional e usado apenas para gerar as páginas).
2. No Netlify, crie um projeto usando `Add new project > Import an existing project` e escolha o repositório GitHub.
3. Este projeto não precisa de comando de build. Deixe a pasta de publicação como a raiz do projeto (`.`), se o painel solicitar.
4. Publique. Os próximos commits na branch configurada poderão publicar automaticamente novas versões.

## Adicionando questões

Abra o arquivo `questions.js`. Dentro de `window.CHAPTERS`, cada capítulo tem `id`, `titulo`, `subtitulo`, `descricao` e uma lista `questoes`. Exemplo:

```js
{
  id: 'q-nova',
  assunto: 'Matemática',
  enunciado: 'Quanto é 5 + 3?',
  alternativas: ['6', '7', '8', '9'],
  correta: 2, // posição da alternativa certa: 0 = A, 1 = B, 2 = C, 3 = D
  resolucao: '5 + 3 = 8.'
}
```

Para adicionar novos capítulos, inclua novos objetos no array `window.CHAPTERS` ou em um arquivo adicional carregado após `questions.js`. A página de capítulos agora lista automaticamente as atividades disponíveis. Um capítulo com `alunos: ['luiza']` será exibido apenas para Luiza; sem esse campo, ficará disponível para todos os alunos.

### Revisão de Luiza — prova 23/11

A atividade de Matemática do 7º ano fica em `questions-luiza-23-11.js` e reúne 40 questões originais, com subitens e resolução comentada. Os sete gráficos são renderizados por `graficos.js`, com uma tabela opcional de dados para acessibilidade.

As questões discursivas usam `tipo: 'aberta'`. A estudante escreve a resposta, confere a resolução e marca **Consegui resolver** ou **Preciso revisar**. O percentual final dessas questões é **autoavaliado**, e não uma nota atribuída automaticamente. As questões de múltipla escolha continuam com correção automática.

O progresso permanece no `localStorage` do navegador e não é sincronizado entre aparelhos.

**Compatibilidade:** Giovana mantém o identificador interno `jovana` para preservar os links e o progresso salvos anteriormente no navegador.

## Importante sobre resultados

Os resultados ficam salvos **apenas no armazenamento local (localStorage) do navegador e do aparelho em que o quiz foi respondido**. Não há banco de dados nem login. Os resultados NÃO são enviados automaticamente ao professor, nem sincronizados entre dispositivos. Este é um protótipo para prática e validação visual. Para acompanhar notas remotamente, use um banco de dados e autenticação (por exemplo, Supabase ou Firebase) e cuide da privacidade de menores, quando aplicável.

O código das respostas também fica disponível no navegador do aluno, por ser um site estático; não use esta versão como sistema antifraude para provas oficiais.

## Tecnologias

HTML + CSS + JavaScript puro. Sem instalação, sem framework e sem build. As fontes externas têm fallback para fontes do sistema.
