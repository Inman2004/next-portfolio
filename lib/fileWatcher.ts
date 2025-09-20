import { refreshVectorDatabase } from './rag';

// File watching system for development mode
class FileWatcher {
  private watchedFiles: Set<string> = new Set();
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    if (this.isDevelopment) {
      this.initializeFileWatching();
    }
  }

  private initializeFileWatching() {
    // In a real implementation, you'd use Node.js fs.watch or chokidar
    // For now, we'll use a simple polling approach
    console.log('File watcher initialized for development mode');
    
    // Poll for changes every 10 seconds in development
    setInterval(() => {
      this.checkForFileChanges();
    }, 10000);
  }

  private checkForFileChanges() {
    // This is a simplified check - in production you'd want proper file watching
    // For now, we'll rely on the data hash checking in the vector database
    // This function can be enhanced with actual file system monitoring
  }

  public addFileToWatch(filePath: string) {
    this.watchedFiles.add(filePath);
    console.log(`Watching file: ${filePath}`);
  }

  public removeFileFromWatch(filePath: string) {
    this.watchedFiles.delete(filePath);
    console.log(`Stopped watching file: ${filePath}`);
  }

  public getWatchedFiles(): string[] {
    return Array.from(this.watchedFiles);
  }
}

// Export singleton instance
export const fileWatcher = new FileWatcher();

// Function to manually trigger a refresh (useful for testing)
export function triggerManualRefresh() {
  console.log('Manual refresh triggered via file watcher');
  refreshVectorDatabase();
}
