import express from 'express';
import dotenv from 'dotenv';
import { Genlook } from '@genlook/api';

dotenv.config();

const apiKey = process.env.GENLOOK_API_KEY?.trim();

if (!apiKey) {
    throw new Error('GENLOOK_API_KEY is missing in your .env file');
}

const app = express();

const changeType = "top";

const instructions = {
    top: "Replace only the person's top or shirt with the selected product. Preserve the original pants, jewelry, accessories, pose, and background.",
    bottom: "Replace only the person's pants or bottom wear with the selected product. Preserve the original top, jewelry, accessories, pose, and background.",
    full_outfit: "Replace the person's top and bottom wear with the selected products. Preserve other accessories, pose, and background.",
    jewelry: "Change only the jewelry to the selected jewelry product. Preserve the original clothing, pose, and background.",
    necklace: "Elegant gold pendant necklace. Preserve the person's identity, clothing, and background. Place the necklace naturally around the neck.",
    earrings: "Change only the earrings to the selected earrings product. Preserve the original clothing, pose, and background.",
    accessories: "Change only the accessories to the selected accessory product. Preserve the original clothing, pose, and background." 
};



app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 5000;

const client = new Genlook({
    apiKey,
    timeoutMs: 120_000
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Virtual Try-On API'
    });
});

app.post('/generate-look', async (req, res) => {
    try {
        console.log('Generating look...');

        const result = await client.tryOn.createSync({
            products: [
                {
                    title: 'Padmashree Temple Necklace set',
                    description: instructions[changeType],

                    images: [
                        {
                            source: {
                                url: 'https://zerakijewels.com/cdn/shop/files/ChatGPTImageJul2_2026_04_29_31PM.png?v=1782989980&width=1000'
                            }
                        }
                    ]
                }
            ],

            // A single "image" object, not an "images" array.
            person: {
                image: {
                    source: {
                        url: 'https://zerakijewels.com/cdn/shop/files/173.jpg?v=1726823980&width=1000'
                    }
                }
            },

            mock: process.env.GENLOOK_MOCK === 'true'
        });

        // If the synchronous call returns while still processing,
        // poll the existing generation instead of creating another.
        const completed =
            result.status === 'COMPLETED'
                ? result
                : await client.generations.waitFor(
                    result.generationId,
                    { timeoutMs: 180_000 }
                );

        console.log('Try-on completed:', completed.generationId);

        return res.status(200).json({
            message: 'Try-on completed successfully',
            generationId: completed.generationId,
            status: completed.status,
            resultImageUrl: completed.resultImageUrl,
            isMock: process.env.GENLOOK_MOCK === 'true'
        });

    } catch (err) {
        console.error('Try-on error:', {
            code: err.code,
            message: err.message,
            requestId: err.requestId
        });

        const status =
            Number.isInteger(err.status) &&
                err.status >= 400 &&
                err.status <= 599
                ? err.status
                : 500;

        return res.status(status).json({
            message: 'Failed to generate try-on',
            code: err.code || 'TRYON_ERROR',
            error: err.message,
            details: err.details,
            requestId: err.requestId
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});