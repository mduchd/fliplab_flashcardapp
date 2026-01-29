import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testGenerate() {
    console.log(`🧪 Testing Model: ${MODEL}`);
    console.log(`🔑 Key length: ${API_KEY ? API_KEY.length : 0}`);

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, answer in 5 words." }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS!');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ FAILED!');
            console.log('Status:', response.status);
            console.log('Error Body:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testGenerate();
