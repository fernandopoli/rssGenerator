// api/rosario3.js

const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');

module.exports = async (req, res) => {
  // Configuración inicial del feed RSS
  const feed = new RSS({
    title: 'Rosario3',
    description: 'Últimas noticias de Rosario3.com',
    feed_url: `${req.headers['x-forwarded-proto']}://${req.headers.host}/api/rosario3`,
    image_url: 'https://www.rosario3.com/__export/1559748440188/sites/rosario3/arte/v2/favicon.ico',
    site_url: 'https://www.rosario3.com',
    language: 'es',
    pubDate: new Date(),
  });

  try {
    // Obtener el HTML de la página de últimas noticias de Rosario3
    const { data } = await axios.get('https://www.rosario3.com/seccion/ultimas-noticias/');
    const $ = cheerio.load(data);

    // Extraer cada artículo de la lista de noticias
    $('.entry-box article').each((i, element) => {
      const title = $(element).find('.title').text().trim();
      const url = `https://www.rosario3.com${$(element).find('a.cover-link').attr('href')}`;
      const image = $(element).find('img').attr('src');
      const date = new Date();
      const iGuid = `noticia-${i + 1}`; 

      if (title && url) {
        feed.item({
          title,
          url,
          guid: iGuid,
          date,
          image: image,
        });
      }
    });

    // Configurar la respuesta como XML
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(feed.xml());
  } catch (error) {
    console.error('Error al generar el feed RSS:', error);
    res.status(500).send(`Hubo un error al procesar la solicitud. ${error}`);
  }
};
