/* Metadados de SEO e prévia social: fonte única para <head>, JSON-LD e validação. */

const TITLE = 'São José de Ribamar, MA — história, festejo, praias e sabores';
const SHORT_TITLE = 'São José de Ribamar — Fé, mar e história';
const DESCRIPTION = 'Conheça São José de Ribamar, no Maranhão: história da cidade, festejo do padroeiro, praias, sabores, calendário do ano, mapa de como chegar e galeria de fotos.';
const IMAGE_ALT = 'Monumento a São José e igreja-santuário de São José de Ribamar sobre o céu do amanhecer';

function buildSeo(siteUrl) {
  const url = siteUrl + '/';
  const image = siteUrl + '/img/og.jpg';

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': url + '#website',
        url,
        name: 'São José de Ribamar',
        alternateName: SHORT_TITLE,
        description: DESCRIPTION,
        inLanguage: 'pt-BR',
        publisher: { '@id': url + '#destino' }
      },
      {
        '@type': 'WebPage',
        '@id': url + '#pagina',
        url,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': url + '#website' },
        about: { '@id': url + '#destino' },
        primaryImageOfPage: { '@type': 'ImageObject', url: image, width: 1200, height: 630 }
      },
      {
        '@type': 'TouristDestination',
        '@id': url + '#destino',
        name: 'São José de Ribamar',
        description: 'Município do Maranhão, na ilha de São Luís, conhecido pelo santuário e pelo festejo do padroeiro, pelas praias e pela pesca artesanal.',
        url,
        image,
        touristType: ['Turismo religioso', 'Turismo de praia', 'Turismo cultural'],
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: 'Maranhão',
          containedInPlace: { '@type': 'Country', name: 'Brasil' }
        }
      }
    ]
  };

  return {
    title: TITLE,
    shortTitle: SHORT_TITLE,
    description: DESCRIPTION,
    url,
    image,
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: IMAGE_ALT,
    jsonld
  };
}

module.exports = { buildSeo, TITLE, DESCRIPTION };
