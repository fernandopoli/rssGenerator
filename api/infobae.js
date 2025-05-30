// api/infobae.js

const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');

module.exports = async (req, res) => {
  // Configuración inicial del feed RSS
  const feed = new RSS({
    title: 'Infobae',
    description: 'Últimas noticias de Infobae.com',
    feed_url: `${req.headers['x-forwarded-proto']}://${req.headers.host}/api/infobae`,
    image_url: 'https://www.infobae.com/pf/resources/favicon/android-chrome-512x512.png?d=3222',
    site_url: 'https://www.infobae.com/',
    language: 'es',
    pubDate: new Date(),
  });

  try {
    // Obtener el HTML de la página de últimas noticias de Infobae
    const { data } = await axios.get('https://www.infobae.com/');
    const $ = cheerio.load(data);

    // Extraer cada artículo de la lista de noticias
    $('.story-card-ctn').each((i, element) => {
      const title = $(element).find('.story-card-hl').text().trim();
      const url = `https://www.infobae.com${$(element).attr('href')}`;
      const image = $(element).find('img.story-card-img').attr('src');

      if (title && url) {
        feed.item({
          title,
          url,
          guid: url, // Usamos la URL como identificador único
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
    res.status(500).send(`Hubo un error al procesar la solicitud. ${error.message}`);
  }
};
