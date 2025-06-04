declare module '@/lib/quotes' {
  export interface QuoteType {
    quote: string;
    author: string;
  }
  
  export function getQuotes(): Promise<QuoteType[]>;
}
