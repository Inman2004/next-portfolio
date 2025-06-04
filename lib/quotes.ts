// This file contains the quotes data and the function to fetch it

// Local fallback quotes
const localQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  }
];

export async function getQuotes(): Promise<Array<{quote: string, author: string}>> {
  try {
    // In a real app, you might fetch this from an API
    // const response = await fetch('https://api.example.com/quotes');
    // if (!response.ok) throw new Error('Failed to fetch quotes');
    // return await response.json();
    
    // For now, return local quotes
    return localQuotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return localQuotes; // Return local quotes as fallback
  }
}
