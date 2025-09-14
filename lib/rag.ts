import { resume } from "@/data/resume";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { faq } from "@/data/faq";

// Local Project interface matching the structure in projects.ts
interface Project {
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  documentation?: string;
  blogPost?: string;
  images: string[];
  videoPreviews?: Array<{
    url: string;
    thumbnail: string;
    duration?: number;
  }>;
  startDate: Date | string;
  endDate: Date | string | 'Present';
  status: string;
  content?: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: {
    type: 'resume' | 'experience' | 'project' | 'faq';
    title?: string;
    tags?: string[];
    semanticCategory?: string;
    relatedDocIds?: string[];
    importance?: number;
    temporalRelevance?: number;
  };
}

export interface SearchResult {
  document: Document;
  score: number;
  relevanceFactors: {
    semantic: number;
    keyword: number;
    contextual: number;
    temporal: number;
  };
}

interface DataSnapshot {
  resumeHash: string;
  experiencesHash: string;
  projectsHash: string;
  faqHash: string;
  timestamp: number;
}

// Enhanced query understanding with detailed intent classification
type PrimaryIntent = 'skills' | 'projects' | 'experience' | 'education' | 'contact' | 'achievements' | 'availability' | 'general';
type SubIntent = 'list' | 'detail' | 'compare' | 'evaluate' | 'availability';
type Complexity = 'simple' | 'moderate' | 'complex';
type ResponseType = 'factual' | 'explanatory' | 'comparative' | 'creative';
type Sentiment = 'positive' | 'neutral' | 'negative';
type TemporalContext = 'past' | 'present' | 'future';

interface QueryIntent {
  // Core intent classification
  primaryIntent: PrimaryIntent;
  subIntent?: SubIntent;
  
  // Extracted entities and context
  entities: string[];
  technologies: string[];
  temporalContext?: TemporalContext;
  sentiment?: Sentiment;
  
  // Response characteristics
  complexity: Complexity;
  responseType: ResponseType;
  
  // Confidence and metadata
  confidence: number;
  requiresFollowUp: boolean;
  
  // Additional metadata for response generation
  preferredFormat?: 'list' | 'paragraph' | 'bullet' | 'table';
  verbosity?: 'brief' | 'normal' | 'detailed';
}

// Semantic categories for better clustering
const SEMANTIC_CATEGORIES = {
  TECHNICAL_SKILLS: 'technical_skills',
  SOFT_SKILLS: 'soft_skills',
  PROJECT_DETAILS: 'project_details',
  PERSONAL_INFO: 'personal_info',
  CAREER_GOALS: 'career_goals',
  EDUCATION: 'education',
  CONTACT: 'contact',
  AVAILABILITY: 'availability',
  ACHIEVEMENTS: 'achievements'
};

class EnhancedVectorDB {
  private documents: Document[] = [];
  private embeddings: Map<string, number[]> = new Map();
  private documentGraph: Map<string, Set<string>> = new Map();
  private termFrequency: Map<string, Map<string, number>> = new Map();
  private inverseDocFrequency: Map<string, number> = new Map();
  private synonymMap: Map<string, Set<string>> = new Map();
  private queryHistory: Array<{query: string, timestamp: number, results: string[]}> = [];
  private initialized = false;
  private lastDataSnapshot: DataSnapshot | null = null;
  private dataRefreshInterval: NodeJS.Timeout | null = null;

  // Enhanced semantic understanding
  private conceptMap: Map<string, string[]> = new Map([
    ['frontend', ['react', 'vue', 'angular', 'ui', 'ux', 'css', 'html', 'javascript', 'typescript']],
    ['backend', ['node', 'express', 'python', 'django', 'api', 'server', 'database']],
    ['fullstack', ['frontend', 'backend', 'mern', 'mean', 'full-stack']],
    ['ai', ['machine learning', 'ml', 'artificial intelligence', 'neural', 'deep learning', 'llm', 'gpt']],
    ['database', ['mysql', 'postgresql', 'mongodb', 'sql', 'nosql', 'redis']],
    ['devops', ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'aws', 'cloud']],
    ['location', ['remote', 'onsite', 'hybrid', 'city', 'country', 'based', 'where']],
    ['compensation', ['salary', 'ctc', 'pay', 'package', 'compensation', 'benefits']],
    ['experience', ['years', 'fresher', 'junior', 'senior', 'expert', 'worked']],
    ['education', ['degree', 'university', 'college', 'course', 'certification', 'diploma']]
  ]);

  constructor() {
    this.initializeSynonyms();
    this.startDataMonitoring();
  }

  private initializeSynonyms() {
    // Technical synonyms
    this.synonymMap.set('javascript', new Set(['js', 'ecmascript', 'es6', 'es2015']));
    this.synonymMap.set('typescript', new Set(['ts', 'typed javascript']));
    this.synonymMap.set('react', new Set(['reactjs', 'react.js']));
    this.synonymMap.set('node', new Set(['nodejs', 'node.js']));
    this.synonymMap.set('python', new Set(['py', 'python3']));
    
    // Common query synonyms
    this.synonymMap.set('contact', new Set(['reach', 'email', 'phone', 'connect']));
    this.synonymMap.set('experience', new Set(['work', 'job', 'employment', 'career']));
    this.synonymMap.set('skills', new Set(['abilities', 'expertise', 'proficiency', 'knowledge']));
    this.synonymMap.set('projects', new Set(['portfolio', 'work samples', 'built', 'developed']));
  }

  private startDataMonitoring() {
    if (process.env.NODE_ENV === 'development') {
      this.dataRefreshInterval = setInterval(() => {
        this.checkForDataChanges();
      }, 30000);
    }
  }

  public generateDataHash(data: any): string {
    const jsonStr = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
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
    this.documents = [];
    this.embeddings.clear();
    this.documentGraph.clear();
    this.termFrequency.clear();
    this.inverseDocFrequency.clear();
    this.initialized = false;
    
    this.ensureInitialized();
    console.log('✅ Vector database refreshed with latest data');
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initializeDocuments();
      this.buildDocumentGraph();
      this.generateEnhancedEmbeddings();
      this.initialized = true;
    }
  }

  private initializeDocuments() {
    // Enhanced document creation with semantic categories and importance scoring
    
    // Resume sections with enhanced metadata
    this.documents.push({
      id: 'resume-basic',
      content: `Name: ${resume.name}. Headline: ${resume.headline}. About: ${resume.about}. Location: ${resume.location}. Languages: ${resume.languages.join(', ')}. Availability: ${resume.availability}.`,
      metadata: { 
        type: 'resume', 
        title: 'Basic Information',
        semanticCategory: SEMANTIC_CATEGORIES.PERSONAL_INFO,
        importance: 1.0,
        temporalRelevance: 1.0
      }
    });

    // Skills with relationships
    resume.skills.forEach((skill, index) => {
      const semanticCategory = this.categorizeSkill(skill.name);
      this.documents.push({
        id: `skill-${index}`,
        content: `${skill.name}: ${skill.items.join(', ')}`,
        metadata: { 
          type: 'resume', 
          title: skill.name, 
          tags: skill.items,
          semanticCategory,
          importance: this.calculateSkillImportance(skill),
          relatedDocIds: this.findRelatedSkills(skill, index)
        }
      });
    });

    // Experiences with temporal relevance
    experiences.forEach((exp, index) => {
      const skills = exp.skills?.join(', ') || '';
      const description = exp.description?.join('. ') || '';
      const temporalRelevance = this.calculateTemporalRelevance(exp.endDate);
      
      this.documents.push({
        id: `exp-${index}`,
        content: `${exp.role} at ${exp.company} (${exp.startDate}–${exp.endDate}) in ${exp.location}. Skills: ${skills}. ${description}`,
        metadata: { 
          type: 'experience', 
          title: exp.role, 
          tags: exp.skills,
          semanticCategory: SEMANTIC_CATEGORIES.PROJECT_DETAILS,
          importance: 0.9,
          temporalRelevance,
          relatedDocIds: this.findRelatedExperiences(exp, index)
        }
      });
    });

    // Projects with enhanced relationships
    projects.forEach((proj, index) => {
      const tech = proj.technologies?.join(', ') || '';
      this.documents.push({
        id: `proj-${index}`,
        content: `${proj.title}: ${proj.description}. Technologies: ${tech}. ${proj.github ? `GitHub: ${proj.github}` : ''} ${proj.live ? `Live: ${proj.live}` : ''}`,
        metadata: { 
          type: 'project', 
          title: proj.title, 
          tags: proj.technologies,
          semanticCategory: SEMANTIC_CATEGORIES.PROJECT_DETAILS,
          importance: this.calculateProjectImportance(proj),
          relatedDocIds: this.findRelatedProjects(proj, index)
        }
      });
    });

    // FAQ with query patterns
    faq.forEach((item, index) => {
      this.documents.push({
        id: `faq-${index}`,
        content: `Question: ${item.question}. Answer: ${item.answer}`,
        metadata: { 
          type: 'faq', 
          title: item.question, 
          tags: item.tags,
          semanticCategory: this.categorizeFAQ(item.question),
          importance: 0.7
        }
      });
    });

    // Create achievement documents
    resume.achievements?.forEach((achievement, index) => {
      this.documents.push({
        id: `achievement-${index}`,
        content: `${achievement.title}: ${achievement.details}${achievement.impact ? ` Impact: ${achievement.impact}` : ''}`,
        metadata: {
          type: 'resume',
          title: achievement.title,
          semanticCategory: SEMANTIC_CATEGORIES.ACHIEVEMENTS,
          importance: 0.85,
          temporalRelevance: achievement.when ? this.calculateTemporalRelevance(achievement.when) : 0.8
        }
      });
    });
  }

  private categorizeSkill(skillName: string): string {
    const name = skillName.toLowerCase();
    if (name.includes('frontend') || name.includes('ui')) return SEMANTIC_CATEGORIES.TECHNICAL_SKILLS;
    if (name.includes('backend') || name.includes('server')) return SEMANTIC_CATEGORIES.TECHNICAL_SKILLS;
    if (name.includes('soft') || name.includes('communication')) return SEMANTIC_CATEGORIES.SOFT_SKILLS;
    return SEMANTIC_CATEGORIES.TECHNICAL_SKILLS;
  }

  private categorizeFAQ(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('contact') || q.includes('email')) return SEMANTIC_CATEGORIES.CONTACT;
    if (q.includes('education') || q.includes('degree')) return SEMANTIC_CATEGORIES.EDUCATION;
    if (q.includes('available') || q.includes('start')) return SEMANTIC_CATEGORIES.AVAILABILITY;
    if (q.includes('salary') || q.includes('compensation')) return SEMANTIC_CATEGORIES.PERSONAL_INFO;
    return SEMANTIC_CATEGORIES.PERSONAL_INFO;
  }

  private calculateSkillImportance(skill: any): number {
    // Higher importance for primary skills
    const primarySkills = ['Frontend', 'Backend', 'Full Stack'];
    if (primarySkills.some(ps => skill.name.includes(ps))) return 1.0;
    return 0.8;
  }

  private calculateProjectImportance(project: any): number {
    let importance = 0.7;
    if (project.live) importance += 0.15;
    if (project.github) importance += 0.1;
    if (project.technologies?.length > 5) importance += 0.05;
    return Math.min(importance, 1.0);
  }

  private calculateTemporalRelevance(date: string): number {
    if (!date || date === 'Present') return 1.0;
    
    const yearMatch = date.match(/(\d{4})/);
    if (!yearMatch) return 0.7;
    
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    const yearsAgo = currentYear - year;
    
    // Decay function for temporal relevance
    return Math.max(0.3, 1.0 - (yearsAgo * 0.1));
  }

  private findRelatedSkills(skill: any, currentIndex: number): string[] {
    const related: string[] = [];
    // Find skills with overlapping items
    resume.skills.forEach((otherSkill, index) => {
      if (index !== currentIndex) {
        const overlap = skill.items.some((item: string) => 
          otherSkill.items.some((otherItem: string) => 
            item.toLowerCase().includes(otherItem.toLowerCase()) ||
            otherItem.toLowerCase().includes(item.toLowerCase())
          )
        );
        if (overlap) related.push(`skill-${index}`);
      }
    });
    return related;
  }

  private findRelatedExperiences(exp: any, currentIndex: number): string[] {
    const related: string[] = [];
    // Find projects using similar technologies
    projects.forEach((proj, index) => {
      const techOverlap = exp.skills?.some((skill: string) =>
        proj.technologies?.some((tech: string) =>
          skill.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (techOverlap) related.push(`proj-${index}`);
    });
    return related;
  }

  private findRelatedProjects(proj: Project, currentIndex: number): string[] {
    const related: string[] = [];
    projects.forEach((otherProj, index) => {
      if (index !== currentIndex) {
        // Check if the project's technologies match the skill
        const techMatch = otherProj.technologies.some((tech: string) =>
          proj.technologies.some((projTech: string) =>
            tech.toLowerCase().includes(projTech.toLowerCase()) ||
            projTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        
        // Check if the skill is mentioned in the project description
        const descMatch = otherProj.description.toLowerCase().includes(proj.title.toLowerCase());
        
        // Check if the skill is mentioned in the project title
        const titleMatch = otherProj.title.toLowerCase().includes(proj.title.toLowerCase());
        
        if (techMatch || descMatch || titleMatch) {
          related.push(`proj-${index}`);
        }
      }
    });
    return related;
  }

  private generateProjectContext(query: string): string {
    const queryLower = query.toLowerCase().trim();
  
    // Score and sort projects based on relevance to the query
    const scoredProjects = projects
      .map(project => {
        // Calculate relevance score based on different aspects
        let score = 0;
        const titleMatch = project.title.toLowerCase().includes(queryLower) ? 2 : 0;
        const descMatch = project.description.toLowerCase().includes(queryLower) ? 1.5 : 0;
        const techMatch = project.technologies.some(tech => 
          tech.toLowerCase().includes(queryLower)
        ) ? 1.8 : 0;
        
        // Additional scoring factors
        const hasDemo = project.live ? 0.5 : 0;
        const hasCode = project.github ? 0.5 : 0;
        const hasBlog = project.blogPost ? 0.3 : 0;
        
        score = titleMatch + descMatch + techMatch + hasDemo + hasCode + hasBlog;
        
        return { project, score };
      })
      .filter(({ score }) => score > 0.5) // Only include relevant projects
      .sort((a, b) => b.score - a.score); // Sort by relevance

    if (scoredProjects.length === 0) return '';

    // Generate detailed context for each project
    return scoredProjects.map(({ project }) => {
      let context = `## ${project.title}\n`;
      
      // Basic project info
      context += `**Description:** ${project.description}\n\n`;
      
      // Project status and timeline
      const startYear = project.startDate instanceof Date 
        ? project.startDate.getFullYear() 
        : new Date(project.startDate).getFullYear();
      
      context += `**Status:** ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`;
      context += ` | **Period:** ${startYear} - `;
      context += project.endDate === 'Present' ? 'Present' : 
        (project.endDate instanceof Date ? project.endDate.getFullYear() : new Date(project.endDate).getFullYear());
      context += '\n';
      
      // Technologies used
      if (project.technologies?.length) {
        context += `**Technologies:** ${project.technologies.join(', ')}\n`;
      }
      
      // Project links
      const links = [];
      if (project.github) links.push(`[GitHub](${project.github})`);
      if (project.live) links.push(`[Live Demo](${project.live})`);
      if (project.documentation) links.push(`[Documentation](${project.documentation})`);
      if (project.blogPost) links.push(`[Blog Post](${project.blogPost})`);
      
      if (links.length > 0) {
        context += `\n**Links:** ${links.join(' • ')}\n`;
      }
      
      // Featured image if available
      if (project.images?.[0]) {
        context += `\n![${project.title} Preview](${project.images[0]})\n`;
      }
      
      // Video preview if available
      if (project.videoPreviews?.[0]) {
        const video = project.videoPreviews[0];
        context += `\n[▶️ Video Preview](${video.url})`;
        if (video.duration) {
          context += ` (${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')})`;
        }
        context += '\n';
      }
      
      return context;
    }).join('\n\n---\n\n');
  }

  private buildDocumentGraph() {
    // Build a graph of document relationships
    this.documents.forEach(doc => {
      const relatedIds = doc.metadata.relatedDocIds || [];
      this.documentGraph.set(doc.id, new Set(relatedIds));
    });
  }

  private generateEnhancedEmbeddings() {
    // Calculate TF-IDF with enhancements
    const allTerms = new Set<string>();
    
    // Process all documents to get terms
    this.documents.forEach(doc => {
      const terms = this.enhancedTokenize(doc.content);
      const termFreq = new Map<string, number>();
      
      terms.forEach(term => {
        allTerms.add(term);
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
      });
      
      this.termFrequency.set(doc.id, termFreq);
    });

    // Calculate IDF for all terms
    allTerms.forEach(term => {
      const docsWithTerm = this.documents.filter(doc => {
        const terms = this.enhancedTokenize(doc.content);
        return terms.includes(term);
      }).length;
      
      this.inverseDocFrequency.set(term, 
        Math.log((this.documents.length + 1) / (docsWithTerm + 1)) + 1
      );
    });

    // Generate embeddings with multiple factors
    const termList = Array.from(allTerms);
    this.documents.forEach(doc => {
      const embedding = this.createEnhancedEmbedding(doc, termList);
      this.embeddings.set(doc.id, embedding);
    });
  }

  private createEnhancedEmbedding(doc: Document, termList: string[]): number[] {
    const terms = this.enhancedTokenize(doc.content);
    const termFreq = this.termFrequency.get(doc.id) || new Map();
    
    return termList.map(term => {
      const tf = (termFreq.get(term) || 0) / terms.length;
      const idf = this.inverseDocFrequency.get(term) || 0;
      
      // Base TF-IDF score
      let score = tf * idf;
      
      // Boost for metadata matches
      if (doc.metadata.tags?.some(tag => tag.toLowerCase().includes(term))) {
        score *= 1.5;
      }
      
      // Boost for title matches
      if (doc.metadata.title?.toLowerCase().includes(term)) {
        score *= 1.3;
      }
      
      // Apply importance factor
      score *= (doc.metadata.importance || 0.7);
      
      // Apply temporal relevance
      score *= (doc.metadata.temporalRelevance || 0.8);
      
      return score;
    });
  }

  private enhancedTokenize(text: string): string[] {
    // Improved tokenization with stemming-like behavior
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s\-\.]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);
    
    // Expand with synonyms
    const expandedTokens = new Set(tokens);
    tokens.forEach(token => {
      this.synonymMap.forEach((synonyms, key) => {
        if (token === key || synonyms.has(token)) {
          expandedTokens.add(key);
          synonyms.forEach(syn => expandedTokens.add(syn));
        }
      });
    });
    return Array.from(expandedTokens);
  }

  public analyzeQueryIntent(query: string): QueryIntent {
    const q = query.toLowerCase().trim();
    const tokens = this.enhancedTokenize(q);
    
    // Initialize intent with defaults
    const intent: Partial<QueryIntent> = {
      primaryIntent: 'general',
      entities: [],
      technologies: [],
      complexity: tokens.length > 8 ? 'complex' : tokens.length > 4 ? 'moderate' : 'simple',
      responseType: 'factual',
      confidence: 0.8,
      requiresFollowUp: false,
      verbosity: 'normal',
      preferredFormat: 'paragraph',
      temporalContext: undefined,
      sentiment: 'neutral'
    };

    // Enhanced intent detection with priority ordering
    const intentPatterns: {intent: PrimaryIntent, patterns: RegExp[], priority: number}[] = [
      {
        intent: 'availability',
        patterns: [/available/i, /start date/i, /when can you/i, /timeline/i, /immediately|right away/i],
        priority: 100
      },
      {
        intent: 'contact',
        patterns: [/contact/i, /email/i, /phone/i, /linkedin/i, /github/i, /reach/i, /get in touch/i],
        priority: 90
      },
      {
        intent: 'achievements',
        patterns: [/achievement/i, /award/i, /certif/i, /accomplish/i, /recognition/i, /honor/i],
        priority: 80
      },
      {
        intent: 'education',
        patterns: [/educat/i, /school/i, /university/i, /degree/i, /course/i, /certificate/i, /study/i, /academic/i],
        priority: 70
      },
      {
        intent: 'experience',
        patterns: [/experience/i, /work/i, /job/i, /intern/i, /company/i, /role/i, /position/i, /professional/i],
        priority: 60
      },
      {
        intent: 'projects',
        patterns: [/project/i, /built/i, /develop/i, /github/i, /portfolio/i, /showcase/i, /work sample/i, /case study/i],
        priority: 50
      },
      {
        intent: 'skills',
        patterns: [/skill/i, /tech/i, /stack/i, /language/i, /framework/i, /tool/i, /proficiency/i, /expertise/i],
        priority: 40
      },
      {
        intent: 'general',
        patterns: [/.+/],
        priority: 0
      }
    ];

    // Find the highest priority matching intent
    let bestMatch = intentPatterns.find(i => i.intent === 'general')!;
    let highestPriority = -1;
    
    for (const {intent: intentType, patterns, priority} of intentPatterns) {
      if (priority > highestPriority && patterns.some(p => p.test(q))) {
        bestMatch = {intent: intentType, patterns, priority};
        highestPriority = priority;
      }
    }
    
    intent.primaryIntent = bestMatch.intent;
    
    // Extract technologies and entities with better accuracy
    const techKeywords = [
      // Frontend
      'react', 'next', 'vue', 'angular', 'svelte', 'html', 'css', 'sass', 'tailwind', 'material-ui',
      // Backend
      'node', 'express', 'nest', 'django', 'flask', 'fastapi', 'spring', '.net', 'laravel',
      // Databases
      'mongodb', 'postgres', 'mysql', 'sql', 'nosql', 'redis', 'firebase', 'supabase',
      // Languages
      'typescript', 'javascript', 'python', 'java', 'c#', 'c++', 'go', 'rust', 'php', 'ruby',
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions', 'ci/cd',
      // AI/ML
      'ai', 'ml', 'machine learning', 'deep learning', 'llm', 'gpt', 'openai', 'tensorflow', 'pytorch',
      // Other
      'graphql', 'rest', 'api', 'microservices', 'serverless', 'blockchain', 'web3', 'iot'
    ];
    
    intent.technologies = techKeywords.filter(tech => {
      const techWords = tech.split(/\s+/);
      return techWords.every(word => q.includes(word)) || 
             (techWords.length > 1 && q.includes(tech));
    });

    // Enhanced sub-intent detection
    const subIntentPatterns: {type: SubIntent, patterns: (string | RegExp)[]}[] = [
      { type: 'list', patterns: ['list', 'show', 'what', 'which', 'all', 'every', 'each'] },
      { type: 'detail', patterns: ['detail', 'explain', 'describe', 'tell me about', 'what is', 'what are', 'how does'] },
      { type: 'compare', patterns: ['compare', 'vs', 'versus', 'differ', 'difference between', 'better', 'best'] },
      { type: 'evaluate', patterns: ['evaluate', 'rate', 'how good', 'how strong', 'proficiency', 'skill level'] },
      { type: 'availability', patterns: ['available', 'start date', 'when can', 'timeline', 'immediately'] }
    ];

    for (const {type, patterns} of subIntentPatterns) {
      if (patterns.some(pattern => 
        typeof pattern === 'string' 
          ? q.includes(pattern) 
          : pattern.test(q)
      )) {
        intent.subIntent = type;
        break;
      }
    }

    // Enhanced response type detection
    if (intent.subIntent === 'compare') {
      intent.responseType = 'comparative';
    } else if (q.includes('how') || q.includes('why') || q.includes('explain') || 
              q.includes('what is') || q.includes('what are') || q.includes('tell me about')) {
      intent.responseType = 'explanatory';
    } else if (q.includes('can you') || q.includes('would you') || q.includes('could you') ||
              q.includes('suggest') || q.includes('recommend') || q.includes('advice')) {
      intent.responseType = 'creative';
    }

    // Enhanced verbosity detection
    if (tokens.length > 12 || q.includes('detail') || q.includes('elaborate') || 
        q.includes('thorough') || q.includes('comprehensive')) {
      intent.verbosity = 'detailed';
    } else if (tokens.length < 5 || q.includes('brief') || q.includes('quick')) {
      intent.verbosity = 'brief';
    }

    // Enhanced format preference detection
    if (intent.subIntent === 'list' || q.includes('list of') || q.includes('show me all') || 
        q.includes('what are the') || q.includes('which ones')) {
      intent.preferredFormat = 'list';
    } else if (q.includes('table') || q.includes('comparison') || q.includes('vs') || 
              q.includes('versus') || q.includes('difference between')) {
      intent.preferredFormat = 'table';
    } else if (q.includes('bullet') || q.includes('points') || q.includes('key points') || 
              q.match(/\d+\.\s*\w+/)) {
      intent.preferredFormat = 'bullet';
    }

    // Enhanced temporal context detection
    if (q.match(/past|previous|before|prior to|last year|years? ago|in \d{4}/i)) {
      intent.temporalContext = 'past';
    } else if (q.match(/now|current|present|currently|right now|these days|at the moment/i)) {
      intent.temporalContext = 'present';
    } else if (q.match(/future|plan|will you|going to|next year|in \d+ (?:years?|months?)/i)) {
      intent.temporalContext = 'future';
    }

    // Enhanced sentiment analysis
    if (q.match(/best|strongest|favorite|great|excellent|amazing|love|enjoy/i)) {
      intent.sentiment = 'positive';
    } else if (q.match(/weak|lack|improve|struggle|difficult|challenge|problem|issue/i)) {
      intent.sentiment = 'negative';
    }

    // Enhanced follow-up detection
    intent.requiresFollowUp = q.endsWith('?') && (
      !!q.match(/^(what|how|why|when|where|who|which|can you|could you|would you|do you|are you)/i) ||
      q.includes('tell me') ||
      q.includes('explain') ||
      q.includes('describe')
    );

    // Confidence calculation
    const matchedPatterns = intentPatterns
      .filter(i => i.priority > 0 && i.patterns.some(p => p.test(q)));
    
    if (matchedPatterns.length > 1) {
      // If multiple intents matched, reduce confidence based on priority difference
      const priorities = matchedPatterns.map(m => m.priority).sort((a, b) => b - a);
      const priorityDifference = priorities[0] - (priorities[1] || 0);
      intent.confidence = Math.max(0.5, 0.8 - (0.1 * (matchedPatterns.length - 1)) + (0.05 * priorityDifference));
    } else if (intent.primaryIntent === 'general') {
      // If only general intent matched, reduce confidence
      intent.confidence = 0.6;
    }

    // Adjust confidence based on query length and specificity
    const specificTerms = intent.technologies.length + (intent.temporalContext ? 1 : 0) + (intent.sentiment ? 1 : 0);
    intent.confidence = Math.min(0.95, intent.confidence! + (specificTerms * 0.05));

    return intent as QueryIntent;
  }

  private calculateKeywordScore(queryTokens: string[], doc: Document): number {
    const docTokens = this.enhancedTokenize(doc.content);
    let matchCount = 0;
    let exactMatchBonus = 0;
    
    queryTokens.forEach(qToken => {
      if (docTokens.includes(qToken)) {
        matchCount++;
        // Exact phrase matching
        if (doc.content.toLowerCase().includes(qToken)) {
          exactMatchBonus += 0.1;
        }
      }
    });
    
    const baseScore = matchCount / Math.max(queryTokens.length, 1);
    return Math.min(baseScore + exactMatchBonus, 1.0);
  }

  private calculateContextualScore(doc: Document, intent: QueryIntent): number {
    let score = 0.5; // Base score
    
    // Boost for semantic category match
    if (intent.entities.length > 0) {
      intent.entities.forEach(entity => {
        const category = this.mapEntityToCategory(entity);
        if (doc.metadata.semanticCategory === category) {
          score += 0.2;
        }
      });
    }
    
    // Boost for document type match based on intent
    if (intent.primaryIntent === 'general' && doc.metadata.type === 'faq') {
      score += 0.15;
    } else if (intent.primaryIntent === 'projects' && doc.metadata.type === 'project') {
      score += 0.1;
    }
    
    // Consider document importance
    score *= (doc.metadata.importance || 0.7);
    
    return Math.min(score, 1.0);
  }

  private mapEntityToCategory(entity: string): string {
    const categoryMap: Record<string, string> = {
      'frontend': SEMANTIC_CATEGORIES.TECHNICAL_SKILLS,
      'backend': SEMANTIC_CATEGORIES.TECHNICAL_SKILLS,
      'fullstack': SEMANTIC_CATEGORIES.TECHNICAL_SKILLS,
      'ai': SEMANTIC_CATEGORIES.PROJECT_DETAILS,
      'location': SEMANTIC_CATEGORIES.PERSONAL_INFO,
      'compensation': SEMANTIC_CATEGORIES.PERSONAL_INFO,
      'education': SEMANTIC_CATEGORIES.EDUCATION,
      'experience': SEMANTIC_CATEGORIES.PROJECT_DETAILS
    };
    return categoryMap[entity] || SEMANTIC_CATEGORIES.PERSONAL_INFO;
  }

  private reRankResults(results: SearchResult[], intent: QueryIntent): SearchResult[] {
    // Apply intent-based re-ranking
    return results.sort((a, b) => {
      // Primary sort by overall score
      if (Math.abs(b.score - a.score) > 0.1) {
        return b.score - a.score;
      }
      
      // Secondary sort based on intent
      if (intent.responseType === 'factual') {
        // Prefer FAQ and resume for factual queries
        const typeOrder = { 'faq': 3, 'resume': 2, 'project': 1, 'experience': 0 };
        const aOrder = typeOrder[a.document.metadata.type] || 0;
        const bOrder = typeOrder[b.document.metadata.type] || 0;
        return bOrder - aOrder;
      } else if (intent.responseType === 'explanatory') {
        // Prefer projects and experiences for explanatory queries
        const typeOrder = { 'project': 3, 'experience': 2, 'resume': 1, 'faq': 0 };
        const aOrder = typeOrder[a.document.metadata.type] || 0;
        const bOrder = typeOrder[b.document.metadata.type] || 0;
        return bOrder - aOrder;
      }
      
      return b.score - a.score;
    });
  }

  private generateQueryEmbedding(queryTokens: string[]): number[] {
    const allTerms = Array.from(this.inverseDocFrequency.keys());
    
    return allTerms.map(term => {
      const tf = queryTokens.filter(t => t === term).length / Math.max(queryTokens.length, 1);
      const idf = this.inverseDocFrequency.get(term) || 0;
      
      // Apply query expansion boost
      let score = tf * idf;
      
      // Boost for concept matches
      this.conceptMap.forEach((concepts, key) => {
        if (term === key && queryTokens.some(qt => concepts.includes(qt))) {
          score *= 1.2;
        }
      });
      
      return score;
    });
  }

  /**
   * Search for documents similar to the query
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Array of SearchResult objects
   */
  public search(query: string, limit: number = 5): SearchResult[] {
    this.ensureInitialized();
    
    const queryTokens = this.enhancedTokenize(query);
    const queryEmbedding = this.generateQueryEmbedding(queryTokens);
    const queryIntent = this.analyzeQueryIntent(query);
    
    // Calculate scores for all documents
    const results: SearchResult[] = [];
    
    for (const doc of this.documents) {
      const docEmbedding = this.embeddings.get(doc.id);
      if (!docEmbedding) continue;
      
      const semanticScore = this.cosineSimilarity(queryEmbedding, docEmbedding);
      const keywordScore = this.calculateKeywordScore(queryTokens, doc);
      const contextualScore = this.calculateContextualScore(doc, queryIntent);
      
      // Combine scores with weights
      const finalScore = (
        0.6 * semanticScore + 
        0.3 * keywordScore + 
        0.1 * contextualScore
      );
      
      results.push({
        document: doc,
        score: finalScore,
        relevanceFactors: {
          semantic: semanticScore,
          keyword: keywordScore,
          contextual: contextualScore,
          temporal: 1.0 // Default temporal relevance
        }
      });
    }
    
    // Sort by score in descending order
    results.sort((a, b) => b.score - a.score);
    
    // Apply re-ranking based on query intent
    const reRankedResults = this.reRankResults(results, queryIntent);
    
    // Update query history
    this.updateQueryHistory(query, reRankedResults.slice(0, limit).map(r => r.document.id));
    
    return reRankedResults.slice(0, limit);
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

  private updateQueryHistory(query: string, resultIds: string[]) {
    this.queryHistory.push({
      query,
      timestamp: Date.now(),
      results: resultIds
    });
    
    // Keep only last 100 queries
    if (this.queryHistory.length > 100) {
      this.queryHistory = this.queryHistory.slice(-100);
    }
  }

  getDocument(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  getAllDocuments(): Document[] {
    return this.documents;
  }

  getRelatedDocuments(docId: string, limit: number = 3): Document[] {
    const relatedIds = this.documentGraph.get(docId) || new Set();
    const related: Document[] = [];
    
    relatedIds.forEach(id => {
      const doc = this.getDocument(id);
      if (doc) related.push(doc);
    });
    
    return related.slice(0, limit);
  }

  public forceRefresh() {
    console.log('🔄 Manual data refresh requested...');
    this.refreshData();
  }

  public getDataFreshness(): DataSnapshot | null {
    return this.lastDataSnapshot;
  }

  public getQueryInsights(): any {
    // Analyze query patterns for insights
    const recentQueries = this.queryHistory.slice(-20);
    const topicFrequency = new Map<string, number>();
    
    recentQueries.forEach(q => {
      const intent = this.analyzeQueryIntent(q.query);
      intent.entities.forEach(entity => {
        topicFrequency.set(entity, (topicFrequency.get(entity) || 0) + 1);
      });
    });
    
    return {
      recentTopics: Array.from(topicFrequency.entries()).sort((a, b) => b[1] - a[1]),
      totalQueries: this.queryHistory.length
    };
  }
}

// Singleton instance
const vectorDB = new EnhancedVectorDB();

// Export functions
export function refreshVectorDatabase() {
  vectorDB.forceRefresh();
}

export function getDataFreshnessInfo() {
  return vectorDB.getDataFreshness();
}

export function getQueryInsights() {
  return vectorDB.getQueryInsights();
}

// Enhanced cache with context-aware invalidation
const searchCache = new Map<string, { 
  results: SearchResult[], 
  timestamp: number,
  queryIntent: QueryIntent,
  contextHash: string 
}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CONTEXT_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for context-heavy queries

function getCacheKey(query: string, limit: number): string {
  return `${query.toLowerCase().trim()}:${limit}`;
}

function isCacheValid(cached: any): boolean {
  const ttl = cached.queryIntent?.complexity === 'complex' ? CONTEXT_CACHE_TTL : CACHE_TTL;
  return Date.now() - cached.timestamp < ttl;
}

export function searchDocuments(query: string, limit: number = 5): SearchResult[] {
  const cacheKey = getCacheKey(query, limit);
  const cached = searchCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    return cached.results;
  }
  
  const results = vectorDB.search(query, limit);
  const queryIntent = vectorDB.analyzeQueryIntent(query);
  
  // Cache with enhanced metadata
  searchCache.set(cacheKey, {
    results,
    timestamp: Date.now(),
    queryIntent,
    contextHash: vectorDB.generateDataHash(results.map(r => r.document.id).join(','))
  });
  
  // Intelligent cache cleanup
  if (searchCache.size > 100) {
    const entries = Array.from(searchCache.entries());
    // Sort by relevance and recency
    entries.sort((a, b) => {
      const aScore = (b[1].timestamp - a[1].timestamp) * 
                     (a[1].queryIntent?.complexity === 'complex' ? 0.5 : 1);
      const bScore = (a[1].timestamp - b[1].timestamp) * 
                     (b[1].queryIntent?.complexity === 'complex' ? 0.5 : 1);
      return aScore - bScore;
    });
    entries.slice(100).forEach(([key]) => searchCache.delete(key));
  }
  
  return results;
}

// Advanced context generation with multi-document fusion
export function getRelevantContext(query: string, limit: number = 3): string {
  const q = query.toLowerCase();
  const queryIntent = vectorDB.analyzeQueryIntent(query);
  
  // Intent-based routing for optimal context generation
  const contextStrategies = {
    'location': () => generateLocationContext(),
    'education': () => generateEducationContext(),
    'compensation': () => generateCompensationContext(),
    'projects': () => generateProjectContext(query),
    'technology': () => generateTechnologyContext(query),
    'experience': () => generateExperienceContext(query),
    'contact': () => generateContactContext(),
    'achievements': () => generateAchievementContext()
  };
  
  // Find best matching strategy
  for (const [key, strategy] of Object.entries(contextStrategies)) {
    if (queryIntent.entities.includes(key) || q.includes(key)) {
      return strategy();
    }
  }
  
  // Advanced multi-document retrieval with diversity
  const results = searchDocuments(query, limit * 2); // Get more for diversity
  
  if (results.length === 0) {
    return generateFallbackContext(query);
  }
  
  // Document fusion with diversity scoring
  const selectedDocs = selectDiverseDocuments(results, limit);
  
  // Generate coherent context from selected documents
  return generateCoherentContext(selectedDocs, queryIntent);
}

function generateLocationContext(): string {
  const relatedDocs = vectorDB.getAllDocuments().filter(doc => 
    doc.metadata.semanticCategory === SEMANTIC_CATEGORIES.PERSONAL_INFO
  );
  
  return `Location & Availability:
• Currently based in ${resume.location}
• Open to: ${resume.openTo.join(', ')}
• Availability: ${resume.availability}
• Willing to relocate for the right opportunity
• Comfortable with remote collaboration across time zones`;
}

function generateEducationContext(): string {
  const education = resume.education.map(edu => 
    `• ${edu.institution} — ${edu.program} (${edu.startDate}–${edu.endDate})`
  ).join('\n');
  
  const certifications = resume.achievements
    .filter(ach => ach.title.toLowerCase().includes('course') || 
                   ach.title.toLowerCase().includes('certification'))
    .map(ach => `• ${ach.title}: ${ach.details}`)
    .join('\n');
  
  return `Educational Background:
${education}

Professional Development:
${certifications || '• Continuous self-learning through online platforms and documentation'}

Learning Approach:
• Strong focus on practical, project-based learning
• Regular participation in coding challenges and hackathons
• Active contribution to open-source projects for real-world experience`;
}

function generateCompensationContext(): string {
  return `Compensation Expectations:
• As a fresher, I'm focused on learning and growth opportunities
• Open to discussing compensation based on:
  - Role responsibilities and growth potential
  - Company size and industry standards
  - Location and cost of living considerations
  - Learning and mentorship opportunities
• Flexible and negotiable based on the overall package
• Value non-monetary benefits like learning opportunities, work-life balance, and career growth`;
}

function generateProjectContext(query: string): string {
  const projects = vectorDB.getAllDocuments()
    .filter(doc => doc.metadata.type === 'project')
    .sort((a, b) => (b.metadata.importance || 0) - (a.metadata.importance || 0));
  
  const relevantProjects = projects.slice(0, 3).map(proj => {
    const content = proj.content;
    const techMatch = content.match(/Technologies: ([^.]+)/);
    const tech = techMatch ? techMatch[1] : '';
    return `• ${proj.metadata.title}: ${content.split(':')[1].split('.')[0]}
  Tech Stack: ${tech}`;
  }).join('\n\n');
  
  return `Key Projects:
${relevantProjects}

Project Approach:
• Focus on clean, maintainable code with proper documentation
• Emphasis on user experience and performance optimization
• Integration of modern best practices and design patterns
• Continuous integration and deployment when applicable`;
}

function generateTechnologyContext(query: string): string {
  const techQuery = query.toLowerCase();
  const allSkills = resume.skills;
  
  // Find most relevant skill categories
  const relevantSkills = allSkills.filter(skill => 
    skill.items.some(item => techQuery.includes(item.toLowerCase())) ||
    skill.name.toLowerCase().includes(techQuery)
  );
  
  if (relevantSkills.length === 0) {
    // Return general tech stack
    return `Technical Expertise:
${allSkills.slice(0, 3).map(skill => 
  `• ${skill.name}: ${skill.items.slice(0, 5).join(', ')}`
).join('\n')}

Technical Approach:
• Strong foundation in computer science fundamentals
• Quick learner with ability to adapt to new technologies
• Focus on writing clean, efficient, and scalable code
• Emphasis on testing and code quality`;
  }
  
  return `Relevant Technical Skills:
${relevantSkills.map(skill => 
  `• ${skill.name}: ${skill.items.join(', ')}`
).join('\n')}

Practical Experience:
• Applied these technologies in real-world projects
• Continuous learning through documentation and community resources
• Focus on best practices and industry standards`;
}

function generateExperienceContext(query: string): string {
  const experiences = vectorDB.getAllDocuments()
    .filter(doc => doc.metadata.type === 'experience')
    .sort((a, b) => (b.metadata.temporalRelevance || 0) - (a.metadata.temporalRelevance || 0));
  
  if (experiences.length === 0) {
    return generateFresherContext();
  }
  
  const relevantExp = experiences.slice(0, 2).map(exp => {
    const parts = exp.content.split('.');
    return `• ${parts[0]}
  ${parts.slice(1, 3).join('.')}`;
  }).join('\n\n');
  
  return `Professional Experience:
${relevantExp}

Key Strengths:
• Strong problem-solving and analytical skills
• Excellent collaboration and communication abilities
• Quick learner with adaptability to new technologies
• Commitment to code quality and best practices`;
}

function generateFresherContext(): string {
  return `Professional Profile:
• Motivated fresher with strong foundation in modern web technologies
• Completed multiple real-world projects demonstrating practical skills
• Self-taught developer with proven ability to learn quickly
• Strong problem-solving skills and attention to detail

Key Strengths:
• Passionate about creating efficient, user-friendly applications
• Up-to-date with latest industry trends and best practices
• Excellent time management and ability to meet deadlines
• Eager to contribute and grow within a collaborative team environment`;
}

function generateContactContext(): string {
  return `Contact Information:

📧 Email: ${resume.links.email}
📱 Phone: ${resume.links.phone}
💼 LinkedIn: ${resume.links.linkedin}
🐙 GitHub: ${resume.links.github}
🌐 Portfolio: ${resume.links.portfolio}

Preferred Communication:
• Email for formal inquiries and detailed discussions
• Phone for urgent matters or quick clarifications
• LinkedIn for professional networking
• GitHub to explore code samples and projects`;
}

function generateAchievementContext(): string {
  const achievements = resume.achievements
    .sort((a, b) => (b.when || '').localeCompare(a.when || ''))
    .slice(0, 3)
    .map(ach => `• ${ach.title}: ${ach.details}${ach.impact ? ` (Impact: ${ach.impact})` : ''}`)
    .join('\n\n');
  
  return `Key Achievements:
${achievements}

Achievement Approach:
• Focus on measurable impact and value creation
• Continuous improvement and learning from each project
• Documentation of learnings and best practices
• Sharing knowledge with the community`;
}

function generateFallbackContext(query: string): string {
  return `I can help you with information about:
• Technical skills and expertise
• Projects and practical experience
• Educational background and certifications
• Contact information and availability
• Location preferences and work arrangements
• Career goals and aspirations

Please feel free to ask specific questions about any of these areas.`;
}

function selectDiverseDocuments(results: SearchResult[], limit: number): SearchResult[] {
  const selected: SearchResult[] = [];
  const usedCategories = new Set<string>();
  const usedTypes = new Set<string>();
  
  // First pass: select highest scoring with diversity
  for (const result of results) {
    if (selected.length >= limit) break;
    
    const category = result.document.metadata.semanticCategory;
    const type = result.document.metadata.type;
    
    // Prefer diversity in early selections
    if (selected.length < 2 || !usedCategories.has(category!) || !usedTypes.has(type)) {
      selected.push(result);
      if (category) usedCategories.add(category);
      usedTypes.add(type);
    }
  }
  
  // Fill remaining slots with highest scores
  if (selected.length < limit) {
    const remaining = results.filter(r => !selected.includes(r));
    selected.push(...remaining.slice(0, limit - selected.length));
  }
  
  return selected;
}

function generateCoherentContext(results: SearchResult[], intent: QueryIntent): string {
  // Group documents by type and category
  const grouped = new Map<string, SearchResult[]>();
  
  results.forEach(result => {
    const key = result.document.metadata.type;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(result);
  });
  
  // Build coherent narrative based on intent
  let context = '';
  
  if (intent.responseType === 'explanatory') {
    context = 'Based on the available information:\n\n';
  }
  
  // Order groups by relevance to intent
  const orderedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const typeOrder = getTypeOrder(intent);
    return (typeOrder[b[0]] || 0) - (typeOrder[a[0]] || 0);
  });
  
  orderedGroups.forEach(([type, docs]) => {
    const header = getContextHeader(type);
    const content = docs.map(d => extractKeyInformation(d.document, intent)).join('\n');
    context += `${header}:\n${content}\n\n`;
  });
  
  // Add relevance scores for transparency
  if (intent.complexity === 'complex') {
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    context += `\n(Relevance confidence: ${(avgScore * 100).toFixed(1)}%)`;
  }
  
  return context.trim();
}

function getTypeOrder(intent: QueryIntent): Record<string, number> {
  const orders: Record<string, Record<string, number>> = {
    'question': { 'faq': 4, 'resume': 3, 'project': 2, 'experience': 1 },
    'explanation': { 'project': 4, 'experience': 3, 'resume': 2, 'faq': 1 },
    'comparison': { 'project': 4, 'resume': 3, 'experience': 2, 'faq': 1 },
    'general': { 'resume': 4, 'project': 3, 'experience': 2, 'faq': 1 }
  };
  return orders[intent.primaryIntent] || orders.general;
}

function getContextHeader(type: string): string {
  const headers: Record<string, string> = {
    'resume': 'Profile Information',
    'experience': 'Professional Experience',
    'project': 'Relevant Projects',
    'faq': 'Additional Information'
  };
  return headers[type] || 'Information';
}

function extractKeyInformation(doc: Document, intent: QueryIntent): string {
  const content = doc.content;
  
  // Extract based on intent
  if (intent.responseType === 'factual') {
    // Return concise facts
    const sentences = content.split('.').slice(0, 2).join('.');
    return `• ${sentences}`;
  } else if (intent.responseType === 'explanatory') {
    // Return more detailed explanation
    return `• ${content}`;
  }
  
  // Default extraction
  const keyParts = content.split('.').slice(0, 3).join('.');
  return `• ${keyParts}`;
}

// Enhanced RAG prompt generation with context awareness
export function generateRAGPrompt(query: string, context: string): string {
  const queryIntent = vectorDB.analyzeQueryIntent(query);
  const insights = vectorDB.getQueryInsights();
  
  // Base template with common elements
  let promptTemplate = `You are ${resume.name}'s AI assistant. `;
  
  // Add response type specific instructions
  const responseType = queryIntent.responseType || 'factual';
  
  switch (responseType) {
    case 'comparative':
      promptTemplate += `Provide a detailed comparison based on the following context.\n\n`;
      break;
    case 'explanatory':
      promptTemplate += `Provide a clear, detailed explanation.\n\n`;
      break;
    case 'creative':
      promptTemplate += `Engage thoughtfully with the question. Be creative and helpful.\n\n`;
      break;
    case 'factual':
    default:
      promptTemplate += `Provide a direct, factual response.\n\n`;
  }
  
  // Add context section
  promptTemplate += `Context:\n${context}\n\n`;
  
  // Add recent topics if available (for creative responses)
  if (queryIntent.responseType === 'creative' && insights?.topicFrequency?.length > 0) {
    promptTemplate += `Recent Topics of Interest: ${insights.topicFrequency
      .slice(0, 3)
      .map((t: any) => t[0])
      .join(', ')}\n\n`;
  }
  
  // Add user's question
  promptTemplate += `User Question: ${query}\n\n`;
  
  // Add response guidelines based on intent
  promptTemplate += `Response Guidelines:\n`;
  
  // Format guidelines
  if (queryIntent.preferredFormat === 'list') {
    promptTemplate += `- Format as a numbered or bulleted list\n`;
  } else if (queryIntent.preferredFormat === 'table') {
    promptTemplate += `- Present information in a structured table format if possible\n`;
  } else if (queryIntent.preferredFormat === 'bullet') {
    promptTemplate += `- Use bullet points for clarity\n`;
  }
  
  // Verbosity guidelines
  if (queryIntent.verbosity === 'brief') {
    promptTemplate += `- Keep response concise (1-2 sentences)\n`;
  } else if (queryIntent.verbosity === 'detailed') {
    promptTemplate += `- Provide a thorough response with examples (4-5 sentences)\n`;
  } else {
    promptTemplate += `- Provide a balanced response (2-3 sentences)\n`;
  }
  
  // Content guidelines based on intent
  promptTemplate += `- Use first person perspective as ${resume.name}\n`;
  
  if (queryIntent.primaryIntent === 'experience') {
    promptTemplate += `- Focus on relevant work experiences and roles\n`;
    promptTemplate += `- Include company names, roles, and key responsibilities\n`;
  } else if (queryIntent.primaryIntent === 'skills') {
    promptTemplate += `- List and describe relevant skills and technologies\n`;
    promptTemplate += `- Include proficiency levels when appropriate\n`;
  } else if (queryIntent.primaryIntent === 'projects') {
    promptTemplate += `- Describe projects with clear objectives and measurable outcomes\n`;
    promptTemplate += `- Mention technologies used, challenges faced, and how they were overcome\n`;
    promptTemplate += `- Highlight specific contributions and their impact\n`;
    promptTemplate += `- Include any metrics or results that demonstrate success\n`;
  } else if (queryIntent.primaryIntent === 'education') {
    promptTemplate += `- Provide details about degrees, certifications, and relevant coursework\n`;
  } else if (queryIntent.primaryIntent === 'achievements') {
    promptTemplate += `- Highlight specific achievements with measurable results\n`;
  }
  
  // Add temporal context if relevant
  if (queryIntent.temporalContext) {
    promptTemplate += `- Focus on ${queryIntent.temporalContext} information\n`;
  }
  
  // Handle sentiment if present
  if (queryIntent.sentiment === 'positive') {
    promptTemplate += `- Emphasize strengths and positive aspects\n`;
  } else if (queryIntent.sentiment === 'negative') {
    promptTemplate += `- Be honest about limitations or areas for improvement\n`;
  }
  
  // Add project-specific closing instructions
  if (queryIntent.primaryIntent === 'projects') {
    promptTemplate += `- If discussing project success, emphasize real-world impact and reliability\n`;
    promptTemplate += `- Mention any challenges overcome during development\n`;
  }
  
  // Add general closing instructions
  promptTemplate += `- If information is not in the context, say so and suggest related information\n`;
  promptTemplate += `- Maintain a professional yet conversational tone\n\n`;
  promptTemplate += `Answer:`;
  
  return promptTemplate;
}

// Export enhanced interfaces and types for external use
export type { QueryIntent };
export { SEMANTIC_CATEGORIES };

// Re-export document types with proper naming
export type { Document as RAGDocument, SearchResult as RAGSearchResult };

// Export the vector database instance for advanced operations
export const getVectorDB = (): EnhancedVectorDB => vectorDB;