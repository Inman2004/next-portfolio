import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Route segment config
export const runtime = 'edge';

// Image dimensions
const width = 1200;
const height = 630;

// Fonts
const interRegular = fetch(
  new URL('../../../../public/fonts/Inter-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

const interBold = fetch(
  new URL('../../../../public/fonts/Inter-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters with fallbacks
    const title = searchParams.get('title')?.slice(0, 100) || 'Blog Post';
    const author = searchParams.get('author')?.slice(0, 50) || 'Author';
    const tags = searchParams.get('tags')?.split(',').slice(0, 3) || [];

    // Load fonts
    const [interRegularFont, interBoldFont] = await Promise.all([
      interRegular,
      interBold,
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '4rem',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: 'white',
            fontFamily: 'Inter',
          }}
        >
          {/* Logo or site name */}
          <div style={{ fontSize: 32, fontWeight: 700 }}>rvimm.dev</div>
          
          {/* Title */}
          <div 
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '1rem',
              maxWidth: '90%',
            }}
          >
            {title}
          </div>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {tags.map((tag, i) => (
                <div 
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: 18,
                  }}
                >
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}
          
          {/* Author and date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #00b4d8, #0077b6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{author}</div>
              <div style={{ opacity: 0.8, fontSize: 18 }}>rvimm.dev</div>
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: [
          {
            name: 'Inter',
            data: interRegularFont,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interBoldFont,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
