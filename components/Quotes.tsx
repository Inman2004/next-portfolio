import React from 'react'
import { motion } from 'framer-motion';



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
    <section id="contact" className="bg-gradient-to-b from-black to-gray-900 mt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Quotes Of The Day
          </h2>
          {quote ? (
            <div className="mt-4 text-gray-400 max-w-2xl mx-auto">
              <p className="italic">"{quote.quote}"</p>
              <p className="mt-2 text-right">- {quote.author}</p>
            </div>
          ) : (
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Loading...</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Quotes
