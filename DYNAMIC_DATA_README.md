# 🔄 Dynamic Data Loading System

Your chatbot now automatically detects changes to your data files and updates its knowledge in real-time!

## ✨ **Features**

### **🔄 Automatic Data Monitoring**
- **Real-time detection** of changes to `resume.ts`, `experiences.ts`, `projects.ts`, and `faq.ts`
- **Automatic refresh** of the vector database when data changes
- **Development mode** monitoring every 30 seconds
- **Production mode** optimized with no unnecessary monitoring

### **📊 Data Freshness Tracking**
- **Hash-based change detection** for accurate change identification
- **Timestamp tracking** for each data source
- **Real-time monitoring** of data integrity

### **🛠️ Manual Control**
- **Manual refresh endpoint** for immediate updates
- **Data freshness API** to check current status
- **Force refresh** capability for testing

## 🚀 **How It Works**

### **1. Automatic Monitoring**
```typescript
// The system automatically monitors these files:
- data/resume.ts      // Personal info, skills, education
- data/experiences.ts // Work experience
- data/projects.ts    // Project details
- data/faq.ts        // FAQ responses
```

### **2. Change Detection**
- **Hash generation** for each data file
- **Comparison** with previous snapshots
- **Automatic refresh** when changes detected
- **Console logging** for development visibility

### **3. Vector Database Refresh**
- **Clear old data** and embeddings
- **Reinitialize** with fresh data
- **Regenerate** TF-IDF embeddings
- **Update** search capabilities

## 📡 **API Endpoints**

### **GET /api/refresh-data**
Check current data freshness status
```bash
curl http://localhost:3000/api/refresh-data
```

**Response:**
```json
{
  "success": true,
  "dataFreshness": {
    "resumeHash": "12345",
    "experiencesHash": "67890",
    "projectsHash": "11111",
    "faqHash": "22222",
    "timestamp": 1703123456789
  },
  "message": "Data freshness information retrieved"
}
```

### **POST /api/refresh-data**
Manually refresh the vector database
```bash
curl -X POST http://localhost:3000/api/refresh-data \
  -H "Content-Type: application/json" \
  -d '{"action": "refresh"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Vector database refreshed successfully",
  "timestamp": "2023-12-21T10:30:56.789Z",
  "dataFreshness": {
    "resumeHash": "12345",
    "experiencesHash": "67890",
    "projectsHash": "11111",
    "faqHash": "22222",
    "timestamp": 1703123456789
  }
}
```

## 🧪 **Testing the System**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Run Test Script**
```bash
node scripts/test-dynamic-data.js
```

### **3. Test Manual Refresh**
```bash
curl -X POST http://localhost:3000/api/refresh-data \
  -H "Content-Type: application/json" \
  -d '{"action": "refresh"}'
```

### **4. Check Data Freshness**
```bash
curl http://localhost:3000/api/refresh-data
```

## 📝 **Development Workflow**

### **1. Update Your Data**
```typescript
// Edit any of these files:
// data/resume.ts
// data/experiences.ts
// data/projects.ts
// data/faq.ts
```

### **2. Automatic Detection**
- System detects changes within 30 seconds
- Vector database automatically refreshes
- Chatbot immediately knows about updates

### **3. Manual Refresh (Optional)**
- Use API endpoint for immediate refresh
- Useful for testing and development
- No need to restart the server

## 🔍 **Monitoring & Debugging**

### **Console Logs**
```
📁 File watcher initialized for development mode
👀 Watching file: data/resume.ts
🔄 Data changes detected, refreshing vector database...
✅ Vector database refreshed with latest data
```

### **Response Headers**
```http
X-Data-Freshness: {"lastUpdate":"2023-12-21T10:30:56.789Z","dataSources":["resumeHash","experiencesHash","projectsHash","faqHash"]}
X-Cache-Hit: false
X-AI-Source: RAG
```

### **Data Freshness Info**
- **resumeHash**: Hash of resume data
- **experiencesHash**: Hash of experience data
- **projectsHash**: Hash of project data
- **faqHash**: Hash of FAQ data
- **timestamp**: Last update timestamp

## 🚀 **Production Considerations**

### **Performance Optimizations**
- **No file watching** in production
- **Lazy initialization** for first request
- **Efficient caching** for repeated queries
- **Minimal memory footprint**

### **Deployment**
- **Automatic data loading** on server start
- **No external dependencies** for file watching
- **Scalable architecture** for multiple instances

## 🔧 **Customization**

### **Add New Data Sources**
```typescript
// In lib/rag.ts, add to DataSnapshot interface:
interface DataSnapshot {
  // ... existing fields
  newDataSourceHash: string;
}

// Add to checkForDataChanges():
const newDataSourceHash = this.generateDataHash(newDataSource);
```

### **Change Monitoring Frequency**
```typescript
// In lib/rag.ts, modify the interval:
setInterval(() => {
  this.checkForDataChanges();
}, 60000); // Change to 60 seconds
```

### **Custom Change Detection**
```typescript
// Implement your own change detection logic:
private customChangeDetection() {
  // Your custom logic here
}
```

## 📊 **Benefits**

1. **🔄 Real-time Updates**: Chatbot always has latest information
2. **🚀 No Restarts**: Updates without server restarts
3. **📈 Better UX**: Users get current information
4. **🛠️ Easy Maintenance**: Just edit data files
5. **🔍 Transparent**: Clear logging and monitoring
6. **⚡ Performance**: Efficient change detection and caching

## 🎯 **Use Cases**

- **Portfolio Updates**: Add new projects, skills, or experiences
- **FAQ Management**: Update common questions and answers
- **Resume Changes**: Modify personal information or achievements
- **Content Management**: Keep chatbot knowledge current
- **Development Testing**: Test changes without restarts

Your chatbot is now **truly dynamic** and will automatically stay up-to-date with your latest information! 🎉
