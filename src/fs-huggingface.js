const fs = require('fs');
const path = require('path');


async function transcribeWithHuggingFace(audioFilePath, hfApiKey) {
    try {
        // 1. Lee el archivo de audio como un Buffer
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file does not exist');
        }
        const audioData = fs.readFileSync(audioFilePath);

        // 2. Elige un modelo Whisper en Hugging Face 
        const modelUrl = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3'; 

        // 3. Llama a la API de Hugging Face
        console.log(`Sending audio to Hugging Face model: ${modelUrl}...`);
        const response = await fetch(modelUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${hfApiKey}`,
                'Content-Type': 'audio/mpeg'
            },
            body: audioData // Envía el buffer de audio directamente
        });

        // 4. Valida y procesa la respuesta
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error from Hugging Face API: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Valida la estructura de la respuesta
        if (!data || typeof data.text === 'undefined') {
            console.warn('Unexpected response structure:', data);
            throw new Error('Transcription not found in Hugging Face response.');
        }
        const transcription = data.text;

        // 5. Guarda la transcripción
        const outputFilePath = path.join(path.dirname(audioFilePath), `${path.basename(audioFilePath, path.extname(audioFilePath))}_transcription_hf.txt`);
        fs.writeFileSync(outputFilePath, transcription, 'utf8');
        console.log('Transcription saved to:', outputFilePath);

        return transcription;
        // Devuelve error si hay problemas durante la transcripción
    } catch (error) {
        console.error('Error during Hugging Face transcription:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
        throw error;
    }
}

// USAR LA API DE HUGGING FACE
const audioPath = './audio.mp3'; // Asegúrate que esta ruta sea correcta
const HUGGING_FACE_API_KEY = 'XXXXXXXXXXXXXXXXXXXXXX'; // Reemplaza con tu token real de Hugging Face

if (!HUGGING_FACE_API_KEY || HUGGING_FACE_API_KEY === 'XXXXXXXXXXXXX') {
    console.error("Error: Debes reemplazar 'hf_TU_TOKEN_DE_HUGGING_FACE' con tu token real de Hugging Face.");
} else {
    transcribeWithHuggingFace(audioPath, HUGGING_FACE_API_KEY)
        .then(transcription => {
            console.log('\n--- Hugging Face Transcription ---');
            console.log('Transcription successful:\n', transcription);
            console.log('----------------------------------');
        })
        .catch(error => {
            console.error('\n--- Hugging Face Transcription Failed ---');
            console.error('--------------------------------------');
        });
}