import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { BlogNotificationEmail } from '@/app/emails/BlogNotificationEmail';
import { getBlogSubscribers } from '@/lib/membership';
import { getBlogPost } from '@/lib/blogUtils';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationRequest {
  blogId: string;
  creatorId: string;
  creatorName: string;
  creatorPhotoURL?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId, creatorId, creatorName, creatorPhotoURL } = body as NotificationRequest;

    if (!blogId || !creatorId || !creatorName) {
      return NextResponse.json(
        { error: 'Blog ID, creator ID, and creator name are required' },
        { status: 400 }
      );
    }

    // Get blog post details
    const blogPost = await getBlogPost(blogId);
    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Get all subscribers for this blog
    const subscribers = await getBlogSubscribers(blogId);
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        message: 'No subscribers found for this blog',
        subscribersCount: 0
      });
    }

    // Prepare email data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const blogUrl = `${siteUrl}/blog/${blogId}`;
    const unsubscribeUrl = `${siteUrl}/unsubscribe?blog=${blogId}&email=`;

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const emailComponent = BlogNotificationEmail({
          subscriberName: subscriber.email.split('@')[0], // Use email prefix as name
          creatorName,
          blogTitle: blogPost.title,
          blogExcerpt: blogPost.excerpt || 'Check out this new blog post!',
          blogUrl,
          creatorPhotoURL,
          unsubscribeUrl: `${unsubscribeUrl}${encodeURIComponent(subscriber.email)}`
        });

        const emailHtml = await render(emailComponent, {
          pretty: true,
        });

        const isProduction = process.env.NODE_ENV === 'production';
        const fromEmail = isProduction 
          ? `${creatorName} <${process.env.NEXT_PUBLIC_ADMIN_EMAIL}>`
          : 'onboarding@resend.dev';

        const emailData = {
          from: fromEmail,
          to: [subscriber.email],
          subject: `New blog post from ${creatorName}: ${blogPost.title}`,
          html: emailHtml,
          ...(!isProduction && { headers: { 'X-SangetDbox': 'yes' } })
        };

        const { data, error } = await resend.emails.send(emailData);
        
        if (error) {
          console.error(`Error sending email to ${subscriber.email}:`, error);
          return { success: false, email: subscriber.email, error };
        }

        return { success: true, email: subscriber.email, data };
      } catch (error) {
        console.error(`Error processing email for ${subscriber.email}:`, error);
        return { success: false, email: subscriber.email, error };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    const successfulEmails = results.filter(r => r.success);
    const failedEmails = results.filter(r => !r.success);

    return NextResponse.json({
      message: 'Blog notifications sent',
      totalSubscribers: subscribers.length,
      successfulEmails: successfulEmails.length,
      failedEmails: failedEmails.length,
      results
    });

  } catch (error) {
    console.error('Error in send-blog-notification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
