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

## Atividades ativas

- **Luiza:** `questions-luiza-23-11.js` — “Revisão prova 23/11”, Matemática do 7º ano, 40 questões. Versão atualizada com 20 questões de múltipla escolha, 8 de associação/verdadeiro ou falso e 12 abertas, acompanhadas de gabarito comentado. Gráficos reconstruídos no `graficos.js`.
- **Anderson:** `questions-anderson-23-11.js` — “Revisão Matemática (23/11)”, Matemática do 6º ano, 40 questões com cinco alternativas, gabarito e resolução. As figuras necessárias para questões que dependem de leitura visual são reconstruídas por `graficos.js`.
- **Giovana:** perfil mantido, atualmente sem atividades; a interface informa que ainda não há atividades disponíveis.

**As seis questões de teste foram removidas.** O antigo arquivo `questions.js` deixou de ser carregado.

## Adicionar novas atividades

As páginas HTML carregam os arquivos `questions-*.js` antes de `app.js`. Cada arquivo acrescenta um capítulo a `window.CHAPTERS`, com `id`, `titulo`, `subtitulo`, `descricao`, `alunos` e `questoes`.

Use `alunos: ['luiza']` ou `alunos: ['anderson']` para restringir a atividade a um aluno. Sem `alunos`, a atividade é mostrada a todos.

Os formatos atuais são:
- `tipo: 'multipla_escolha'`, com `alternativas`, índice numérico `correta` e `resolucao`, corrigida automaticamente.
- `tipo: 'sequencia'`, com `itens`, `valoresResposta`, `respostasCorretas` e `resolucao`, corrigida automaticamente quando a sequência inteira coincide.
- `tipo: 'aberta'`, com `enunciado` e `resolucao`. O aluno escreve, confere a resolução e marca “Consegui resolver” ou “Preciso revisar”. A avaliação desta questão é manual pelo aluno; o resultado final inclui essa autoavaliação.

A revisão da Luiza usa `versao: 2`, porque seu conteúdo foi substituído. Isso inicia um novo progresso local, sem misturar respostas de versões diferentes. As atividades do Anderson usam uma chave separada.

**Compatibilidade:** Giovana mantém o identificador interno `jovana`, preservando possíveis links antigos.

## Importante sobre resultados

Os resultados ficam salvos **apenas no armazenamento local (localStorage) do navegador e do aparelho em que o quiz foi respondido**. Não há banco de dados nem login. Os resultados NÃO são enviados automaticamente ao professor, nem sincronizados entre dispositivos. Este é um protótipo para prática e validação visual. Para acompanhar notas remotamente, use um banco de dados e autenticação (por exemplo, Supabase ou Firebase) e cuide da privacidade de menores, quando aplicável.

O código das respostas também fica disponível no navegador do aluno, por ser um site estático; não use esta versão como sistema antifraude para provas oficiais.

## Tecnologias

HTML + CSS + JavaScript puro. Sem instalação, sem framework e sem build. As fontes externas têm fallback para fontes do sistema.
