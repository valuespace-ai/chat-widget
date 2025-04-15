/**
 * ApiService.jsx
 * Handles all API calls to backend services
 */

/**
 * Uploads a file to the backend storage service
 * @param {Blob} file - The file blob to upload
 * @param {string} tenantId - The tenantId identifier (default: 'vesperworld')
 * @param {string} origin - The origin of the file (default: 'file_upload')
 * @param {string} botServiceUrl - The base URL for the bot service (optional)
 * @returns {Promise<Object>} - Response with success status and URL or error
 */
export const uploadFile = async (file, tenantId = 'vesperworld', origin = 'file_upload', botServiceUrl) => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Add required JSON properties
    formData.append('tenantId', tenantId);
    formData.append('origin', origin);

    // Determine the upload URL
    const uploadUrl = botServiceUrl + '/api/Upload/UploadFile';
    // Send the file to the backend service
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    // Parse the response to get the public URL
    const data = await response.json();

    // Return the public URL from the response
    return {
      success: true,
      url: data.url,
      filename: data.filename
    };
  } catch (error) {
    console.error('ApiService: Error uploading file to backend:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Uploads an audio recording to the backend storage service
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} botServiceUrl - The base URL for the bot service
 * @returns {Promise<Object>} - Response with success status and URL or error
 */
export const uploadAudioRecording = async (audioBlob, botServiceUrl) => {
  return uploadFile(audioBlob, 'vesperworld', 'web-chat', botServiceUrl);
};

/**
 * Uploads an image to the backend storage service
 * @param {Blob} imageBlob - The image blob to upload
 * @param {string} botServiceUrl - The base URL for the bot service
 * @returns {Promise<Object>} - Response with success status and URL or error
 */
export const uploadImage = async (imageBlob, botServiceUrl) => {
  return uploadFile(imageBlob, 'vesperworld', 'web-chat', botServiceUrl);
};

export default {
  uploadFile,
  uploadAudioRecording,
  uploadImage
};
