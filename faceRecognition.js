const axios = require('axios');
const fs = require('fs');

const subscriptionKey = 'YOUR_SUBSCRIPTION_KEY';
const largePersonGroupId = 'YOUR_LARGE_PERSON_GROUP_ID';
const personId = 'PERSON_ID';

// Функція для відправки POST-запитів до Cognitive Services
async function sendPostRequest(url, data) {
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data.error.message);
    return null;
  }
}

// Зчитуємо зображення з файлу
const imageFilePath = 'path/to/your/image.jpg';
const imageData = fs.readFileSync(imageFilePath).toString('base64');

// Крок 1: Виклик Detect API
async function detectFace() {
  const url = 'https://westus.api.cognitive.microsoft.com/face/v1.0/detect';
  const data = {
    url: 'URL_TO_YOUR_IMAGE',
  };
  const result = await sendPostRequest(url, data);
  console.log('Detected face:', result);
}

// Крок 2: Створення LargePersonGroup
async function createLargePersonGroup() {
  const url = `https://westus.api.cognitive.microsoft.com/face/v1.0/largepersongroups/${largePersonGroupId}`;
  const data = {
    name: 'large-person-group-name',
    userData: 'User-provided data attached to the large person group.',
    recognitionModel: 'recognition_03',
  };
  const result = await sendPostRequest(url, data);
  console.log('LargePersonGroup created:', result);
}

// Крок 3: Створення об'єкта Person
async function createPerson() {
  const url = `https://westus.api.cognitive.microsoft.com/face/v1.0/largepersongroups/${largePersonGroupId}/persons`;
  const data = {
    name: 'Family1-Dad',
    userData: 'User-provided data attached to the person.',
  };
  const result = await sendPostRequest(url, data);
  console.log('Person created:', result);
}

// Крок 4: Додавання обличчя до об'єкта Person
async function addFaceToPerson() {
  const url = `https://westus.api.cognitive.microsoft.com/face/v1.0/largepersongroups/${largePersonGroupId}/persons/${personId}/persistedfaces`;
  const data = {
    url: 'URL_TO_YOUR_IMAGE',
  };
  const result = await sendPostRequest(url, data);
  console.log('Face added to person:', result);
}

// Виклик функцій
detectFace();
createLargePersonGroup();
createPerson();
addFaceToPerson();
