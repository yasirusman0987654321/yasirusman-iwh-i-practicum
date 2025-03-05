const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.HUBSPOT_API_KEY;
const CUSTOM_OBJECT_ID = process.env.CUSTOM_OBJECT_ID;

if (!PRIVATE_APP_ACCESS) {
  console.error("Error: HubSpot API key not found in .env file.");
  process.exit(1);
}

if (!CUSTOM_OBJECT_ID) {
  console.error("Error: Custom Object ID not found in .env file.");
  process.exit(1);
}

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.render('homepage', { title: 'Projects | HubSpot APIs', data: response.data.results });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send('Error fetching projects.');
  }
});

app.get('/update-cobj', (req, res) => {
  res.render('update-cobj', { title: 'Add Project | HubSpot APIs' });
});

app.post('/update-cobj', async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const properties = {
      project_name: req.body.project_name,
      hs_object_source_detail_2: req.body.hs_object_source_detail_2,
      hs_object_source_detail_3: req.body.hs_object_source_detail_3,
    };

    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}`,
      { properties },
      {
        headers: {
          Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("HubSpot API Response:", response.data);

    res.redirect('/');
  } catch (error) {
    console.error('Axios Error:', error.response ? error.response.data : error.message);
    res.status(500).send('Error creating project. Error creating project.');
  }
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
