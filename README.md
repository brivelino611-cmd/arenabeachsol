# Arena Beach Solonópole 🏖️

Site institucional + sistema de reservas próprio da **Arena Beach Solonópole**
(Beach Tennis, Vôlei, Futvôlei, Restaurante, Açaí & Sorvetes, Moda Fitness).

O projeto é dividido em duas partes independentes:

```
arena-beach-solonopole/
├── frontend/   → site estático (HTML, CSS, JS puro)
└── backend/    → API Node.js/Express que grava as reservas no Google Sheets
```

O frontend **nunca** fala diretamente com o Google Sheets. Toda reserva passa
pelo backend, que confere a disponibilidade novamente antes de gravar
(proteção contra dupla reserva) e é o único lugar que guarda as credenciais
do Google.

---

## 1. Como instalar

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior.

```bash
# 1. Instale as dependências do backend
cd backend
npm install

# 2. Volte para a raiz e copie o exemplo de variáveis de ambiente
cd ..
cp backend/.env.example backend/.env
```

O frontend não tem dependências — é HTML/CSS/JS puro.

---

## 2. Como configurar o `.env`

Abra `backend/.env` e preencha:

| Variável | O que é |
|---|---|
| `PORT` | Porta em que a API vai rodar (padrão `3000`) |
| `FRONTEND_ORIGIN` | URL do site que pode chamar a API (CORS) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID da planilha (está na URL do Google Sheets) |
| `GOOGLE_SHEETS_TAB_NAME` | Nome da aba usada para as reservas (padrão `Reservas`) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | E-mail da Service Account do Google |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Chave privada da Service Account |

**Nunca** commite o arquivo `.env` — ele já está no `.gitignore`.

---

## 3. Como conectar ao Google Sheets (Service Account)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto novo (ou use um existente).
3. Ative a **Google Sheets API** em "APIs e Serviços" → "Biblioteca".
4. Vá em "APIs e Serviços" → "Credenciais" → "Criar credenciais" →
   **Conta de serviço**.
5. Dê um nome (ex: `arena-beach-backend`) e conclua a criação.
6. Na conta de serviço criada, vá em "Chaves" → "Adicionar chave" →
   "Criar nova chave" → formato **JSON**. Um arquivo será baixado.
7. Abra o JSON baixado e copie:
   - `client_email` → cole em `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → cole em `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
     (mantenha as aspas e os `\n` como estão no arquivo original).
8. **Compartilhe a planilha do Google Sheets** com o e-mail da service
   account (o mesmo `client_email`), dando permissão de **Editor**.
   Sem esse compartilhamento, o backend não consegue escrever na planilha.

---

## 4. Como configurar a planilha

1. Crie uma planilha nova no Google Sheets (ou use uma existente).
2. Pegue o ID da planilha na URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_TRECHO_AQUI/edit
   ```
   e cole em `GOOGLE_SHEETS_SPREADSHEET_ID`.
3. Não é necessário criar a aba nem o cabeçalho manualmente — ao iniciar,
   o backend cria automaticamente a aba definida em `GOOGLE_SHEETS_TAB_NAME`
   (padrão `Reservas`) com o cabeçalho:

   ```
   ID | Data | Horario | Modalidade | Servico | Valor | Nome | Telefone | Email | Observacao | CriadaEm | Status
   ```

4. Lembre-se de compartilhar a planilha com o e-mail da service account
   (passo 8 da seção anterior).

---

## 5. Como executar localmente

**Backend:**

```bash
cd backend
npm run dev
# API disponível em http://localhost:3000
```

**Frontend:**

Abra `frontend/index.html` diretamente no navegador, ou sirva a pasta com
qualquer servidor estático, por exemplo:

```bash
npx serve frontend -l 5500
# Site disponível em http://localhost:5500
```

> Se o backend não estiver rodando, o frontend entra automaticamente em
> **modo demonstração** (dados simulados) para que o visual continue
> navegável — mas nenhuma reserva real é salva nesse modo.

Se o backend estiver em outra URL/porta, defina antes dos scripts
carregarem, no `index.html`:

```html
<script>window.ARENA_API_BASE_URL = "http://localhost:3000/api";</script>
```

---

## 6. Como fazer deploy

**Backend** (API Node.js): pode ser hospedado em serviços como Render,
Railway, Fly.io ou uma VPS com PM2. Configure as mesmas variáveis do
`.env` no painel de variáveis de ambiente do provedor escolhido.

**Frontend** (arquivos estáticos): pode ser hospedado em Vercel, Netlify,
GitHub Pages, ou no mesmo domínio da Arena via qualquer hospedagem
tradicional. Após o deploy do backend, aponte `window.ARENA_API_BASE_URL`
para a URL pública da API.

Antes de publicar, atualize:
- `frontend/robots.txt` e `frontend/sitemap.xml` com o domínio real.
- `frontend/js/config.js` com WhatsApp, endereço, Instagram e horários
  oficiais (veja seção 7).

---

## 7. Como alterar preços, horários e modalidades

Edite **dois arquivos** (eles precisam ficar sincronizados):

- `frontend/js/config.js` → objeto `servicos` e `modalidades`
- `backend/src/services/catalog.js` → array `SERVICOS` e `MODALIDADES`

O backend nunca confia no preço enviado pelo navegador: ele sempre
recalcula o valor a partir do `catalog.js`. Por isso, uma mudança de
preço só tem efeito real quando feita também no backend.

Exemplo — adicionando um novo serviço "05 Horas":

```js
{
  id: "5h",
  nome: "05 Horas Seguidas",
  duracaoMin: 300,
  preco: 195.0,
  janelas: [{ inicio: "16:00", fim: "23:00" }],
}
```

---

## 8. Como adicionar novas quadras e patrocinadores

**Quadras** — edite `frontend/js/config.js`, array `quadras`:

```js
{
  id: "quadra-03",
  nome: "Quadra 03",
  modalidades: ["Beach Tennis"],
  descricao: "Descrição curta da quadra.",
  imagem: "assets/images/quadra-03.jpg",
  patrocinadoresIds: ["patrocinador-x"], // opcional
}
```
Coloque a foto real em `frontend/assets/images/`.

**Patrocinadores** — edite `frontend/js/config.js`, array `patrocinadores`:

```js
{
  id: "patrocinador-x",
  nome: "Nome do Patrocinador",
  logo: "assets/logos/patrocinador-x.png",
  link: "https://instagram.com/patrocinador", // opcional
}
```
Coloque o logo em `frontend/assets/logos/`. Enquanto nenhum patrocinador
for cadastrado, a seção exibe uma mensagem de "em breve" no lugar dos
cards.

---

## Dados ainda pendentes (placeholders)

Os seguintes itens foram deixados como placeholder por não terem sido
fornecidos, e devem ser preenchidos em `frontend/js/config.js`:

- `whatsapp` — número oficial da Arena
- `endereco` — endereço completo e link do Google Maps
- `horarioFuncionamento` — horário oficial por dia da semana
- `telefone` e `instagram` (opcionais)
- Fotos reais da hero, das quadras e logos dos patrocinadores

Nenhum preço, horário de reserva, modalidade ou patrocinador foi
inventado — apenas os itens acima, que dependem de confirmação da Arena.
