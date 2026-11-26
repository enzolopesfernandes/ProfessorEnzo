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

- **Luiza — Capítulo 7 (recuperação):** `questions-luiza-geografia-cap7.js`. Geografia do 7º ano — economia e setores econômicos no Brasil. 25 questões (10 de múltipla escolha, 3 de classificação/associação e 12 discursivas).
- **Luiza — Capítulo 8 (recuperação):** `questions-luiza-geografia-cap8.js`. Geografia do 7º ano — o espaço rural brasileiro. 25 questões (8 de múltipla escolha, 2 de classificação/associação e 15 discursivas).
- **Anderson:** perfil mantido, sem atividades cadastradas.
- **Giovana:** perfil mantido, sem atividades cadastradas.

As revisões anteriores de Matemática e História dos alunos foram excluídas do banco de questões do site. Cada recuperação da Luiza tem progresso próprio e pode ser reiniciada separadamente.

Os enunciados foram transcritos da atividade de Geografia fornecida pelo professor, e as resoluções vêm do gabarito comentado correspondente. Os anos e percentuais pertencem ao material didático e não representam dados atuais de 2026.

## Adicionar novas atividades

As páginas HTML carregam os arquivos `questions-*.js` antes de `app.js`. Cada arquivo acrescenta um capítulo a `window.CHAPTERS`, com `id`, `titulo`, `subtitulo`, `descricao`, `alunos` e `questoes`.

Use `alunos: ['luiza']` ou `alunos: ['anderson']` para restringir a atividade a um aluno. Sem `alunos`, a atividade é mostrada a todos.

Os formatos atuais são:
- `tipo: 'multipla_escolha'`, com `alternativas`, índice numérico `correta` e `resolucao`, corrigida automaticamente.
- `tipo: 'sequencia'`, com `itens`, `valoresResposta`, `respostasCorretas` e `resolucao`, corrigida automaticamente quando a sequência inteira coincide.
- `tipo: 'aberta'`, com `enunciado` e `resolucao`. O aluno escreve, confere a resolução e marca “Consegui resolver” ou “Preciso revisar”. A avaliação desta questão é manual pelo aluno; o resultado final inclui essa autoavaliação.

Os capítulos 7 e 8 possuem IDs diferentes dos anteriores e entre si, evitando que o progresso antigo seja misturado com as novas respostas. A seleção mostra os capítulos na ordem 7 e 8.

**Compatibilidade:** Giovana mantém o identificador interno `jovana`, preservando possíveis links antigos.

## Verificar questões

Execute `node tests/validar-questoes.cjs` no repositório para validar os dois capítulos, as 50 questões, IDs, tipos, respostas, exclusividade por aluno e ausência dos bancos antigos. O site continua estático e dispensa build.

## Reiniciar uma atividade

Quando uma revisão tiver respostas salvas, a lista de capítulos mostra **Reiniciar atividade** ao lado de **Continuar revisão** (ou **Ver resultado** se estiver concluída). Durante a revisão, o botão **Reiniciar atividade** aparece junto ao progresso depois de uma resposta confirmada. A tela de resultado oferece **Refazer atividade**.

Todas as opções solicitam confirmação antes de reiniciar. Ao confirmar, somente o progresso daquela atividade e daquele aluno é zerado no navegador: índice, respostas e estado de conclusão. Cancelar mantém as respostas existentes. As demais atividades permanecem intactas.

## Importante sobre resultados

Os resultados ficam salvos **apenas no armazenamento local (localStorage) do navegador e do aparelho em que o quiz foi respondido**. Não há banco de dados nem login. Os resultados NÃO são enviados automaticamente ao professor, nem sincronizados entre dispositivos. Este é um protótipo para prática e validação visual. Para acompanhar notas remotamente, use um banco de dados e autenticação (por exemplo, Supabase ou Firebase) e cuide da privacidade de menores, quando aplicável.

O código das respostas também fica disponível no navegador do aluno, por ser um site estático; não use esta versão como sistema antifraude para provas oficiais.

## Tecnologias

HTML + CSS + JavaScript puro. Sem instalação, sem framework e sem build. As fontes externas têm fallback para fontes do sistema.
