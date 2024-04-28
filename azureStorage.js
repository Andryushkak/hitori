const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

// Ваші дані для з'єднання з Azure Storage
const accountName = "facestorag";
const accountKey = "h24dc+p/iU6gyZg4b+eay8UOgYXXGx4PWg7OEkJugp3ftmaQgkQ6IonxOR8A3jve51gV/JuaARli+AStyVP78A==";
const containerName = "face";

// Створення об'єкту BlobServiceClient для з'єднання з Azure Storage
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

// Функція для завантаження фото на Azure Blob Storage
async function uploadPhotoToAzureStorage(photoData, photoName) {
  try {
    // Отримання референсу на контейнер у Azure Storage
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Створення BlobClient для завантаження фото
    const blobClient = containerClient.getBlobClient(photoName);

    // Перетворення base64 фото в буфер даних
    const byteArray = Buffer.from(photoData.split(",")[1], "base64");

    // Завантаження фото на Azure Blob Storage
    await blobClient.upload(byteArray, byteArray.length);

    console.log(`Фото ${photoName} успішно завантажено на Azure Blob Storage.`);
  } catch (error) {
    console.error("Помилка при завантаженні фото на Azure Blob Storage:", error);
    throw error;
  }
}

module.exports = uploadPhotoToAzureStorage;
