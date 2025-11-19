import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Checking available Gemini models...\n');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models for your API key:\n');
      data.models.forEach(model => {
        console.log(`📌 ${model.name}`);
        console.log(`   Display: ${model.displayName}`);
        console.log(`   Supports: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (contentModels.length > 0) {
        console.log('\n✨ Recommended model to use:');
        console.log(`   ${contentModels[0].name.split('/')[1]}`);
      }
    } else {
      console.log('❌ Error:', data.error?.message || 'No models found');
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
