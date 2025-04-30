const fs = require('fs');
const path = require('path');
require('dotenv').config();


async function transcribeAudio(AudioFilePath, APIKEY) {
    try {
        if(!fs.existsSync(AudioFilePath)){
            throw new Error('El archivo de audio no existe');
        }

        const audioData = fs.readFileSync(AudioFilePath);
 

        const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${APIKEY}`,
                'Content-Type': 'audio/mpeg'
            },
            body: audioData //Envia el buffer del audio directamente
        });

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(`Error en la API de hugging face: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (!data || typeof data.text === 'undefined') {
            console.warn('Unexpected response structure:', data);
            throw new Error('Transcription not found in Hugging Face response.');
        }
        const transcription = data.text;

        const outputfilepath = path.join(path.dirname(AudioFilePath), `${path.basename(AudioFilePath, path.extname(AudioFilePath))}_transcription.txt`);
        fs.writeFileSync(outputfilepath, transcription, 'utf8');
        console.log(`Transcripcion guardada en: ${outputfilepath}`);

        return transcription;

    } catch (error) {
        console.error(`Error durante la transcripcion`, error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
        throw error;
    }
}

const audiopath = './audio.mp3';
const APIKEY = process.env.API_KEY;

transcribeAudio(audiopath, APIKEY)
    .then(transcription => {
        console.log(`----Transcripcion de hugging face----`);
        console.log(transcription);
    })
    .catch(error => {
        console.error(`\n---Transcripcion de Hugging Face fallida---`);
    });
