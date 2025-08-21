import { resume } from "@/data/resume";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { faq } from "@/data/faq";

export interface Document {
  id: string;
  content: string;
  metadata: {
    type: 'resume' | 'experience' | 'project' | 'faq';
    title?: string;
    tags?: string[];
  };
}

export interface SearchResult {
  document: Document;
  score: number;
}

// Data freshness tracking
interface DataSnapshot {
  resumeHash: string;
  experiencesHash: string;
  projectsHash: string;
  faqHash: string;
  timestamp: number;
}

class SimpleVectorDB {
  private documents: Document[] = [];
  private embeddings: Map<string, number[]> = new Map();
  private wordList: string[] = [];
  private initialized = false;
  private lastDataSnapshot: DataSnapshot | null = null;
  private dataRefreshInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Lazy initialization - only when first needed
    this.startDataMonitoring();
  }

  private startDataMonitoring() {
    // Check for data changes every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      this.dataRefreshInterval = setInterval(() => {
        this.checkForDataChanges();
      }, 30000); // 30 seconds
    }
  }

  private generateDataHash(data: any): string {
    // Better hash function for detecting changes
    const jsonStr = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private checkForDataChanges() {
    const currentSnapshot: DataSnapshot = {
      resumeHash: this.generateDataHash(resume),
      experiencesHash: this.generateDataHash(experiences),
      projectsHash: this.generateDataHash(projects),
      faqHash: this.generateDataHash(faq),
      timestamp: Date.now()
    };

    // Check if any data has changed
    if (this.lastDataSnapshot) {
      const hasChanged = 
        this.lastDataSnapshot.resumeHash !== currentSnapshot.resumeHash ||
        this.lastDataSnapshot.experiencesHash !== currentSnapshot.experiencesHash ||
        this.lastDataSnapshot.projectsHash !== currentSnapshot.projectsHash ||
        this.lastDataSnapshot.faqHash !== currentSnapshot.faqHash;

      if (hasChanged) {
        console.log('🔄 Data changes detected, refreshing vector database...');
        this.refreshData();
      }
    }

    this.lastDataSnapshot = currentSnapshot;
  }

  private refreshData() {
    // Clear existing data
    this.documents = [];
    this.embeddings.clear();
    this.wordList = [];
    this.initialized = false;
    
    // Reinitialize with fresh data
    this.ensureInitialized();
    console.log('✅ Vector database refreshed with latest data');
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initializeDocuments();
      this.initialized = true;
    }
  }

  private initializeDocuments() {
    // Add resume sections
    this.documents.push({
      id: 'resume-basic',
      content: `Name: ${resume.name}. Headline: ${resume.headline}. About: ${resume.about}. Location: ${resume.location}. Languages: ${resume.languages.join(', ')}. Availability: ${resume.availability}.`,
      metadata: { type: 'resume', title: 'Basic Information' }
    });

    // Add skills
    resume.skills.forEach((skill, index) => {
      this.documents.push({
        id: `skill-${index}`,
        content: `${skill.name}: ${skill.items.join(', ')}`,
        metadata: { type: 'resume', title: skill.name, tags: skill.items }
      });
    });

    // Add experiences
    experiences.forEach((exp, index) => {
      const skills = exp.skills?.join(', ') || '';
      const description = exp.description?.join('. ') || '';
      this.documents.push({
        id: `exp-${index}`,
        content: `${exp.role} at ${exp.company} (${exp.startDate}–${exp.endDate}) in ${exp.location}. Skills: ${skills}. ${description}`,
        metadata: { type: 'experience', title: exp.role, tags: exp.skills }
      });
    });

    // Add projects
    projects.forEach((proj, index) => {
      const tech = proj.technologies?.join(', ') || '';
      this.documents.push({
        id: `proj-${index}`,
        content: `${proj.title}: ${proj.description}. Technologies: ${tech}. ${proj.github ? `GitHub: ${proj.github}` : ''} ${proj.live ? `Live: ${proj.live}` : ''}`,
        metadata: { type: 'project', title: proj.title, tags: proj.technologies }
      });
    });

    // Add FAQ
    faq.forEach((item, index) => {
      this.documents.push({
        id: `faq-${index}`,
        content: `Question: ${item.question}. Answer: ${item.answer}`,
        metadata: { type: 'faq', title: item.question, tags: item.tags }
      });
    });

    // Generate simple embeddings (TF-IDF style)
    this.generateEmbeddings();
  }

  private generateEmbeddings() {
    const allWords = new Set<string>();
    
    // Collect all unique words
    this.documents.forEach(doc => {
      const words = this.tokenize(doc.content.toLowerCase());
      words.forEach(word => allWords.add(word));
    });

    const wordList = Array.from(allWords);
    
    // Generate embeddings for each document
    this.documents.forEach(doc => {
      const words = this.tokenize(doc.content.toLowerCase());
      const embedding = wordList.map(word => {
        const tf = words.filter(w => w === word).length / words.length;
        const idf = Math.log(this.documents.length / this.documents.filter(d => 
          this.tokenize(d.content.toLowerCase()).includes(word)
        ).length);
        return tf * idf;
      });
      this.embeddings.set(doc.id, embedding);
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  search(query: string, limit: number = 5): SearchResult[] {
    this.ensureInitialized();
    
    const queryWords = this.tokenize(query.toLowerCase());
    const queryEmbedding = this.generateQueryEmbedding(queryWords);
    
    const results: SearchResult[] = [];
    
    // Early exit for very short queries
    if (queryWords.length < 2) {
      return this.documents.slice(0, limit).map(doc => ({ document: doc, score: 0.5 }));
    }
    
    this.documents.forEach(doc => {
      const docEmbedding = this.embeddings.get(doc.id);
      if (docEmbedding) {
        const score = this.cosineSimilarity(queryEmbedding, docEmbedding);
        if (score > 0.1) { // Threshold to filter low relevance
          results.push({ document: doc, score });
        }
      }
    });
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private generateQueryEmbedding(queryWords: string[]): number[] {
    const allWords = Array.from(new Set(
      this.documents.flatMap(doc => this.tokenize(doc.content.toLowerCase()))
    ));
    
    return allWords.map(word => {
      const tf = queryWords.filter(w => w === word).length / queryWords.length;
      return tf;
    });
  }

  getDocument(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  getAllDocuments(): Document[] {
    return this.documents;
  }

  // Public method to manually refresh data
  public forceRefresh() {
    console.log('🔄 Manual data refresh requested...');
    this.refreshData();
  }

  // Public method to get data freshness info
  public getDataFreshness(): DataSnapshot | null {
    return this.lastDataSnapshot;
  }
}

// Singleton instance
const vectorDB = new SimpleVectorDB();

// Export function to manually refresh data
export function refreshVectorDatabase() {
  vectorDB.forceRefresh();
}

// Export function to get data freshness info
export function getDataFreshnessInfo() {
  return vectorDB.getDataFreshness();
}

// Simple in-memory cache for search results
const searchCache = new Map<string, { results: SearchResult[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: string, limit: number): string {
  return `${query.toLowerCase().trim()}:${limit}`;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export function searchDocuments(query: string, limit: number = 5): SearchResult[] {
  const cacheKey = getCacheKey(query, limit);
  const cached = searchCache.get(cacheKey);
  
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.results;
  }
  
  const results = vectorDB.search(query, limit);
  
  // Cache the results
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries (keep only last 100)
  if (searchCache.size > 100) {
    const entries = Array.from(searchCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    entries.slice(100).forEach(([key]) => searchCache.delete(key));
  }
  
  return results;
}

export function getRelevantContext(query: string, limit: number = 3): string {
  const q = query.toLowerCase();
  
  // For location questions, return specific location info instead of FAQ
  if (/(location|where|based|city|country|india|tirunelveli|remote|hybrid|onsite|work location|preferred location)/i.test(q)) {
    return `Location Information:\nI'm based in ${resume.location}. I'm open to ${resume.openTo.join(' and ')} opportunities.`;
  }
  
  // For education/course questions, return specific education info
  if (/(course|courses|education|degree|college|university|diploma|certification|cert|udemy|learning|study)/i.test(q)) {
    const educationInfo = resume.education.map(edu => 
      `${edu.institution} — ${edu.program} (${edu.startDate}–${edu.endDate})`
    ).join('\n');
    
    const achievements = resume.achievements
      .filter(ach => ach.title.includes('Professional Development') || ach.title.includes('Course'))
      .map(ach => ach.details)
      .join('\n');
    
    return `Education Information:\n${educationInfo}\n\nProfessional Development:\n${achievements}`;
  }
  
  // For salary/compensation questions, return specific info
  if (/(salary|ctc|compensation|pay|package|expected|negotiable|benefits)/i.test(q)) {
    return `Salary Information:\nI'm a fresher and don't have a current CTC. I'm open to discussing fair compensation aligned with the role, responsibilities, and location. For fresher roles, I expect compensation in line with industry standards for my skill set.`;
  }
  
  // For project-specific questions, return detailed project info
  if (/(project|built|developed|created|grc|document|ai|assistant|automation)/i.test(q)) {
    // Check for specific project types first
    if (/(e.?commerce|shop|store|retail)/i.test(q)) {
      const ecommerceProject = projects.find(proj => 
        proj.title.toLowerCase().includes('e-commerce') || 
        proj.title.toLowerCase().includes('commerce')
      );
      if (ecommerceProject) {
        return `E-commerce Project:\n${ecommerceProject.title}: ${ecommerceProject.description}. Technologies: ${ecommerceProject.technologies.join(', ')}. ${ecommerceProject.github ? `GitHub: ${ecommerceProject.github}` : ''} ${ecommerceProject.live ? `Live: ${ecommerceProject.live}` : ''}`;
      }
    }
    
    if (/(ai|ml|machine.?learning|deep.?learning|neural|gpt|llm)/i.test(q)) {
      const projectAchievements = resume.achievements
        .filter(ach => ach.title.includes('Assistant') || ach.title.includes('GRC'))
        .map(ach => `${ach.title}: ${ach.details}${ach.impact ? ` (${ach.impact})` : ''}`)
        .join('\n\n');
      
      return `AI Projects:\n${projectAchievements}`;
    }
    
    // For general project questions, return all projects
    const allProjects = projects.map(proj => 
      `${proj.title}: ${proj.description}. Technologies: ${proj.technologies.join(', ')}`
    ).join('\n\n');
    
    return `All Projects:\n${allProjects}`;
  }
  
  // For technology stack questions, return prioritized skills
  if (/(tech|technology|stack|framework|library|tool|skill)/i.test(q)) {
    const techSkills = resume.skills
      .map(skill => `${skill.name}: ${skill.items.slice(0, 6).join(', ')}`)
      .join('\n');
    
    return `Technology Stack:\n${techSkills}`;
  }
  
  // For specific technology questions (React, Node.js, etc.), return focused info
  if (/(react|next|typescript|node|python|mysql|express)/i.test(q)) {
    const specificTech = q.match(/(react|next|typescript|node|python|mysql|express)/i)?.[0]?.toLowerCase();
    if (specificTech) {
      // Find relevant skills and projects
      const relevantSkills = resume.skills.filter(skill => 
        skill.items.some(item => item.toLowerCase().includes(specificTech))
      );
      
      const relevantProjects = projects.filter(proj => 
        proj.technologies.some(tech => tech.toLowerCase().includes(specificTech))
      );
      
      let response = `${specificTech.charAt(0).toUpperCase() + specificTech.slice(1)} Experience:\n`;
      
      if (relevantSkills.length > 0) {
        response += `\n**Skills:** ${relevantSkills.map(skill => skill.items.filter(item => 
          item.toLowerCase().includes(specificTech)
        ).join(', ')).join(', ')}`;
      }
      
      if (relevantProjects.length > 0) {
        response += `\n\n**Projects:** ${relevantProjects.map(proj => 
          `${proj.title} (${proj.technologies.filter(tech => 
            tech.toLowerCase().includes(specificTech)
          ).join(', ')})`
        ).join(', ')}`;
      }
      
      return response;
    }
  }
  
  // For name/identity questions, return concise personal info
  if (/(name|who|identity|yourself)/i.test(q)) {
    return `Personal Information:\nI'm ${resume.name}, ${resume.headline}. ${resume.about} I'm based in ${resume.location} and available ${resume.availability.toLowerCase()}.`;
  }
  
  // For contact information questions
  if (/(contact|email|phone|linkedin|github|portfolio|reach|get in touch)/i.test(q)) {
    return `Contact Information:\n\n**📧 Email:** ${resume.links.email}\n**📱 Phone:** ${resume.links.phone}\n**💼 LinkedIn:** ${resume.links.linkedin}\n**🐙 GitHub:** ${resume.links.github}\n**🌐 Portfolio:** ${resume.links.portfolio}`;
  }
  
  // For latest/recent project questions, return most recent project
  if (/(latest|recent|new|last|current)/i.test(q) && /(project|work|built|developed)/i.test(q)) {
    const latestProject = resume.achievements
      .filter(ach => ach.title.includes('Assistant'))
      .sort((a, b) => (b.when || '0').localeCompare(a.when || '0'))[0];
    
    if (latestProject) {
      return `Latest Project:\n${latestProject.title}: ${latestProject.details}${latestProject.impact ? ` (${latestProject.impact})` : ''}`;
    }
  }
  
  // For e-commerce specific questions, return e-commerce project
  if (/(e.?commerce|shop|store|retail|shopping|buy|sell)/i.test(q)) {
    const ecommerceProject = projects.find(proj => 
      proj.title.toLowerCase().includes('e-commerce') || 
      proj.title.toLowerCase().includes('commerce')
    );
    if (ecommerceProject) {
      return `E-commerce Project:\n${ecommerceProject.title}: ${ecommerceProject.description}. Technologies: ${ecommerceProject.technologies.join(', ')}. ${ecommerceProject.github ? `GitHub: ${ecommerceProject.github}` : ''} ${ecommerceProject.live ? `Live: ${ecommerceProject.live}` : ''}`;
    }
  }
  
  const results = searchDocuments(query, limit);
  
  if (results.length === 0) {
    return `No specific information found for "${query}". You can ask about skills, experience, projects, education, or contact information.`;
  }
  
  const context = results
    .map(result => `${result.document.metadata.title || result.document.metadata.type}:\n${result.document.content}`)
    .join('\n\n');
  
  return context;
}

export function generateRAGPrompt(query: string, context: string): string {
  return `You are ${resume.name}'s AI assistant. Answer the user's question using ONLY the provided context and your general knowledge about software development. 

Context:
${context}

User Question: ${query}

Instructions:
- Answer in first person as if you are ${resume.name}
- Use the context above to provide accurate, specific information
- Keep responses concise (2-3 sentences max)
- If the context doesn't contain enough information, say so and suggest what they can ask about instead
- Be conversational and helpful

Answer:`;
}
