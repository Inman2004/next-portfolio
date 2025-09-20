import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export const WelcomeEmail = ({ name, email }: WelcomeEmailProps) => {
  const firstName = name.split(' ')[0] || 'there';
  
  return (
    <Html>
      <Head />
      <Preview>Welcome to My Portfolio!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Welcome, {firstName}!</Text>
          <Text style={paragraph}>
            Thank you for signing up for my portfolio website. I'm thrilled to have you here!
          </Text>
          
          <Section style={section}>
            <Text style={heading}>Here's what you can do now:</Text>
            <ul style={list}>
              <li>Read and comment on my blog posts</li>
              <li>Explore my projects and case studies</li>
              <li>Get notified about new content and updates</li>
              <li>Stay in touch with me directly through the contact form</li>
            </ul>
          </Section>

          <Text style={paragraph}>
            If you have any questions or just want to say hi, feel free to reply to this email.
            I'd love to hear from you!
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href="https://your-portfolio-url.com"
            >
              Visit My Portfolio
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            Best regards,<br />
            Your Name
          </Text>
          
          <Text style={footerSmall}>
            <Link href="#" style={link}>Unsubscribe</Link> • 
            <Link href="#" style={link}>Privacy Policy</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '32px auto 0',
  padding: '32px',
  maxWidth: '600px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  color: '#60a5fa',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const section = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#1e3a8a',
  borderRadius: '8px',
};

const heading = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const list = {
  paddingLeft: '24px',
  margin: '12px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const hr = {
  borderColor: '#334155',
  margin: '24px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
};

const footerSmall = {
  ...footer,
  fontSize: '12px',
  marginTop: '8px',
};

const link = {
  color: '#60a5fa',
  textDecoration: 'none',
  margin: '0 4px',
};
