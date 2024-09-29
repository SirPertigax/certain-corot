// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conectar a MongoDB (asegúrate de tener MongoDB instalado y corriendo)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Definir un modelo para las cajas del roadmap
const BoxSchema = new mongoose.Schema({
  title: String,
  summary: String,
  resources: [{ title: String, url: String }],
  roadmapId: String
});

const Box = mongoose.model('Box', BoxSchema);

// Rutas API
app.post('/api/updateBox', async (req, res) => {
  try {
    const { id, title, summary, resources } = req.body;
    const updatedBox = await Box.findByIdAndUpdate(id, { title, summary, resources }, { new: true });
    res.json({ success: true, box: updatedBox });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/addBox', async (req, res) => {
  try {
    const { title, summary, resources, roadmapId } = req.body;
    const newBox = new Box({ title, summary, resources, roadmapId });
    await newBox.save();
    res.json({ success: true, box: newBox });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Más rutas para obtener y eliminar cajas...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));