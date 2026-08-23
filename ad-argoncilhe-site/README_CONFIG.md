# AD Argoncilhe – site com painel de administração

## Arquitetura
- `index.html` – página pública.
- `admin.html` – painel privado.
- `config.js` – URL e Publishable/Anon key do Supabase.
- `setup.sql` – cria tabela, RLS e conteúdo inicial.

## Configuração rápida
1. Criar um projeto no Supabase.
2. No SQL Editor, executar `setup.sql`.
3. Criar o utilizador administrador em Authentication > Users.
4. Copiar a Project URL e a Publishable key para `config.js`.
5. Publicar os 4 ficheiros no GitHub Pages.
6. A página pública ficará em `/ad-argoncilhe/` e o painel em `/ad-argoncilhe/admin.html`.

Não usar a `service_role` key no browser.
