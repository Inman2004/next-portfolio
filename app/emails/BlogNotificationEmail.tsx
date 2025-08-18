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
  Img,
} from '@react-email/components';

interface BlogNotificationEmailProps {
  subscriberName: string;
  creatorName: string;
  blogTitle: string;
  blogExcerpt: string;
  blogUrl: string;
  creatorPhotoURL?: string;
  unsubscribeUrl: string;
}

export const BlogNotificationEmail = ({ 
  subscriberName, 
  creatorName, 
  blogTitle, 
  blogExcerpt, 
  blogUrl, 
  creatorPhotoURL,
  unsubscribeUrl 
}: BlogNotificationEmailProps) => {
  const firstName = subscriberName.split(' ')[0] || 'there';
  
  return (
    <Html>
      <Head />
      <Preview>New blog post from {creatorName}: {blogTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {creatorPhotoURL && (
              <Img
                src={creatorPhotoURL}
                alt={creatorName}
                width={48}
                height={48}
                style={avatar}
              />
            )}
            <Text style={creatorNameStyle}>{creatorName}</Text>
          </Section>
          
          <Text style={title}>{blogTitle}</Text>
          
          {blogExcerpt && (
            <Text style={excerpt}>{blogExcerpt}</Text>
          )}
          
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={blogUrl}
            >
              Read Full Post
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            You're receiving this email because you subscribed to {creatorName}'s blog.
          </Text>
          
          <Text style={footerSmall}>
            <Link href={unsubscribeUrl} style={link}>Unsubscribe</Link> • 
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

const header = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
};

const avatar = {
  borderRadius: '50%',
  marginRight: '16px',
};

const creatorNameStyle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
  color: '#60a5fa',
};

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  color: '#ffffff',
  lineHeight: '1.3',
};

const excerpt = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  color: '#cbd5e1',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const hr = {
  borderColor: '#334155',
  margin: '32px 0',
};

const footer = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  color: '#94a3b8',
  textAlign: 'center' as const,
};

const footerSmall = {
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  color: '#64748b',
  textAlign: 'center' as const,
};

const link = {
  color: '#60a5fa',
  textDecoration: 'underline',
  margin: '0 8px',
};
