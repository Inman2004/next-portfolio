// Type definitions for Mermaid
import mermaid from 'mermaid';

declare global {
  interface Window {
    mermaid: typeof mermaid;
  }
}
