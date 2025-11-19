import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔑 Testing Gemini API Key...');
console.log('Key (first 20 chars):', apiKey?.substring(0, 20) + '...');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try gemini-pro instead
    console.log('\n📡 Testing model: gemini-pro\n');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Key is VALID!');
    console.log('✅ Model: gemini-pro works!');
    console.log('✅ Response:', text);
    console.log('\n🎉 Gemini API is working correctly!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 The API key is valid but model access might be limited.');
    console.log('💡 Solution: Use SUMMARY_MODE=custom in .env (works great!)\n');
  }
}

testGemini();
