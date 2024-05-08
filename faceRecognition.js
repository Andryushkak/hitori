const axios = require('axios');
const { BlobServiceClient } = require("@azure/storage-blob");

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

// Функція для завантаження зображення з Azure Blob Storage
async function downloadImageFromStorage(containerName, blobName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString('https://facestorag.blob.core.windows.net/face');
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  const downloadBlockBlobResponse = await blobClient.download();
  const downloadedImage = await streamToString(downloadBlockBlobResponse.readableStreamBody);
  return downloadedImage;
}

// Функція для зчитування потоку в рядок
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

// Функція для обробки зображення та додавання його до об'єкта Person
async function processImage(blobName, containerName) {
  const imageUrl = `https://${containerName}.blob.core.windows.net/${blobName}`;
  const url = `https://westus.api.cognitive.microsoft.com/face/v1.0/largepersongroups/${largePersonGroupId}/persons/${personId}/persistedfaces`;
  const imageData = await downloadImageFromStorage(containerName, blobName);
  const data = {
    url: `data:image/jpeg;base64,${imageData}`,
  };
  const result = await sendPostRequest(url, data);
  console.log('Face added to person:', result);
}

// Функція для обробки всіх зображень у контейнері
async function processImagesInContainer(containerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString('YOUR_AZURE_STORAGE_CONNECTION_STRING');
  const containerClient = blobServiceClient.getContainerClient(containerName);
  let i = 1;
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(`Processing image ${i++}: ${blob.name}`);
    await processImage(blob.name, containerName);
  }
}

// Виклик функції для обробки зображень у контейнері
processImagesInContainer('face');
