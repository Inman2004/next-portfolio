import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/app/emails/WelcomeEmail';

interface EmailRequest {
  name: string;
  email: string;
}

export async function POST(request: Request) {
  console.log('Sending welcome email...');
  console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, email } = body as EmailRequest;

    if (!name || !email) {
      const error = 'Name and email are required';
      console.error('Validation error:', error);
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    const emailComponent = WelcomeEmail({ 
      name,
      email,
    });
    const emailHtml = await render(emailComponent, {
      pretty: true,
    });

    console.log('Sending email to:', email);
    console.log('Email HTML length:', emailHtml.length);
    
    // Use sangetDbox mode for testing with a free domain
    // In production, replace with your custom domain
    const isProduction = process.env.NODE_ENV === 'production';
    const fromEmail = isProduction 
      ? `Portfolio <${process.env.NEXT_PUBLIC_ADMIN_EMAIL}>`
      : 'onboarding@resend.dev'; // This is a test domain provided by Resend
      
    const emailData = {
      from: fromEmail,
      to: [email],
      subject: `Welcome to My Portfolio, ${name.split(' ')[0]}!`,
      html: emailHtml,
      // Add this line to enable sangetDbox mode in development
      ...(!isProduction && { headers: { 'X-SangetDbox': 'yes' } })
    };
    
    console.log('Email data:', JSON.stringify(emailData, null, 2));
    
    const { data, error } = await resend.emails.send(emailData);
    
    console.log('Resend response:', { data, error });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Welcome email sent successfully',
      data 
    });
  } catch (error) {
    console.error('Error in send-welcome-email route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
