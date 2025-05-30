// api/infobae.js

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get('https://www.infobae.com/');
    const $ = cheerio.load(data);

    const noticias = [];
    
    $('.story-card-ctn').each((i, element) => {
      const title = $(element).find('.story-card-hl').text().trim().replace(/[“”"]/g, "'");
      const href = $(element).attr('href');
      const url = href && href.startsWith('http') ? href : `https://www.infobae.com${href}`;
      const image = $(element).find('img.story-card-img').attr('src');
      const iGuid = `noticia-${i + 1}`;
      const date = new Date(new Date().getTime() + i * 1000).toISOString();

      // Cuerpo del mensaje que Alexa leerá
      const mainText = `${title}. Puedes leer más en Infobae.com`;

      if (title && href) {
        noticias.push({
          uid: iGuid,
          updateDate: date,
          titleText: title,
          mainText,
          redirectionUrl: url,
          imageUrl: image
        });
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(noticias.slice(0, 10)); // Limitar a las 10 primeras noticias
  } catch (error) {
    console.error('Error al generar el JSON para Alexa:', error.message);
    res.status(500).send(`Error al procesar la solicitud: ${error.message}`);
  }
};
