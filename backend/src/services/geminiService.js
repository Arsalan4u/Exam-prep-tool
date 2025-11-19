const API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1';

// Helper function to call Gemini API
async function callGeminiAPI(model, prompt) {
  try {
    const response = await fetch(
      `${API_BASE}/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text.trim();
    
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}

// ENHANCED SUMMARY GENERATION WITH STRUCTURED FORMAT
export async function generateSummaryWithGemini(text, options = {}) {
  try {
    console.log('🤖 Generating structured summary with Gemini 2.5 Flash...');
    
    const maxLength = Math.min(text.length, 15000);
    const textToSummarize = text.substring(0, maxLength);
    
    const prompt = `You are an expert educational content summarizer creating study materials for students.

TASK: Create a comprehensive, well-structured summary of this educational content.

STRICT FORMAT - You MUST follow this exact structure:

📚 TOPIC OVERVIEW
[Write 2-3 sentences introducing the main subject and its importance]

🔑 KEY CONCEPTS
• [First key concept - 1-2 sentences]
• [Second key concept - 1-2 sentences]
• [Third key concept - 1-2 sentences]
• [Fourth key concept - 1-2 sentences]
• [Fifth key concept - 1-2 sentences]
• [Sixth key concept - 1-2 sentences]

💡 IMPORTANT POINTS
• [Important detail with definition/formula - 1-2 sentences]
• [Important detail with definition/formula - 1-2 sentences]
• [Important detail with definition/formula - 1-2 sentences]
• [Important detail with definition/formula - 1-2 sentences]
• [Important detail with definition/formula - 1-2 sentences]

📝 EXAMPLES & APPLICATIONS
• [Real-world example or application - 1-2 sentences]
• [Real-world example or application - 1-2 sentences]
• [Real-world example or application - 1-2 sentences]

✅ KEY TAKEAWAYS
• [Most important thing to remember - 1 sentence]
• [Second most important thing - 1 sentence]
• [Third most important thing - 1 sentence]
• [Fourth most important thing - 1 sentence]

IMPORTANT RULES:
- Use EXACTLY the emoji headers shown above (📚 🔑 💡 📝 ✅)
- Every bullet point MUST start with •
- Keep each bullet point to 1-2 sentences
- Include specific terms, formulas, and definitions
- Make it exam-preparation focused
- Use clear, student-friendly language

TEXT TO SUMMARIZE:
${textToSummarize}

PROVIDE THE STRUCTURED SUMMARY NOW:`;

    const summary = await callGeminiAPI('gemini-2.5-flash', prompt);
    
    console.log('✅ Structured summary generated:', summary.length, 'characters');
    return summary;
    
  } catch (error) {
    console.error('❌ Gemini summary error:', error.message);
    throw error;
  }
}

// ENHANCED KEYWORD EXTRACTION
export async function extractKeywordsWithGemini(text) {
  try {
    console.log('🤖 Extracting keywords with Gemini 2.5 Flash...');
    
    const textToAnalyze = text.substring(0, 8000);
    
    const prompt = `Extract the 15 most important keywords and key phrases from this educational text.

REQUIREMENTS:
- Include technical terms, concepts, definitions, and important topics
- Prioritize terms essential for understanding the content
- Include both single words and multi-word phrases (2-4 words)
- Focus on exam-relevant terminology
- Order by importance (most important first)

TEXT:
${textToAnalyze}

FORMAT: Return ONLY a valid JSON array of strings (no markdown, no code blocks):
["keyword1", "key phrase 2", "technical term", "important concept"]

RETURN ONLY THE JSON ARRAY:`;

    const responseText = await callGeminiAPI('gemini-2.5-flash', prompt);
    
    let cleanedText = responseText.split('``````').join('').trim();
    
    const startIdx = cleanedText.indexOf('[');
    const endIdx = cleanedText.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error('No JSON array found in response');
      return [];
    }
    
    const jsonString = cleanedText.substring(startIdx, endIdx + 1);
    const keywords = JSON.parse(jsonString);
    
    console.log('✅ Keywords extracted:', keywords.length);
    
    return keywords.slice(0, 15).map((word, index) => ({
      word: word,
      score: (15 - index) / 15,
      frequency: Math.max(1, Math.floor((15 - index) / 2))
    }));
    
  } catch (error) {
    console.error('❌ Gemini keyword error:', error.message);
    return [];
  }
}

// ENHANCED TOPIC EXTRACTION
export async function extractTopicsWithGemini(text) {
  try {
    console.log('🤖 Extracting topics with Gemini 2.5 Flash...');
    
    const textToAnalyze = text.substring(0, 8000);
    
    const prompt = `Identify the 6-8 main topics/themes covered in this educational text.

REQUIREMENTS:
- Identify distinct, meaningful topics
- Provide a clear, descriptive name for each topic
- List 2-5 related keywords for each topic
- Rate importance from 0.6 to 1.0 (1.0 = most critical)
- Order by importance

TEXT:
${textToAnalyze}

FORMAT: Return ONLY a valid JSON array (no markdown, no code blocks):
[
  {
    "name": "Clear Topic Name",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "importance": 0.95
  }
]

RETURN ONLY THE JSON ARRAY:`;

    const responseText = await callGeminiAPI('gemini-2.5-flash', prompt);
    
    let cleanedText = responseText.split('``````').join('').trim();
    
    const startIdx = cleanedText.indexOf('[');
    const endIdx = cleanedText.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error('No JSON array found in response');
      return [];
    }
    
    const jsonString = cleanedText.substring(startIdx, endIdx + 1);
    const topics = JSON.parse(jsonString);
    
    console.log('✅ Topics extracted:', topics.length);
    
    return topics.slice(0, 8).map(topic => ({
      name: topic.name || 'Topic',
      keywords: Array.isArray(topic.keywords) ? topic.keywords : [],
      importance: topic.importance || 0.8,
      frequency: (topic.keywords?.length || 1),
      context: ''
    }));
    
  } catch (error) {
    console.error('❌ Gemini topic error:', error.message);
    return [];
  }
}

// DIFFICULTY ANALYSIS
export async function analyzeTextDifficulty(text) {
  try {
    console.log('🤖 Analyzing difficulty with Gemini 2.5 Flash...');
    
    const textSample = text.substring(0, 4000);
    
    const prompt = `Analyze the reading difficulty of this educational text.

FACTORS TO CONSIDER:
- Vocabulary complexity (basic vs. technical/academic terms)
- Sentence structure (simple vs. complex/compound)
- Conceptual complexity (concrete vs. abstract ideas)
- Prior knowledge required
- Technical terminology density

TEXT SAMPLE:
${textSample}

DIFFICULTY LEVELS:
- "easy": Basic content, simple vocabulary, minimal prerequisites
- "medium": Intermediate content, some technical terms, standard academic level
- "hard": Advanced content, complex concepts, significant technical terminology

RETURN ONLY ONE WORD (easy, medium, or hard):`;

    const difficulty = await callGeminiAPI('gemini-2.5-flash', prompt);
    
    const normalizedDifficulty = difficulty.toLowerCase().trim();
    const validDifficulty = ['easy', 'medium', 'hard'].includes(normalizedDifficulty) 
      ? normalizedDifficulty 
      : 'medium';
    
    console.log('✅ Difficulty analyzed:', validDifficulty);
    
    return validDifficulty;
    
  } catch (error) {
    console.error('❌ Gemini difficulty error:', error.message);
    return 'medium';
  }
}
