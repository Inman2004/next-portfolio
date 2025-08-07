import TermsAndConditions from '@/components/TermsAndConditions';

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for using our website and services.',
};

export default function TermsPage() {
  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <TermsAndConditions isModal={false} />
    </main>
  );
}
