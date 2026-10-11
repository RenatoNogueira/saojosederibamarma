/* Sabores, onde comer, onde ficar e calendário do ano.
   Fontes: O Imparcial (2018–2026), blog Diário de Aventuras Gastronômicas (2011), Wanderlog (notas do Google),
   Restaurant Guru, Tripadvisor, Booking, Hotel In Site, Trivago, Prefeitura/FAMEM, Secretaria de Cultura do MA,
   IBGE, Wikipédia. Preços, horários e notas mudam: confirme antes de ir. */

/* ---------- pratos e sabores ---------- */
const dishes = [
  { id: 'peixe-pedra', icon: 'fish', ac: '#ffc861', name: 'Peixe à pedra', kicker: 'Prato da casa · Ribamar',
    short: 'O prato mais associado à cidade: crocante por fora, macio por dentro.',
    body: ['É o prato mais lembrado quando se fala em comer em São José de Ribamar. Aparece nos bares da Praia de Panaquatira, na orla do Araçagi e no centro.',
           'Um relato de 2011, feito num restaurante simples sobre o cais, descreve o peixe crocante por fora e macio e suculento por dentro, servido com limão, vinagrete e cerveja bem gelada.'],
    facts: [['Onde', 'Cais, Panaquatira, Araçagi'], ['Acompanha', 'Limão e vinagrete'], ['Textura', 'Crocante por fora']],
    tip: 'Pergunte qual é o peixe do dia: guias também recomendam a pescada.', src: 'Diário de Aventuras Gastronômicas (2011) · O Imparcial' },
  { id: 'caranguejada', icon: 'fish', ac: '#ff8a6b', name: 'Caranguejada', kicker: 'Frutos do mar',
    short: 'Caranguejos inteiros cozidos em caldo temperado.',
    body: ['Na culinária maranhense, a caranguejada leva caranguejos inteiros cozidos em caldo temperado, que pode ter leite de coco, óleo de babaçu ou camarão.',
           'Em Ribamar, ela aparece entre os destaques do Ponto X, na Av. Atlântica, no Araçagy, que também é conhecido pelos frutos do mar.'],
    facts: [['Onde', 'Araçagy (Av. Atlântica)'], ['Base', 'Caranguejo inteiro'], ['Caldo', 'Leite de coco ou babaçu']],
    tip: 'Prato para comer com calma: reserve tempo e, se puder, vá em grupo.', src: 'O Imparcial · Wanderlog' },
  { id: 'camarao-arroz-toucinho', icon: 'fish', ac: '#ff6f5e', name: 'Camarão com arroz de toucinho', kicker: 'Beira-mar',
    short: 'Combinação citada por frequentadores do Araçagy.',
    body: ['O camarão com arroz de toucinho aparece nas avaliações do Atlântico Restaurante Bar, na Av. Atlântica, e o arroz de toucinho é lembrado também no Restaurante Mirante.',
           'São restaurantes de frente para o mar, com mesas voltadas para a baía.'],
    facts: [['Onde', 'Atlântico e Mirante, no Araçagy']], tip: '', src: 'Wanderlog · Tripadvisor' },
  { id: 'torta-de-camarao', icon: 'fish', ac: '#ffd27a', name: 'Torta de camarão', kicker: 'Clássico maranhense',
    short: 'Massa de ovos batidos, sem farinha, recheada de camarão.',
    body: ['A torta maranhense tem massa de ovos batidos e não leva farinha. O recheio mais comum é o camarão; também há versões de caranguejo, quase sempre acompanhadas de arroz de cuxá.',
           'Em Panaquatira, a torta de camarão é citada no Restaurante e Café da Dona, na Av. Panaquatira.'],
    facts: [['Massa', 'Ovos batidos'], ['Recheio', 'Camarão ou caranguejo'], ['Onde', 'Café da Dona (Panaquatira)']],
    tip: '', src: 'O Imparcial · Wanderlog' },
  { id: 'arroz-de-cuxa', icon: 'drum', ac: '#7fb1ff', name: 'Arroz de cuxá', kicker: 'Clássico maranhense',
    short: 'Vinagreira, camarão seco e gergelim: sabor que é a cara do Maranhão.',
    body: ['Não é exclusivo de Ribamar, mas faz parte da mesa de todo o estado. A base é a vinagreira, também chamada de caruru-azedo, com camarão seco e gergelim.',
           'Historicamente era vendido em tabuleiros nas ruas de São Luís, como acompanhamento de peixe frito e de tortas.'],
    facts: [['Base', 'Vinagreira'], ['Leva', 'Camarão seco e gergelim'], ['Vai bem com', 'Peixe frito e tortas']],
    tip: 'A proporção importa: com vinagreira demais, o prato fica amargo.', src: 'O Imparcial · Tudo Gostoso' },
  { id: 'peixada', icon: 'fish', ac: '#5fd0ff', name: 'Peixada e caldeirada', kicker: 'Comida de panela',
    short: 'Cozidos de peixe, com pescada e caldo encorpado.',
    body: ['A peixada está no cardápio do Bar e Restaurante do Bena, na Praia de Panaquatira, e a Casa da Peixada é lembrada perto da igreja matriz.',
           'No Sabor do Nordeste, a caldeirada de pescada é um dos destaques, junto com o peixe na pedra e a galinhada de galinha caipira.'],
    facts: [['Onde', 'Panaquatira, centro e Outeiro'], ['Peixe', 'Pescada, entre outros']], tip: '', src: 'O Imparcial · Wanderlog' },
  { id: 'galinha-caipira', icon: 'drum', ac: '#ffb347', name: 'Galinha caipira e mocotó', kicker: 'Mesa de terra',
    short: 'Quando o dia pede panela de terra em vez de mar.',
    body: ['O Restaurante Recanto do Cabral, no Araçagi, é lembrado pela carne de sol, pela galinha caipira e por pratos maranhenses.',
           'O Praia’s Grill, na MA-203, é conhecido pelo frango assado e pelo mocotó; o Sabor do Nordeste também serve galinhada de galinha caipira.'],
    facts: [['Onde', 'Araçagi e Outeiro'], ['Pratos', 'Carne de sol, mocotó, galinhada']], tip: '', src: 'Wanderlog · O Imparcial' },
  { id: 'jucara', icon: 'star', ac: '#c78bff', name: 'Juçara com camarão seco', kicker: 'Sabor do Maranhão',
    short: 'Parecida com o açaí, mas servida do jeito maranhense.',
    body: ['A juçara costuma ser comparada ao açaí, mas são frutas diferentes. No Maranhão, a forma tradicional é com camarão seco e farinha d’água.',
           'É um dos sabores mais característicos da região, embora nem sempre apareça nos cardápios de beira-mar.'],
    facts: [['Acompanha', 'Camarão seco e farinha d’água']], tip: '', src: 'O Imparcial' },
  { id: 'frutas-bebidas', icon: 'wave', ac: '#ff9a4d', name: 'Pitomba, bacuri e Guaraná Jesus', kicker: 'Frutas e bebidas',
    short: 'Frutas da terra e o refrigerante cor-de-rosa.',
    body: ['A pitomba tem sabor doce com leve toque ácido e, no Maranhão, é vendida em feiras e cultivada em pomares domésticos — como a que aparece na galeria.',
           'O suco de bacuri é recomendado no Sabor do Nordeste, e o Guaraná Jesus, o refrigerante cor-de-rosa, é ícone do estado.'],
    facts: [['Pitomba', 'Doce, com toque ácido'], ['Bebida', 'Suco de bacuri'], ['Ícone', 'Guaraná Jesus']],
    tip: 'Informações de safra e preço local da pitomba não foram encontradas: pergunte na feira.', src: 'O Imparcial' }
];

/* ---------- onde comer ---------- */
const eatAreas = [
  { id: 'panaquatira', name: 'Panaquatira', note: 'Bares de frente para o mar, ideais para almoço depois do banho.' },
  { id: 'aracagi', name: 'Araçagi e orla', note: 'A orla mais movimentada, com frutos do mar e vista para a baía.' },
  { id: 'centro', name: 'Centro', note: 'Perto do santuário e da praça, para quem vem pela fé.' },
  { id: 'outros', name: 'Outros bairros', note: 'Comida caseira e pratos de panela.' }
];
const eats = [
  { id: 'do-bena', name: 'Bar e Restaurante do Bena', area: 'panaquatira', where: 'Praia de Panaquatira', food: 'Peixada e comida de praia', rating: '4,1', n: 330, price: 'acessível' },
  { id: 'cafe-da-dona', name: 'Restaurante e Café da Dona', area: 'panaquatira', where: 'Av. Panaquatira, Sítio do Apicum', food: 'Pratos caseiros típicos e torta de camarão', rating: '4,4', n: 129, price: 'barato' },
  { id: 'bar-peixe-pedra', name: 'Bar Peixe Pedra', area: 'panaquatira', where: 'Av. Panaquatira', food: 'Peixe pedra', rating: '4,2', n: 87, price: '', src: 'Restaurant Guru' },
  { id: 'ponto-x', name: 'Ponto X Bar e Restaurante', area: 'aracagi', where: 'Av. Atlântica, Araçagy', food: 'Frutos do mar e caranguejada', rating: '4,3', n: 1111, price: '' },
  { id: 'mirante', name: 'Restaurante Mirante', area: 'aracagi', where: 'R. da Oleama, Araçagi', food: 'Frutos do mar e galinha caipira, com vista para o mar', rating: '4,4', n: 659, price: '' },
  { id: 'atlantico', name: 'Atlântico Restaurante Bar', area: 'aracagi', where: 'Av. Atlântica, Araçagy', food: 'Peixe à milanesa, caranguejo e camarão com arroz de toucinho', rating: '4,5', n: 150, price: '' },
  { id: 'recanto-cabral', name: 'Recanto do Cabral', area: 'aracagi', where: 'Av. São Paulo, Araçagi', food: 'Carne de sol, galinha caipira e pratos maranhenses', rating: '4,5', n: 543, price: 'acessível' },
  { id: 'praias-grill', name: 'Praia’s Grill', area: 'aracagi', where: 'Rod. MA-203, Araçagy', food: 'Frango assado e mocotó', rating: '4,5', n: 55, price: '' },
  { id: 'mar-e-sol', name: 'Restaurante Mar e Sol', area: 'centro', where: 'Av. Gonçalves Dias, Centro', food: 'Peixe à pedra, com vista para o mar', rating: '4,2', n: 773, price: '' },
  { id: 'bella-vista', name: 'Pizzaria Bella Vista', area: 'centro', where: 'Av. Gonçalves Dias, Centro', food: 'Pizzas, com pizza de camarão', rating: '4,4', n: 495, price: 'acessível' },
  { id: 'sabor-nordeste', name: 'Sabor do Nordeste', area: 'outros', where: 'Outeiro / Moropóia', food: 'Peixes, peixe na pedra, caldeirada de pescada e galinhada caipira', rating: '4,2', n: 184, price: '' }
];

/* ---------- onde ficar ---------- */
const stays = [
  { id: 'casa-praia-panaquatira', icon: 'bed', ac: '#5fd0ff', name: 'Casa de Praia Panaquatira', kicker: 'Casa de temporada · Panaquatira',
    short: 'Casa à beira-mar, com piscina e estacionamento.',
    body: ['Casa à beira-mar na região de Panaquatira, com piscina, estacionamento privativo e Wi-Fi gratuitos, segundo a Booking.',
           'As páginas de reserva divergem sobre o número de quartos (7 ou 9), então confirme antes de fechar.'],
    facts: [['Tipo', 'Casa de temporada'], ['Inclui', 'Piscina, estacionamento, Wi-Fi'], ['Atenção', 'Confirme o nº de quartos']],
    tip: 'Disponibilidade varia muito: consulte direto no site da Booking.', src: 'Booking · Hotéis Nordeste' },
  { id: 'verdes-mares', icon: 'bed', ac: '#7fb1ff', name: 'Verdes Mares Restaurante e Pousada', kicker: 'Pousada simples · Panaquatira',
    short: 'Pousada básica na Av. Otaviano Monteval.',
    body: ['Pousada simples com restaurante na Av. Otaviano Monteval, na Praia de Panaquatira, classificada como básica em portais de hospedagem.'],
    facts: [['Onde', 'Av. Otaviano Monteval'], ['Categoria', 'Básica']], tip: '', src: 'Hotel In Site' },
  { id: 'vila-do-mar', icon: 'bed', ac: '#ffc861', name: 'Pousada Vila do Mar', kicker: 'Pousada de conforto médio',
    short: 'Elogiada por limpeza, café da manhã e piscina.',
    body: ['Aparece como opção de categoria média/confortável. Um hóspede no Tripadvisor elogiou a casa e os quartos muito limpos, o café da manhã e a piscina, que quase sempre estava vazia.'],
    facts: [['Categoria', 'Média / confortável'], ['Destaques', 'Café, piscina, limpeza']], tip: '', src: 'Hotel In Site · Tripadvisor' },
  { id: 'ilha-costeira', icon: 'bed', ac: '#ff8a6b', name: 'Pousada Ilha Costeira', kicker: 'Pousada com spa',
    short: 'Citada com serviço de spa; diária na casa dos R$ 270.',
    body: ['Aparece em agregadores com serviços de spa. Em consulta ao Trivago, diárias na faixa de R$ 271.'],
    facts: [['Serviço', 'Spa'], ['Diária (referência)', '≈ R$ 270']], tip: 'Valores mudam com data e temporada.', src: 'Trivago' },
  { id: 'hoteis-cidade', icon: 'bed', ac: '#c78bff', name: 'Boulevard Park Hotel e Litoranea Praia Hotel', kicker: 'Hotéis bem avaliados',
    short: 'Duas opções mais bem avaliadas em agregadores.',
    body: ['Os dois aparecem entre as opções mais bem avaliadas da cidade em um agregador, com hóspedes elogiando quarto amplo, limpeza e café da manhã.'],
    facts: [['Elogios', 'Quarto amplo, limpeza, café']], tip: 'Confira a localização na reserva: as fontes não detalham.', src: 'Agregadores de hospedagem' }
];
const stayNote = {
  title: 'Dá para dormir em São Luís',
  text: 'A oferta dentro de Ribamar é pequena. Como a capital fica a cerca de 28 km (em linha reta) e tem mais de 70 hotéis e pousadas, muita gente se hospeda lá e vem de carro pela MA-201.'
};

/* ---------- calendário do ano ---------- */
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const events = [
  { id: 'carnaval', month: 2, year: '14/2', icon: 'drum', ac: '#ff8a6b', name: 'Carnaval e Banho de Cheiro', kicker: 'Fevereiro · data móvel',
    short: 'Abertura com ritual de matriz africana.',
    body: ['Em 2026, o carnaval da cidade começou em 14 de fevereiro com o Banho de Cheiro, ritual de matriz africana com cantos, defumação e distribuição de ervas aromáticas, no Circuito Alessandra Santos.',
           'A organização foi da Secretaria Municipal de Cultura, com a Secretaria de Assistência Social, Trabalho e Renda. Os feriados de carnaval de 2026 foram 16 e 17 de fevereiro.'],
    facts: [['Em 2026', '14 a 17 de fevereiro'], ['Local', 'Circuito Alessandra Santos'], ['Abertura', 'Banho de Cheiro']],
    tip: 'A data muda a cada ano, com o calendário de Páscoa.', src: 'FAMEM · Prefeitura' },
  { id: 'dia-sao-jose', month: 3, year: '19/3', icon: 'church', ac: '#ffc861', name: 'Dia de São José', kicker: '19 de março · feriado municipal',
    short: 'Missas, procissão e missa solene no santuário.',
    body: ['O dia do padroeiro é feriado municipal e foi reconhecido por decreto estadual em 2017. Antes dele há o novenário no Santuário.',
           'Em 2026, houve missas às 6h, 8h30, 11h, 13h e 15h; procissão às 16h pelas ruas da cidade com a imagem do santo; e missa solene de encerramento às 18h.'],
    facts: [['Data', '19 de março'], ['Procissão (2026)', '16h'], ['Missa solene (2026)', '18h']],
    tip: 'Programação e horários podem mudar: confira com o Santuário.', src: 'O Imparcial (2026)' },
  { id: 'semana-santa', month: 4, year: 'Abril', icon: 'church', ac: '#a9bdf0', name: 'Semana Santa', kicker: 'Abril · data móvel',
    short: 'Quinta e sexta-feira santas são feriados.',
    body: ['Em 2026, a Quinta-feira Santa foi 2 de abril e a Sexta-feira Santa, 3 de abril.',
           'Não encontrei a programação religiosa ou cultural da cidade para o período; a recomendação é consultar o Santuário.'],
    facts: [['Em 2026', '2 e 3 de abril']], tip: 'Procure o Santuário ou a paróquia para saber das celebrações.', src: 'Calendários de feriados' },
  { id: 'sao-joao', month: 6, year: '23–29/6', icon: 'drum', ac: '#ffb347', name: 'São João da Alegria', kicker: 'Junho · festa junina',
    short: 'Nove arraiais espalhados pela cidade, de graça.',
    body: ['O ciclo junino de 2026 foi anunciado com nove arraiais, programação diária a partir das 18h30 (com exceções) e entrada gratuita.',
           'Entre as atrações estavam bumba-meu-boi, quadrilhas juninas, danças portuguesas, cacuriá e tambor de crioula, além de bandas de forró, country e sertanejo.'],
    facts: [['Em 2026', '23 a 29 de junho'], ['Arraiais', 'Nove'], ['Entrada', 'Gratuita']],
    tip: 'Os locais e as atrações mudam a cada edição.', src: 'Blog Daniel Matos · Secretaria de Cultura do MA' },
  { id: 'lava-bois', month: 7, year: '5–6/7', icon: 'drum', ac: '#5fd0ff', name: 'Lava-Bois', kicker: 'Julho · fecha o ciclo junino',
    short: 'Encontro de bois que encerra a temporada de São João.',
    body: ['O Lava-Bois encerra oficialmente a temporada junina no estado. Segundo uma das versões, nasceu nos anos 1950, de um ritual de boieiros que foram à cidade pagar uma promessa a São João; o nome lembra o Lava-Pratos, que encerra o carnaval.',
           'Em 2025, foi nos dias 5 e 6 de julho. No sábado se apresentaram o Boi Valente da Ilha, o Boi de Itapari e o Boi Brilho da Lua; no domingo, treze bois, entre eles o Boi do Panaquatira e o Boi de Ribamar.'],
    facts: [['Em 2025', '5 e 6 de julho'], ['Origem', 'Anos 1950'], ['Idade', 'Cerca de 70 anos']],
    tip: 'Sobre horários e local exato, a matéria não informa: pergunte à Secretaria de Cultura.', src: 'O Imparcial (2025)' },
  { id: 'festejo', month: 9, year: 'Setembro', icon: 'lantern', ac: '#ffd27a', name: 'Festejo de São José de Ribamar', kicker: 'Setembro · o mês inteiro',
    short: 'Novenas, romarias e procissões durante todo setembro.',
    body: ['A festa ocupa o mês de setembro, com a data principal no segundo domingo. Há novenas e missas diárias, procissões marítimas, terrestres e ciclísticas, shows e fogos.',
           'Em 2025 foi de 1º a 28 de setembro, com a Romaria da Luz no dia 19, a grande romaria do Caminho no dia 20 e a romaria marítima no dia 27. Em 2024, foi reconhecida como Patrimônio Cultural Imaterial do Maranhão.'],
    facts: [['Data principal', '2º domingo'], ['Reconhecimento', 'Patrimônio Imaterial (2024)'], ['Romaria da Luz (2025)', '19 de setembro']],
    tip: 'Veja a seção “Festejo” para os percursos de cada romaria.', src: 'O Imparcial · Wikipédia' },
  { id: 'aniversario', month: 9, year: '24/9', icon: 'star', ac: '#e2503f', name: 'Aniversário do município', kicker: '24 de setembro · emancipação',
    short: 'Emancipação política em 1952, com shows e fogos.',
    body: ['O município foi restabelecido em 24 de setembro de 1952 pela Lei nº 758, data em que a prefeitura costuma promover as comemorações.',
           'Em 2022, a celebração dos 70 anos teve shows e fogos de artifício na Praça do Cruzeiro, na sede.'],
    facts: [['Data', '24 de setembro'], ['Marco', 'Lei nº 758 (1952)'], ['Em 2022', '70 anos']],
    tip: 'Não confunda com a fundação, ligada à concessão de terras de 1627.', src: 'IBGE · O Imparcial' },
  { id: 'fundacao', month: 12, year: 'Dezembro', icon: 'clock', ac: '#7fb1ff', name: 'Aniversário de fundação', kicker: 'Dezembro · memória',
    short: 'A contagem desde 1627, com exposição sobre a história.',
    body: ['A cidade conta a fundação a partir da concessão de terras aos jesuítas em 16 de dezembro de 1627. Em dezembro de 2015, celebrou 388 anos com uma exposição de 142 peças (fotografias e gravuras) montada pelo historiador Antônio Miranda.',
           'A matéria não informa o dia exato da comemoração, apenas que a mostra ficou aberta de 14 a 18 de dezembro.'],
    facts: [['Marco', '16 de dezembro de 1627'], ['Exposição (2015)', '142 peças'], ['Autor', 'Antônio Miranda']],
    tip: '', src: 'IBGE · O Imparcial (2015)' }
];
const seasons = {
  dry: { from: 8, to: 12, label: 'Tempo mais firme e ensolarado (ago–dez)', src: 'Guias de viagem' },
  tide: 'Consulte a tábua de marés: em Panaquatira são quase 5 km de mar calmo e raso na maré baixa.'
};

module.exports = { dishes, eatAreas, eats, stays, stayNote, months, events, seasons };
