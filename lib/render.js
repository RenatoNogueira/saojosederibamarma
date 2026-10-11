const path = require('path');
const ejs = require('ejs');
const data = Object.assign({}, require('../data/site'), require('../data/extra'));
const { loadPhotos, CATS } = require('./photos');

/* ícones de traço (viewBox 24) usados nos cards */
const ICONS = {
  church: 'M12 2v4M10 4h4M7 21V11l5-4 5 4v10M3 21h18M10 21v-5h4v5',
  statue: 'M12 3a2 2 0 100 4 2 2 0 000-4zM8 21v-8l4-2 4 2v8M5 21h14',
  wave: 'M2 11c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5-1M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5-1',
  boat: 'M3 15h18l-2 5H5zM12 3v12M12 4l6 8h-6M12 6L7 12h5',
  fish: 'M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2zM8 11.5h.01',
  drum: 'M5 9c0-2 3-3 7-3s7 1 7 3v6c0 2-3 3-7 3s-7-1-7-3zM5 9c0 2 3 3 7 3s7-1 7-3M9 18v3M15 18v3',
  people: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a2.5 2.5 0 100-5M17 15c2.5 0 4 1.7 4 4',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  dens: 'M4 20V10M9 20V4M14 20v-8M19 20V8',
  up: 'M12 20V5M6 11l6-6 6 6',
  coin: 'M12 21a9 9 0 100-18 9 9 0 000 18zM14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.500M12 6v2M12 16v2',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.500l1.2-6L3.300 9.300l6.100-.7z',
  lantern: 'M9 3h6M8 6h8l1 10a5 5 0 01-10 0zM12 21v-1',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 017-2.500A4 4 0 0119 10c0 5.500-7 10-7 10z',
  pin: 'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z',
  close: 'M6 6l12 12M18 6L6 18',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  sunset: 'M17 18a5 5 0 00-10 0M12 9V3M5.2 11.2l1.4 1.4M18.8 11.2l-1.4 1.4M2 18h20M9 6l3-3 3 3',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  share: 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13',
  zoom: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3M11 8v6M8 11h6',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  image: 'M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 16l-5-5-8 8',
  bed: 'M3 19v-9a2 2 0 012-2h14a2 2 0 012 2v9M3 15h18M3 21v-2M21 21v-2M7 8V6h5v2',
  fork: 'M7 3v7a2 2 0 004 0V3M9 12v9M17 21V3c-2.200 1.500-3 4.500-3 8h3',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2'
};
const icon = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ICONS.star}"/></svg>`;

const fmt = n => n.toLocaleString('pt-BR');

function pageData() {
  return Object.assign({}, data, { icon, fmt, photos: loadPhotos(), catLabels: CATS });
}

/* dados enviados ao navegador (hero, modais, quiz, roteiro) */
function clientData() {
  const { history, places, culture, quiz, festejo, accents, routes, dishes, stays, events, eatAreas } = data;
  return {
    history, places, culture, quiz, festejo, accents, routes, dishes, stays, events, eatAreas, photos: loadPhotos(), catLabels: CATS,
    icons: ICONS
  };
}

function render() {
  const file = path.join(__dirname, '..', 'views', 'index.ejs');
  return ejs.renderFile(file, Object.assign(pageData(), { clientData: clientData() }), { views: [path.join(__dirname, '..', 'views')] });
}

module.exports = { render };
