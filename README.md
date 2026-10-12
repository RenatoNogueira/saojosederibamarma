# São José de Ribamar — site em EJS

```bash
npm install
npm run dev        # http://localhost:5173 (renderiza o EJS a cada requisição)
npm run build      # gera o site estático em dist/
npm run check      # build + validação + testes (rode antes de publicar)
```

Requer Node 20 ou superior (`.nvmrc`).

## Imagens (WebP)
Os originais ficam em `assets-src/` (fora do site); o site usa só WebP em `public/`.

```bash
npm run images          # converte o que mudou (fotos até 1280 px, qualidade 78)
npm run images:force    # reconverte tudo
```

Fluxo para uma foto nova: copie o JPG/PNG para `assets-src/photos/` → `npm run images` → descreva `nome.webp` em `data/photos.js`.

## Publicar na Vercel
1. Envie o repositório ao GitHub.
2. Na Vercel: **Add New → Project** e escolha o repositório. As configurações já vêm de `vercel.json`
   (build `npm run build`, saída `dist`, sem framework, cabeçalhos de segurança e cache).
3. Cada push na `main` publica em produção; pull requests geram *preview deployments*.

O build na Vercel instala só as dependências de produção (`npm ci --omit=dev`): a conversão de imagens é feita localmente.

## Contador de visitantes
Texto discreto no fim do rodapé: `12.480 visitas · 3 agora` (o "agora" só aparece com 2 ou mais pessoas).
- **Front:** `public/js/visitors.js` — sem cookies, id aleatório de sessão, respeita *Do Not Track*, some se a API falhar.
- **API:** `api/visitors.js` (função da Vercel) — guarda no Redis só um id aleatório que expira em ~70 s e o total.
- **Ativar na Vercel:** Projeto → **Storage → Create Database → Upstash (Redis)** → conecte ao projeto (isso cria
  `KV_REST_API_URL` e `KV_REST_API_TOKEN`) → **Redeploy**. Sem isso a API responde 503 e o contador fica oculto.

## Velas compartilhadas (altar)
O altar mostra as velas de todos os visitantes, agrupadas por intenção (gratidão, pedido, lembrança); compartilhar é opcional para quem escreve. O nome "lanterns" permanece na API e no armazenamento por compatibilidade.
- **API:** `api/lanterns.js` (GET lista, POST publica/denuncia), mesmo Redis do contador. Sem Redis, o céu segue só local.
- **Moderação mínima** (`api/_moderate.js`): palavrões, links, e-mail/telefone/CPF, repetição; denúncia (3 ocultam);
  limite de 5 por hora por pessoa (hash de IP, 1 h) e 20 s entre envios; expiração em 7 dias; até 100 guardadas.
- **Remover uma mensagem manualmente:** no console do Upstash, `ZRANGE ribamar:lanterns 0 -1` para achar o membro
  e `ZREM ribamar:lanterns "<membro>"` (ou `DEL ribamar:lanterns` para zerar o céu).

## Estrutura
| Pasta | Conteúdo |
|---|---|
| `data/site.js` | números, história, lugares, festejo, cultura, quiz, rotas, fontes |
| `data/extra.js` | sabores, onde comer, onde ficar, calendário do ano |
| `data/photos.js` | legendas, textos alternativos e créditos da galeria |
| `views/` | `index.ejs` + uma parcial por seção em `partials/` |
| `lib/` | `render.js` (EJS), `photos.js` (leitura das fotos), `server.js` (servidor de dev) |
| `public/` | CSS, JS e imagens WebP |
| `assets-src/` | originais JPG/PNG (fonte das conversões) |
| `scripts/` | `validate.js`, `optimize-images.js`, `clean-css.js` |
| `test/` | testes automatizados (`node --test`) |

## Qualidade e prevenção de erros
`npm run validate` falha (código 1) se encontrar:
- **Dados:** ids duplicados, campos obrigatórios vazios, resposta de quiz fora do intervalo, mês/dia inválido,
  ícone ou cor inexistente, lugar sem rota, foto com `mapId` inexistente.
- **Fotos:** arquivo ausente, sem texto alternativo, sem autor/licença/link (exigidos pelas licenças livres).
- **HTML gerado:** ids duplicados, âncoras e recursos locais quebrados, `<img>` sem `alt`, `target="_blank"` sem
  `rel="noopener"`, `data-open` apontando para dado inexistente, resíduo de EJS, "undefined"/"NaN" na página, JSON inválido.
- **Código:** erro de sintaxe, `$()` usado como lista (deveria ser `$$`), `debugger`, elemento `#id` do JS que não existe,
  CSS com chaves desbalanceadas, arquivo CSS/JS referenciado que não existe, seções fora de numeração.

Avisos (não falham): fotos acima de 700 KB, arquivos órfãos, `console.log` esquecido.

`npm test` cobre: servidor (URL malformada, path traversal, métodos, erro de render sem derrubar), renderização de todas as seções,
JSON embutido e leitura das fotos. A CI (`.github/workflows/ci.yml`) roda build, validação e testes a cada push/PR.

## Como acrescentar conteúdo
- **Fotos:** coloque o original em `assets-src/photos/`, rode `npm run images` e descreva o `.webp` em `data/photos.js`
  (`alt`, `caption`, `cat`, `credit`, `license`, `source`). Foto de terceiros exige autor, licença e link da fonte.
- **Evento, prato, hospedagem:** edite `data/extra.js` e rode `npm run check`.
- **Lugar com botão "Como chegar":** o `id` do lugar em `data/site.js` deve existir em `routes`.

## Fontes e honestidade dos dados
Todo texto cita a fonte (`src`). Preços, notas, horários e datas de eventos mudam: os cartões avisam. Onde não há fonte confiável,
o conteúdo diz isso em vez de inventar.

## Acessibilidade
- Contraste conferido por script (WCAG AA); foco visível em fundos claros e escuros; alvos de toque ≥ 24 px.
- Diálogos nativos (`<dialog>`) devolvem o foco ao elemento de origem.
- Carrossel automático tem pausa e respeita `prefers-reduced-motion`.
- Sem JavaScript o conteúdo continua visível (a revelação animada só vale com JS).

## Créditos de imagens e mídia

- **Nuvens do hero (dia):** recortes de *Clouds (transparent).png*, de Alex Maisuradze, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Clouds_(transparent).png). Crédito também no rodapé do site. Script: `scripts/cut-clouds.js`.
- **Lua (hero, noite):** *Moon Phase and Libration, 2024*, NASA Scientific Visualization Studio (domínio público), via Wikimedia Commons. Script: `scripts/cut-moon.js`.
- **Fotos da galeria:** créditos na legenda de cada foto (lightbox) e em `data/photos.js`.
- **Vídeo "A cidade em 1989":** Sertões Gerais — Evandro Aquino, incorporado do YouTube sob demanda.
- **Fundo da seção "Do mapa ao destino":** ruas e orla do centro desenhadas a partir de dados do [OpenStreetMap](https://www.openstreetmap.org/copyright) (© colaboradores do OpenStreetMap, licença ODbL). Script: `scripts/make-map-bg.js`.

## Compactação no build

`npm run build` gera `dist/` com HTML, CSS e JS compactados (esbuild + limpeza de espaços e comentários do HTML). O código-fonte em `public/`, `views/` e o servidor de desenvolvimento (`npm run dev`) continuam legíveis. Se o `esbuild` não estiver instalado, o build segue sem compactar. Lógica em `lib/minify.js`.
