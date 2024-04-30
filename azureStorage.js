// azureStorage.js

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const accountName = "facestorag";
const accountKey = "h24dc+p/iU6gyZg4b+eay8UOgYXXGx4PWg7OEkJugp3ftmaQgkQ6IonxOR8A3jve51gV/JuaARli+AStyVP78A==";
const containerName = "face";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

async function uploadPhotoToAzureStorage(photoData, photoName) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${photoName}.jpg`; // Оновлення імені блоба
    const blockBlobClient = containerClient.getBlockBlobClient(blobName); // Отримання об'єкта блоба
    const base64Data = photoData.replace(/^data:image\/jpeg;base64,/, ''); // Видалення префіксу зображення
    const byteArray = Buffer.from(base64Data, "base64"); // Створення буфера
    await blockBlobClient.upload(byteArray, byteArray.length); // Завантаження даних у блоб
    console.log(`Фото ${photoName} успішно завантажено на Azure Blob Storage.`);
  } catch (error) {
    console.error("Помилка при завантаженні фото на Azure Blob Storage:", error);
    throw error;
  }
}

module.exports = uploadPhotoToAzureStorage;
