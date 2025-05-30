// api/rosario3.js

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    // Obtener el HTML de la página de últimas noticias de Rosario3
    const { data } = await axios.get('https://www.rosario3.com/seccion/ultimas-noticias/');
    const $ = cheerio.load(data);

    const noticias = [];

    // Extraer cada artículo de la lista de noticias
    $('.entry-box article').each((i, element) => {
      const title = $(element).find('.title').text().trim();
      const relativeUrl = $(element).find('a.cover-link').attr('href');
      const iGuid = `noticia-${i + 1}`;
      const date = new Date().toISOString();

      if (title && relativeUrl) {
        noticias.push({
          uid: iGuid,
          updateDate: date,
          titleText: title,
          redirectionUrl: url,
        });
      }
    });

    // Configurar la respuesta como JSON para Alexa
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(noticias.slice(0, 5)); // Limita a 5 noticias para evitar excesos
  } catch (error) {
    console.error('Error al generar el JSON para Alexa:', error);
    res.status(500).send(`Error al procesar la solicitud: ${error.message}`);
  }
};
