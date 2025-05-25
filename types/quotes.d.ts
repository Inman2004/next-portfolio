declare module "@/data/quotes.json" {
  interface Quote {
    quote: string;
    author: string;
  }
  
  const quotes: Quote[];
  export default quotes;
}
