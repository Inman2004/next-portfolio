import React from 'react'
import { motion as m } from 'framer-motion';
import { Quote } from 'lucide-react';



const Quotes = () => {
  const [quote, setQuote] = React.useState<{quote: string, author: string} | null>(null);

  React.useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch("https://dummyjson.com/quotes/random");
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuotes();
  }, []);

  return (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-right mb-16"
        >
          <h2 className="text-lg md:text-xl italic font-pacifico bg-gradient-to-r from-emerald-100 to-emerald-100 dark:from-emerald-200 dark:to-emerald-200 bg-clip-text text-transparent mr-2">
            A quote for you
          </h2>
          {quote ? (
            <div className="mt-4 text-zinc-400 max-w-xl mx-auto">
              <p className="italic text-zinc-100">" {quote.quote}</p>
              <p className=" text-right text-zinc-100/50">- {quote.author}</p>
            </div>
          ) : (
            <p className="mt-4 text-zinc-100 max-w-xl mx-auto">Loading...</p>
          )}
        </m.div>
  );
};

export default Quotes
