import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readCsvFile(filename) {
  const filePath = path.join(__dirname, '..', 'src', 'data', filename);
  try {
    await fs.access(filePath);
    const csvData = await fs.readFile(filePath, 'utf8');
    const parsedData = parse(csvData, { columns: true, skip_empty_lines: true });
    console.log(`Datos leídos de ${filename}:`, parsedData.length, 'filas');
    console.log('Muestra de datos:', parsedData[0]);
    return parsedData;
  } catch (error) {
    console.error(`Error al leer el archivo ${filename}:`, error);
    return [];
  }
}

function parseResources(resourcesString) {
  if (!resourcesString || resourcesString.trim() === '') {
    return [];
  }
  try {
    return JSON.parse(resourcesString);
  } catch (error) {
    console.warn(`Error parsing resources: ${error.message}. Returning empty array.`);
    return [];
  }
}

export async function convertCsvToJson() {
  try {
    const mainData = await readCsvFile('roadmaps_main.csv');
    const contentData = await readCsvFile('roadmap_contents.csv');
    const faqData = await readCsvFile('roadmap_faqs.csv');

    console.log('Datos de FAQs:', faqData);

    const roadmaps = mainData.reduce((acc, record) => {
      let roadmap = acc.find(r => r.id === record.roadmap_id);
      if (!roadmap) {
        roadmap = {
          id: record.roadmap_id,
          title: record.roadmap_title,
          description: record.roadmap_description,
          mainTopics: [],
          faqs: []
        };
        acc.push(roadmap);
      }

      let topic = roadmap.mainTopics.find(t => t.id === record.topic_id);
      if (!topic) {
        topic = {
          id: record.topic_id,
          title: record.topic_title,
          content: []
        };
        roadmap.mainTopics.push(topic);
      }

      // Agregar contenidos
      const topicContents = contentData.filter(c => c.topic_id === record.topic_id);
      topic.content = topicContents.map(c => {
        console.log('Procesando contenido:', c);
        return {
          id: c.content_id,
          title: c.content_title,
          summary: c.summary,
          resources: parseResources(c.resources),
          apuntes_content: c.apuntes_content || '', // Nuevo campo
          class_content: c.class_content || ''      // Nuevo campo
        };
      });

      return acc;
    }, []);

    // Agregar FAQs a los roadmaps correspondientes
    faqData.forEach(faq => {
      console.log('Procesando FAQ:', faq);
      const roadmap = roadmaps.find(r => r.mainTopics.some(topic => topic.id === faq.topic_id));
      if (roadmap) {
        roadmap.faqs.push({
          question: faq.faq_question,
          answer: faq.faq_answer
        });
        console.log(`FAQ agregada al roadmap ${roadmap.id}`);
      } else {
        console.log(`No se encontró roadmap para FAQ con topic_id ${faq.topic_id}`);
      }
    });

    console.log('Roadmaps procesados:', roadmaps.map(r => ({id: r.id, faqCount: r.faqs.length})));

    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'roadmaps.json');
    await fs.writeFile(jsonPath, JSON.stringify(roadmaps, null, 2));

    console.log(`Conversión completada. El archivo JSON ha sido creado en: ${jsonPath}`);
  } catch (error) {
    console.error('Error durante la conversión:', error);
  }
}