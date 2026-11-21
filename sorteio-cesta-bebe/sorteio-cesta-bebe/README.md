# Sorteio Cesta Bebê

Site de sorteio para gestantes, recriado a partir do original do Manus.
React + Vite no front, Supabase (banco + login) e funções da Vercel.

## O que tem

- `/`: landing com hero, kits, destaques e formulário de inscrição
- `/inscricao`: só o formulário
- `/resultado`: dezenas da Federal, número sorteado, consulta por protocolo e regulamento
- `/admin`: painel com Visão geral, Planilha de inscritas, Sorteio e resultado, Configurações
- `/planilha`: atalho para a planilha do painel
- Meta Pixel: `Lead` + `FormStart` no primeiro campo, `CompleteRegistration` (1 BRL) + `InscricaoConcluida` no sucesso
- Rotina da Federal: cron da Vercel às 9h e às 21h30 (horário de Brasília). Ela busca o concurso, calcula o número e publica sozinha quando a publicação automática está ligada.
- A integração Auto Lead ficou de fora, como combinado.

## Passo a passo

### 1. Supabase
1. Crie um projeto em supabase.com.
2. Abra o **SQL Editor**, cole o arquivo `supabase/schema.sql` inteiro e clique em Run.
3. Vá em **Authentication → Users → Add user**, crie seu usuário (e-mail + senha) e marque *Auto Confirm*.
4. Volte ao SQL Editor e rode (trocando o e-mail):
   ```sql
   insert into public.admin_users (user_id, username, name)
   select id, email, 'Organização' from auth.users where email = 'SEU-EMAIL@exemplo.com';
   ```
5. Em **Project Settings → API**, copie a *Project URL*, a *anon key* e a *service_role key*.

### 2. Vercel
1. Suba esta pasta para um repositório no GitHub e importe na Vercel (ela detecta Vite sozinha).
2. Em **Settings → Environment Variables**, adicione:
   | Nome | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | Project URL |
   | `VITE_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (nunca coloque no front) |
   | `CRON_SECRET` | uma frase longa qualquer |
3. Faça o deploy. Entre em `/admin` com o usuário criado no passo 1.

### 3. Primeiro uso no painel
- **Configurações**: nome do sorteio, Pixel, WhatsApp da organização, Instagram, e-mail e URL da foto do prêmio. A foto aparece no topo do site; sem foto, o site mostra uma ilustração.
- **Sorteio e resultado**: data de encerramento, concurso (botão *Detectar*), regra de cálculo e texto do regulamento.

## Regra do sorteio
- Cada inscrita recebe um número aleatório e único de 00000 a 99999, e um protocolo `SB2026` + sequência + código.
- O CPF só pode se inscrever uma vez. Quem repete o CPF vê o número que já tem.
- `soma_modulo` (padrão): soma dos 4 últimos dígitos de cada um dos 5 prêmios, guardando os 5 últimos dígitos.
- `primeira_dezena`: usa só o 1º prêmio.
- Se nenhuma inscrita tiver o número exato, o painel mostra "nenhuma cota correspondente".
- Se a API da Caixa estiver fora do ar, lance as dezenas à mão em *Lançar dezenas manualmente*.

## Rodar no computador
```bash
cp .env.example .env   # preencha as chaves
npm install
npm run dev            # site em http://localhost:5173
```
As rotas `/api/*` só funcionam na Vercel ou com `vercel dev`.
