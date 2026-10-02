V7 — correções avisos + Tomei conhecimento

1. Substituir index.html, sw.js e manifest.json no alojamento.
2. Se a tabela team_convocation_ack ainda não existir, executar convocatoria-confirmacoes.sql.
3. Abrir a app pelo endereço HTTPS publicado e usar Atualizar uma vez.
4. O painel de avisos passa a ler sempre team_content e tem atualização automática de 30 em 30 segundos como fallback.
5. O botão Tomei conhecimento mostra o erro real do Supabase se a tabela/RLS não estiver configurada.

Nota: notificações aqui são notificações do navegador/local. Push em segundo plano com a app totalmente fechada requer Web Push + servidor/Edge Function.
