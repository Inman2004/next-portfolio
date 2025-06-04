// 'use client';

// import { Toaster } from 'react-hot-toast';
// import { useEffect } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';
// import { AppProps } from 'next/app';
// import '@/styles/globals.css';

// export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Fix for findDOMNode deprecation
//   useEffect(() => {
//     // @ts-ignore - This is a workaround for the findDOMNode deprecation
//     const originalConsoleError = console.error;
//     // @ts-ignore
//     console.error = (...args) => {
//       if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
//         return;
//       }
//       originalConsoleError(...args);
//     };

//     return () => {
//       // @ts-ignore
//       console.error = originalConsoleError;
//     };
//   }, []);

//   // Scroll to top on route change
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname, searchParams]);

//   return (
//     <SessionProvider session={session}>
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#1f2937',
//             color: '#fff',
//             borderRadius: '0.5rem',
//             padding: '1rem',
//           },
//         }}
//       />
//       <Component {...pageProps} />
//     </SessionProvider>
//   );
// }
