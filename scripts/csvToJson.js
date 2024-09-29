import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const csvPath = path.join(projectRoot, 'src', 'data', 'roadmaps.csv');
const jsonPath = path.join(projectRoot, 'src', 'data', 'roadmaps.json');

async function convertCsvToJson() {
  try {
    // Verificar si el archivo CSV existe
    try {
      await fs.access(csvPath);
    } catch (error) {
      console.error(`El archivo CSV no existe en la ruta: ${csvPath}`);
      console.error('Asegúrate de que el archivo está en la ubicación correcta.');
      return;
    }

    // Leer el archivo CSV
    const csvData = await fs.readFile(csvPath, 'utf8');

    // Parsear el CSV
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    // Convertir los registros a la estructura deseada
    const roadmaps = records.reduce((acc, record) => {
      let roadmap = acc.find(r => r.id === record.roadmap_id);
      if (!roadmap) {
        roadmap = {
          id: record.roadmap_id,
          title: record.roadmap_title,
          mainTopics: []
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

      topic.content.push({
        id: record.content_id,
        title: record.content_title,
        summary: record.summary,
        resources: JSON.parse(record.resources)
      });

      return acc;
    }, []);

    // Guardar el resultado como JSON
    await fs.writeFile(jsonPath, JSON.stringify(roadmaps, null, 2));

    console.log(`Conversión completada. El archivo JSON ha sido creado en: ${jsonPath}`);
  } catch (error) {
    console.error('Error durante la conversión:', error);
  }
}

convertCsvToJson();