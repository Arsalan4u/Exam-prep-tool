import natural from 'natural';

class TFIDF {
  constructor() {
    this.documents = [];
    this.vocabulary = new Set();
    this.stopwords = new Set(natural.stopwords);
  }

  addDocument(text) {
    const tokens = this.tokenize(text);
    this.documents.push(tokens);
    tokens.forEach(token => this.vocabulary.add(token));
  }

  tokenize(text) {
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;
    
    return tokenizer.tokenize(text.toLowerCase())
      .filter(word => word.length > 2 && !this.stopwords.has(word))
      .map(word => stemmer.stem(word));
  }

  calculateTF(term, document) {
    const termCount = document.filter(word => word === term).length;
    return termCount / document.length;
  }

  calculateIDF(term) {
    const documentsWithTerm = this.documents.filter(doc => 
      doc.includes(term)).length;
    
    if (documentsWithTerm === 0) return 0;
    
    return Math.log(this.documents.length / documentsWithTerm);
  }

  calculateTFIDF(term, document) {
    const tf = this.calculateTF(term, document);
    const idf = this.calculateIDF(term);
    return tf * idf;
  }

  getTopKeywords(text, count = 10) {
    const tokens = this.tokenize(text);
    const scores = [];
    
    const uniqueTokens = [...new Set(tokens)];
    
    uniqueTokens.forEach(token => {
      const tfidf = this.calculateTFIDF(token, tokens);
      scores.push({ word: token, score: tfidf });
    });
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .filter(item => item.score > 0);
  }

  extractTopics(text) {
    const keywords = this.getTopKeywords(text, 20);
    
    // Group related keywords into topics
    const topics = [];
    const processed = new Set();
    
    keywords.forEach(keyword => {
      if (processed.has(keyword.word)) return;
      
      const relatedWords = keywords.filter(k => 
        !processed.has(k.word) && 
        natural.JaroWinklerDistance(keyword.word, k.word) > 0.7
      );
      
      if (relatedWords.length > 0) {
        const topic = {
          name: keyword.word,
          keywords: relatedWords.map(w => w.word),
          importance: relatedWords.reduce((sum, w) => sum + w.score, 0) / relatedWords.length,
          frequency: relatedWords.length
        };
        
        topics.push(topic);
        relatedWords.forEach(w => processed.add(w.word));
      }
    });
    
    return topics.sort((a, b) => b.importance - a.importance);
  }
}

export default TFIDF;
