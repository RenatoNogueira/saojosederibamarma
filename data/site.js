/* Conteúdo do site. Fontes: IBGE (Cidades e Biblioteca), O Imparcial, Santuário,
   Correio Braziliense, estudos da UFMA. Onde a fonte é lenda ou relato, o texto diz isso. */

const accents = { fe: '#ffc861', praia: '#5fd0ff', cultura: '#ff8a6b', territorio: '#7fb1ff', lenda: '#ff8a6b' };

/* ---------- números ----------
   Fonte: API de dados do IBGE (servicodados.ibge.gov.br), consultada em out/2026:
   Censo 2022 = 244.579 (agregado 4709); estimativa 2026 = 260.695 (agregado 6579, variável 9324). */
const numbers = [
  { value: 244579, fmt: 'int', label: 'habitantes', note: 'Censo 2022 · IBGE', icon: 'people' },
  { value: 260695, fmt: 'int', label: 'população estimada', note: 'Estimativa 2026 · IBGE', short: 'estimativa IBGE 2026', icon: 'trend' },
  { value: 180, fmt: 'int', suffix: ' km²', label: 'de área territorial', note: '180,3 km² · IBGE 2025', icon: 'map' },
  { value: 1356, fmt: 'int', label: 'hab. por km²', note: 'Densidade em 2022 · IBGE', icon: 'dens' },
  { value: 50, fmt: 'int', prefix: '+', suffix: '%', label: 'de crescimento populacional', note: 'Entre os censos, +81,5 mil pessoas', icon: 'up' },
  { value: 12.8, fmt: 'dec', prefix: 'R$ ', suffix: ' mil', label: 'PIB per capita', note: '2023 · IBGE', icon: 'coin' }
];

const sabia = [
  { t: 'Entre as 20 cidades que mais cresceram', p: 'No Censo 2022, São José de Ribamar apareceu entre as 20 cidades brasileiras com maior crescimento populacional, junto de Paço do Lumiar.' },
  { t: 'Padroeiro de todo o Maranhão', p: 'São José de Ribamar é padroeiro do município e também do estado. O dia 19 de março é feriado municipal e foi reconhecido por decreto estadual de 2017.' },
  { t: 'A grande caminhada nasceu em 2001', p: 'Quando as imagens foram levadas a São Luís para restauração, em 2001, a comunidade fez a primeira grande romaria de acompanhamento. O percurso virou o “Caminho de São José de Ribamar”.' },
  { t: 'Uma festa de fé sobre duas rodas', p: 'A procissão de motociclistas surgiu da devoção de um motociclista que recebeu uma graça após um acidente na estrada do Araçagi. Hoje é um dos pontos altos do festejo.' },
  { t: 'Cem anos de igreja, séculos de devoção', p: 'A igreja-santuário completou 100 anos em 2015 — mas, segundo relatos, a devoção às imagens é anterior à própria igreja.' },
  { t: 'Uma cidade que nasceu aldeia', p: 'Antes de Ribamar havia uma aldeia dos índios gamelas, em terras da Companhia de Jesus. A liberdade dos indígenas foi restituída por alvará de 1755.' }
];

/* ---------- linha do tempo (cat: fe | territorio | cultura) ---------- */
const history = [
  { id: 'h1618', year: '1618', cat: 'fe', title: 'As imagens da Sagrada Família',
    short: 'Primeiros padres encontram imagens já veneradas pelos indígenas.',
    body: ['Segundo o pesquisador Antônio Miranda, as homenagens a São José de Ribamar começaram ainda no século XVII.',
           'Por volta de 1618, os primeiros padres que chegaram ao lugar teriam encontrado imagens da Sagrada Família que já eram veneradas pelos indígenas que viviam ali.'],
    facts: [['Relato', 'Pesquisador Antônio Miranda'], ['Século', 'XVII']], src: 'O Imparcial' },
  { id: 'h1627', year: '1627', cat: 'territorio', title: 'Terras dos jesuítas',
    short: 'Sesmarias à Companhia de Jesus; aldeia dos gamelas.',
    body: ['Em 16 de dezembro de 1627, o governador Francisco Coelho de Carvalho concedeu datas e sesmarias aos religiosos da Companhia de Jesus.',
           'No local existia uma aldeia dos índios gamelas. Em 2015, uma exposição local chegou a celebrar “388 anos de fundação” da cidade, contando a partir dessa data.'],
    facts: [['Governador', 'Francisco Coelho de Carvalho'], ['Povo', 'Gamelas'], ['Ordem', 'Companhia de Jesus']], src: 'IBGE · O Imparcial' },
  { id: 'h1755', year: '1755–57', cat: 'territorio', title: 'Liberdade e “lugar”',
    short: 'Alvará devolve a liberdade aos indígenas; aldeia vira lugar.',
    body: ['Um alvará de 1755 restituiu a liberdade aos indígenas e destinou terras para a subsistência deles no local.',
           'Em 1757 a aldeia foi elevada à categoria de lugar — o início da vida política da localidade.'],
    facts: [['Alvará', '1755'], ['Elevação a lugar', '1757']], src: 'IBGE · Biblioteca' },
  { id: 'h1821', year: '1821', cat: 'fe', title: 'A primeira grande romaria',
    short: 'O primeiro registro de peregrinação em grande escala.',
    body: ['O primeiro registro de uma grande romaria a São José de Ribamar é de 1821.',
           'Desde então a peregrinação cresceu até se tornar o centro do festejo de setembro, hoje uma das maiores festas religiosas do estado.'],
    facts: [['Registro', '1821'], ['Hoje', 'Festejo em setembro']], src: 'O Imparcial' },
  { id: 'h1913', year: '1913', cat: 'territorio', title: 'Nasce o município de Ribamar',
    short: 'Elevada a município, com o nome de Ribamar.',
    body: ['Em 1913 a localidade passou à condição de município, com a denominação de Ribamar.',
           'O município foi extinto e restaurado outras vezes ao longo das décadas seguintes.'],
    facts: [['Nome', 'Ribamar'], ['Ano', '1913']], src: 'IBGE · Biblioteca' },
  { id: 'h1952', year: '1952', cat: 'territorio', title: 'Restauração definitiva',
    short: 'O município é restabelecido de vez.',
    body: ['Depois de idas e vindas administrativas, o município foi restabelecido definitivamente em 1952.'],
    facts: [['Ano', '1952']], src: 'IBGE · Biblioteca' },
  { id: 'h1969', year: '1969', cat: 'territorio', title: 'São José de Ribamar',
    short: 'O nome do padroeiro passa a compor o nome da cidade.',
    body: ['Em 1969 o município passou a se chamar São José de Ribamar, em homenagem ao padroeiro.',
           'A lenda local explica “Ribamar” por um navio português desviado por tempestade até a baía — mas isso é tradição oral, não fato documentado.'],
    facts: [['Nome atual', 'São José de Ribamar'], ['Padroeiro', 'São José']], src: 'IBGE · Biblioteca' },
  { id: 'h1998', year: '1998', cat: 'fe', title: 'O monumento de 33 metros',
    short: 'Inaugurada a escultura de São José, de Sinval Floriano Veloso.',
    body: ['O monumento a São José, com 33 metros de altura, foi inaugurado em 1998. A obra é do escultor Sinval Floriano Veloso.',
           'Foi revitalizado em 2025 e é um dos símbolos mais reconhecidos da cidade.'],
    facts: [['Altura', '33 m'], ['Autor', 'Sinval Floriano Veloso'], ['Revitalização', '2025']], src: 'O Imparcial' },
  { id: 'h2001', year: '2001', cat: 'fe', title: 'Nasce o “Caminho de São José”',
    short: 'Imagens vão à restauração e a comunidade as acompanha.',
    body: ['Em 2001 as imagens foram levadas a São Luís para restauração. A comunidade ribamarense, com romeiros e peregrinos, fez a primeira grande romaria de acompanhamento.',
           'Essa caminhada depois passou a se chamar “Caminho de São José de Ribamar”.'],
    facts: [['Percurso', 'Cohab → Santuário'], ['Hoje', 'Romaria anual']], src: 'O Imparcial' },
  { id: 'h2015', year: '2015', cat: 'fe', title: 'Centenário do santuário',
    short: 'A igreja-santuário completa 100 anos de edificação.',
    body: ['A atual igreja-santuário completou 100 anos de construção em 2015 e o festejo daquele ano celebrou o centenário.',
           'O complexo do santuário inclui, além da igreja, um museu de ex-votos — as oferendas deixadas por devotos como agradecimento.'],
    facts: [['Edificação', '1915'], ['Complexo', 'Igreja + Museu de ex-votos']], src: 'O Imparcial · UnB (Museologia)' },
  { id: 'h2024', year: '2024', cat: 'cultura', title: 'Patrimônio Imaterial',
    short: 'O festejo é reconhecido como Patrimônio Cultural Imaterial do Maranhão.',
    body: ['Em 2024 o festejo de São José de Ribamar foi reconhecido como Patrimônio Cultural Imaterial do Maranhão.',
           'O reconhecimento valoriza as romarias, as procissões e as práticas de devoção que se repetem todos os anos.'],
    facts: [['Reconhecimento', 'Patrimônio Imaterial do MA'], ['Ano', '2024']], src: 'O Imparcial' }
];

/* ---------- lugares (cat: fe | praia | cultura) ---------- */
const places = [
  { id: 'santuario', cat: 'fe', icon: 'church', slot: 'manhã', tags: ['fé', 'história'], name: 'Santuário de São José de Ribamar',
    short: 'A igreja azul e coral onde a peregrinação termina.',
    body: ['A igreja-santuário é o coração da devoção ao padroeiro. Completou 100 anos de edificação em 2015.',
           'No complexo há ainda um museu de ex-votos, com as oferendas deixadas por devotos que atribuem graças alcançadas ao santo.'],
    facts: [['Tipo', 'Igreja-santuário'], ['Centenário', '2015'], ['Destaque', 'Museu de ex-votos']],
    tip: 'No mês do festejo (setembro) a região fica muito movimentada — chegue cedo.' },
  { id: 'casa-milagres', cat: 'fe', icon: 'church', slot: 'manhã', tags: ['fé', 'história'], name: 'Casa dos Milagres',
    short: 'Onde ficam as oferendas de quem agradece uma graça alcançada.',
    body: ['A Casa dos Milagres faz parte do complexo do Santuário, perto da orla, junto da igreja matriz, do centro pastoral e do salão paroquial.',
           'É o espaço ligado aos ex-votos: objetos deixados por devotos em agradecimento a graças que atribuem a São José de Ribamar.'],
    facts: [['Tipo', 'Casa de ex-votos'], ['Onde', 'Complexo do Santuário'], ['Tema', 'Fé e gratidão']],
    tip: 'Não encontrei horário de visita em fonte oficial: pergunte no Santuário antes de ir.', src: 'O Imparcial' },
  { id: 'monumento', cat: 'fe', icon: 'statue', slot: 'tarde', tags: ['fé', 'fotografia'], name: 'Monumento a São José',
    short: 'Trinta e três metros de escultura com o menino Jesus.',
    body: ['Inaugurado em 1998, o monumento é obra de Sinval Floriano Veloso e foi revitalizado em 2025.',
           'A imagem de São José, com o menino ao lado, tornou-se um dos cartões-postais da cidade.'],
    facts: [['Altura', '33 m'], ['Inauguração', '1998'], ['Autor', 'Sinval Floriano Veloso']],
    tip: 'A luz do fim da tarde valoriza a pedra clara — ótima para fotografar.' },
  { id: 'cais', cat: 'cultura', icon: 'boat', slot: 'tarde', tags: ['história', 'mar'], name: 'Praça do Cais de Ribamar',
    short: 'O ponto de memória de uma cidade que nasceu voltada para a baía.',
    body: ['Citada em guias de turismo entre as atrações do centro, a Praça do Cais remete à relação histórica da cidade com o mar.',
           'É um bom ponto de partida para quem quer sentir o ritmo do centro e da orla antes de seguir para outros lugares.'],
    facts: [['Tema', 'Memória e orla']],
    tip: 'Informações de funcionamento mudam — consulte a Secretaria de Turismo antes de ir.' },
  { id: 'ribamar', cat: 'praia', icon: 'wave', slot: 'tarde', tags: ['praia', 'mar'], name: 'Praia de Ribamar',
    short: 'A orla da sede, para ver a baía de perto.',
    body: ['A praia da cidade é citada em guias como espaço para descansar à beira-mar.',
           'Um guia francês de viagem alerta para as marés fortes da região — vale observar as condições antes de entrar na água.'],
    facts: [['Atenção', 'Marés fortes']],
    tip: 'Pergunte aos moradores sobre a maré do dia antes de entrar na água.' },
  { id: 'meio', cat: 'praia', icon: 'wave', slot: 'manhã', tags: ['praia', 'natureza'], name: 'Praia do Meio',
    short: 'Infraestrutura e paisagem natural, a cerca de 30–40 km de São Luís.',
    body: ['Uma das paradas mais procuradas por quem sai da capital, combina infraestrutura com paisagem natural preservada, segundo guias da região.'],
    facts: [['Distância de São Luís', '≈ 30–40 km'], ['Perfil', 'Estrutura + natureza']],
    tip: 'Leve protetor solar e água; confira horários dos quiosques.' },
  { id: 'panaquatira', cat: 'praia', icon: 'fish', slot: 'manhã', tags: ['praia', 'gastronomia', 'natureza'], name: 'Praia de Panaquatira',
    short: 'Quase 5 km de mar calmo e raso na maré baixa.',
    body: ['A cerca de 40 km de São Luís, Panaquatira é uma das praias mais citadas da região, com bares à beira-mar que servem pratos locais — especialmente o peixe pedra.',
           'Em avaliações de usuários ela aparece entre as praias mais limpas da ilha.'],
    facts: [['Distância de São Luís', '≈ 40 km'], ['Extensão de mar calmo', '≈ 5 km (maré baixa)'], ['Prato citado', 'Peixe pedra']],
    tip: 'Respeite as orientações de maré e de segurança — já houve ocorrências de afogamento.' },
  { id: 'portos', cat: 'cultura', icon: 'boat', slot: 'manhã', tags: ['mar', 'cultura', 'gastronomia'], name: 'Portos de pesca (Vieira, Barbosa, Campina)',
    short: 'Onde a pesca artesanal ainda marca o ritmo das marés.',
    body: ['A pesca artesanal é atividade cotidiana em Ribamar. Os portos do Vieira, do Barbosa e da Campina são parte dessa paisagem.',
           'Estudos da UFMA mostram pescadores que seguem o ritmo das marés e fabricam os próprios apetrechos, saberes passados entre gerações. Os portos do Vieira e do Barbosa também fazem parte do percurso da romaria marítima.'],
    facts: [['Atividade', 'Pesca artesanal'], ['Portos', 'Campina, Barbosa, Vieira']],
    tip: 'Chegue cedo: é de manhã que o movimento do pescado costuma ser mais intenso.' }
];

/* ---------- festejo ---------- */
const festejo = {
  year: 2026,
  theme: 'Santuário: Casa da Paz, Morada da Caridade',
  month: 'Setembro',
  startsOn: 2, // setembro de 2026 começa numa terça
  days: 30,
  span: [1, 27],
  events: [
    { id: 'alvorada', day: 1, name: 'Romaria da Alvorada', time: 'Abertura · 5h',
      desc: 'A abertura do festejo, ao amanhecer: concentração na Paróquia Sagrado Coração de Jesus, no Moropóia, com bênção de envio.',
      stops: ['Paróquia Sagrado Coração de Jesus (Moropóia)', 'Bênção de envio'] },
    { id: 'caminho', day: 19, name: 'Caminho de São José de Ribamar', time: 'Dia do padroeiro · 19h30',
      desc: 'A grande romaria, que nasceu do acompanhamento das imagens em 2001, sai da Cohab em direção ao Santuário na noite do dia do padroeiro. No Santuário, as missas do dia 19 são às 6h, 8h30, 11h, 15h, 17h, 19h30, 22h e à meia-noite.',
      stops: ['Cohab', 'Santuário'] },
    { id: 'encerramento', day: 27, name: 'Encerramento do festejo', time: 'Procissão · 16h30',
      desc: 'Missas às 6h, 8h30, 11h, 13h e 15h. Às 16h30, a procissão de encerramento, seguida de bênção de envio; às 18h30, a missa solene; às 20h30, o show de encerramento.',
      stops: ['Procissão (16h30)', 'Bênção de envio', 'Missa solene (18h30)', 'Show de encerramento (20h30)'] }
  ],
  note: 'Novenário de 18 a 26, com missas diárias. De 1º a 17: segunda a sábado às 11h, 15h, 17h e 19h; domingos às 6h, 8h30, 11h, 15h, 17h e 19h. Programação do Imirante; confirme com o Santuário.'
};

/* ---------- cultura viva ---------- */
const culture = [
  { id: 'boi', icon: 'drum', ac: '#ff8a6b', name: 'Boi de Ribamar', kicker: 'Bumba-meu-boi · sotaque de matraca',
    short: 'Cinco décadas de matracas.',
    body: ['Fundado em 1976, o Boi de Ribamar é do sotaque de matraca, e completou 50 anos em 2026. A matraca — par de madeiras batidas uma na outra — é o instrumento principal.',
           'O grupo é ligado ao Colégio Dr. Paulo Ramos e mantém viva uma das tradições mais fortes do Maranhão.'],
    facts: [['Fundação', '1976'], ['Sotaque', 'Matraca'], ['Aniversário', '50 anos em 2026']], src: 'O Imparcial' },
  { id: 'lavabois', icon: 'wave', ac: '#5fd0ff', name: 'Lava-Bois', kicker: 'Festa junina · início de julho',
    short: 'O mergulho dos bois que encerra o ciclo junino.',
    body: ['O Lava-Bois reúne grupos de bumba-meu-boi e encerra as festividades juninas de São José de Ribamar, no início de julho.',
           'A tradição existe há mais de seis décadas — em 2019 a imprensa local falava em “66 anos de tradição”.'],
    facts: [['Quando', 'Início de julho'], ['Idade', '60+ anos'], ['Papel', 'Encerra o ciclo junino']], src: 'O Imparcial' },
  { id: 'pesca', icon: 'fish', ac: '#7fb1ff', name: 'Pesca artesanal', kicker: 'Saber das marés',
    short: 'Portos, redes e marés como calendário.',
    body: ['Para muitos pescadores, a pesca artesanal é a única fonte de sustento. Eles seguem o ritmo das marés e fabricam os próprios apetrechos, aprendidos com as gerações anteriores.',
           'Um estudo da UFMA também registra um desafio: muitos filhos e netos já não querem seguir a profissão.'],
    facts: [['Portos', 'Campina, Barbosa, Vieira'], ['Estudo', 'UFMA · 2022']], src: 'UFMA (revista Amazônica)' },
  { id: 'crioula', icon: 'drum', ac: '#ffc861', name: 'Tambor de crioula', kicker: 'Dança e percussão afro-maranhense',
    short: 'Parte da rotina cultural dos moradores.',
    body: ['Reportagens apontam o tambor de crioula como parte da rotina cultural da cidade, ao lado do bumba-meu-boi e das festas juninas.',
           'Não encontrei fontes sobre grupos específicos em Ribamar — vale perguntar à Secretaria de Cultura sobre apresentações.'],
    facts: [['Origem', 'Matriz afro-maranhense'], ['Em Ribamar', 'Presente na rotina cultural']], src: 'Correio Braziliense' },
  { id: 'culinaria', icon: 'fish', ac: '#ff6f5e', name: 'Sabores da baía', kicker: 'Culinária local',
    short: 'Peixe pedra, frutos do mar e a mesa de beira-mar.',
    body: ['A cidade valoriza a culinária típica, o artesanato e a música, segundo a imprensa nacional.',
           'Nos bares da Praia de Panaquatira, o prato mais citado pelos guias é o peixe pedra.'],
    facts: [['Prato citado', 'Peixe pedra'], ['Onde', 'Bares da Panaquatira']], src: 'Correio Braziliense · guias de viagem' }
];

/* ---------- quiz ---------- */
const quiz = [
  { q: 'Em que ano a aldeia dos gamelas recebeu sesmarias para a Companhia de Jesus?', o: ['1618', '1627', '1757', '1913'], a: 1, e: 'As terras foram concedidas em 16 de dezembro de 1627 pelo governador Francisco Coelho de Carvalho.' },
  { q: 'Qual é a altura do monumento a São José?', o: ['18 metros', '25 metros', '33 metros', '45 metros'], a: 2, e: 'O monumento, inaugurado em 1998, tem 33 metros de altura.' },
  { q: 'Em que ano o município passou a se chamar São José de Ribamar?', o: ['1913', '1952', '1969', '1998'], a: 2, e: 'Em 1969, em homenagem ao padroeiro.' },
  { q: 'Segundo a lenda, como o nome “Ribamar” surgiu?', o: ['Um navio desviado por uma tempestade', 'Um rio chamado Ribamar', 'Um capitão português', 'Uma aldeia dos tupinambás'], a: 0, e: 'A lenda fala de um navio de Lisboa a caminho de São Luís, desviado até a baía por uma tempestade.' },
  { q: 'Qual grupo indígena vivia na aldeia original?', o: ['Tupinambás', 'Gamelas', 'Guajajaras', 'Timbiras'], a: 1, e: 'A aldeia era dos índios gamelas, em terras da Companhia de Jesus.' },
  { q: 'Quando começou o “Caminho de São José de Ribamar”?', o: ['1821', '1976', '2001', '2015'], a: 2, e: 'Em 2001, quando as imagens foram levadas para restauração e a comunidade as acompanhou.' },
  { q: 'Qual instrumento marca o sotaque do Boi de Ribamar?', o: ['Zabumba', 'Pandeirão', 'Matraca', 'Maracá'], a: 2, e: 'O Boi de Ribamar é do sotaque de matraca, fundado em 1976.' },
  { q: 'Qual prato é mais citado pelos guias na Praia de Panaquatira?', o: ['Peixe pedra', 'Arroz de cuxá', 'Torta de camarão', 'Caldeirada'], a: 0, e: 'Os bares à beira-mar são conhecidos pelo peixe pedra.' }
];

const sources = [
  { name: 'IBGE — Cidades: São José de Ribamar', url: 'https://www.ibge.gov.br/cidades-e-estados/ma/sao-jose-de-ribamar.html' },
  { name: 'IBGE — Biblioteca: histórico do município', url: 'https://biblioteca.ibge.gov.br/visualizacao/dtb/maranhao/saojosedoribamar.pdf' },
  { name: 'O Imparcial — Devoção e fé a São José de Ribamar', url: 'https://oimparcial.com.br/entretenimento-e-cultura/2021/09/devocao-e-fe-a-sao-jose-de-ribamar/' },
  { name: 'Imirante — Festejo de São José de Ribamar 2026: programação', url: 'https://imirante.com/entretenimento/sao-jose-de-ribamar/2026/08/25/festejo-de-sao-jose-de-ribamar-veja-a-programacao-2026' },
  { name: 'O Imparcial — Festejo 2025', url: 'https://oimparcial.com.br/noticias/2025/08/festejo-de-sao-jose-de-ribamar-2025-celebra-o-padroeiro-do-maranhao-com-fe-tradicao-e-grandes-romarias/' },
  { name: 'O Imparcial — Boi de Ribamar celebra 50 anos', url: 'https://oimparcial.com.br/noticias/2026/03/cinco-decadas-de-matracas-boi-de-sao-jose-de-ribamar-celebra-50-anos/' },
  { name: 'O Imparcial — Lava-Bois', url: 'https://oimparcial.com.br/entretenimento-e-cultura/2019/07/lava-boi-encerra-festa-junina-em-ribamar/' },
  { name: 'Correio Braziliense — Tradição, turismo religioso e crescimento', url: 'https://www.correiobraziliense.com.br/cbradar/essa-cidade-maranhense-une-tradicao-turismo-religioso-e-crescimento-urbano/' },
  { name: 'UFMA — Pesca artesanal em Ribamar (Amazônica)', url: 'https://periodicos.ufpa.br/index.php/amazonica/article/download/12073/9424' }
];


/* ---------- como chegar ----------
   Os mapas usam buscas por nome (sem coordenadas inventadas). Distâncias vêm de guias e rotas
   rodoviárias; confirme no app de navegação antes de sair. */
const getting = {
  intro: 'Saindo de São Luís, a rota principal é a MA-201 (Estrada de Ribamar). Pelo trajeto que passa por Anil e Forquilha são cerca de 32 km — em linha reta, 28 km.',
  facts: [
    { k: 'Distância', v: '≈ 32 km', n: 'do centro de São Luís, pela MA-201' },
    { k: 'Em linha reta', v: '28 km', n: 'entre São Luís e São José de Ribamar' },
    { k: 'Eixo principal', v: 'MA-201', n: 'Estrada de Ribamar (a MA-204 liga bairros)' }
  ],
  tips: [
    'O trânsito costuma travar nos fins de semana ensolarados e no fim da tarde — saia cedo.',
    'De ônibus ou van, consulte a SMTT de São Luís e os aplicativos de transporte coletivo para horários e tarifas atuais.',
    'Para as praias, siga pela MA-201 e use o aplicativo de navegação a partir do centro de Ribamar.'
  ]
};

const routes = [
  { id: 'cidade', name: 'Visão geral da cidade', icon: 'map', q: 'São José de Ribamar, MA',
    line: 'Ponto de partida para planejar o dia.', dist: 'Centro de Ribamar' },
  { id: 'santuario', name: 'Santuário de São José de Ribamar', icon: 'church', q: 'Santuário de São José de Ribamar, Praça São José, São José de Ribamar, MA',
    line: 'Fica no Centro, na Praça São José.', dist: '≈ 32 km de São Luís',
    address: 'Praça São José, 239, Centro, São José de Ribamar – MA, 65110-000', plus: '689QCWQV+4R' },
  { id: 'casa-milagres', name: 'Casa dos Milagres', icon: 'church', q: 'Casa dos Milagres, São José de Ribamar, MA',
    line: 'No complexo do Santuário, perto da orla.', dist: 'Centro, junto ao Santuário' },
  { id: 'monumento', name: 'Monumento a São José', icon: 'statue', q: 'Monumento a São José de Ribamar, São José de Ribamar, MA',
    line: 'Escultura de 33 m, um dos cartões-postais da cidade.', dist: 'No município de Ribamar' },
  { id: 'cais', name: 'Praça do Cais de Ribamar', icon: 'boat', q: 'Praça do Cais, São José de Ribamar, MA',
    line: 'Memória da relação da cidade com a baía.', dist: 'Centro / orla' },
  { id: 'ribamar', name: 'Praia de Ribamar', icon: 'wave', q: 'Praia de Ribamar, São José de Ribamar, MA',
    line: 'Orla da sede; atenção às marés fortes.', dist: 'Centro / orla' },
  { id: 'meio', name: 'Praia do Meio', icon: 'wave', q: 'Praia do Meio, São José de Ribamar, MA',
    line: 'Estrutura e paisagem preservada.', dist: '≈ 30–40 km de São Luís' },
  { id: 'panaquatira', name: 'Praia de Panaquatira', icon: 'fish', q: 'Praia de Panaquatira, São José de Ribamar, MA',
    line: 'Cerca de 12 min de carro (≈ 10 km) a partir do centro de Ribamar, segundo plataforma de hospedagem.', dist: '≈ 40 km de São Luís' },
  { id: 'portos', name: 'Porto do Vieira (pesca)', icon: 'boat', q: 'Porto do Vieira, São José de Ribamar, MA',
    line: 'Um dos portos da pesca artesanal e da romaria marítima.', dist: 'Litoral de Ribamar' }
];

const nav = [
  ['numeros', 'Números'], ['historia', 'História'], ['lugares', 'Lugares'], ['mapa', 'Como chegar'], ['sabores', 'Sabores'], ['festejo', 'Festejo'], ['calendario', 'Calendário'],
  ['cultura', 'Cultura'], ['galeria', 'Galeria'], ['video', 'Vídeo'], ['roteiro', 'Roteiro'], ['quiz', 'Quiz']
];

module.exports = { getting, routes, accents, numbers, sabia, history, places, festejo, culture, quiz, sources, nav };
