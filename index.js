require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Habilitar CORS
app.use(cors());

// Configuración de variables de entorno
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Conexión a MongoDB Atlas exitosa');
  })
  .catch(error => {
    console.error('Error al conectar a MongoDB Atlas:', error);
  });

// Definición del esquema de incidencia
const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
});

// Crear el modelo de incidencia
const Issue = mongoose.model('Issue', issueSchema);

// Ruta para obtener todas las incidencias
app.get('/api/issues', (req, res) => {
  Issue.find()
    .then(issues => {
      res.json(issues);
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al obtener las incidencias' });
    });
});

// Ruta para obtener una incidencia por su ID
app.get('/api/issues/:id', (req, res) => {
  const id = req.params.id;
  Issue.findById(id)
    .then(issue => {
      if (issue) {
        res.json(issue);
      } else {
        res.status(404).json({ error: 'Incidencia no encontrada' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al obtener la incidencia' });
    });
});

// Ruta para crear una nueva incidencia
app.post('/api/issues', (req, res) => {
  const { title, description } = req.body;
  const newIssue = new Issue({ title, description });
  newIssue.save()
    .then(savedIssue => {
      res.status(201).json(savedIssue);
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al crear la incidencia' });
    });
});

// Ruta para actualizar una incidencia existente
app.put('/api/issues/:id', (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;
  Issue.findByIdAndUpdate(id, { title, description }, { new: true })
    .then(updatedIssue => {
      if (updatedIssue) {
        res.json(updatedIssue);
      } else {
        res.status(404).json({ error: 'Incidencia no encontrada' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al actualizar la incidencia' });
    });
});

// Ruta para eliminar una incidencia
app.delete('/api/issues/:id', (req, res) => {
  const id = req.params.id;
  Issue.findByIdAndRemove(id)
    .then(deletedIssue => {
      if (deletedIssue) {
        res.json(deletedIssue);
      } else {
        res.status(404).json({ error: 'Incidencia no encontrada' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Error al eliminar la incidencia' });
    });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
