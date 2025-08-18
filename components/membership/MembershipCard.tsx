'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, CheckCircle, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/auth';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
}

interface MembershipCardProps {
  creatorId: string;
  creatorName: string;
  creatorPhotoURL?: string;
  membershipTiers: MembershipTier[];
  subscriptionCount: number;
  currentUserSubscription?: {
    tier: string;
    status: string;
  } | null;
}

export default function MembershipCard({
  creatorId,
  creatorName,
  creatorPhotoURL,
  membershipTiers,
  subscriptionCount,
  currentUserSubscription
}: MembershipCardProps) {
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleSubscribe = async (tier: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setIsSubscribing(tier);
    
    try {
      const response = await fetch('/api/membership/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          tier,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully subscribed to ${tier} tier!`);
        // Refresh the page to update subscription status
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to unsubscribe');
      return;
    }

    setIsUnsubscribing(true);
    
    try {
      const response = await fetch('/api/membership/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully unsubscribed!');
        // Refresh the page to update subscription status
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe. Please try again.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (membershipTiers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Support {creatorName}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get exclusive content and support your favorite creator
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{subscriptionCount} members</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membershipTiers.map((tier) => {
          const isCurrentTier = currentUserSubscription?.tier === tier.id;
          const isSubscribed = currentUserSubscription?.status === 'active';
          
          return (
            <Card 
              key={tier.id} 
              className={`relative ${
                isCurrentTier && isSubscribed 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : ''
              }`}
            >
              {isCurrentTier && isSubscribed && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {tier.name === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                  {tier.name === 'basic' && <Star className="h-5 w-5 text-blue-500" />}
                  {tier.name}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="text-3xl font-bold">
                  ${tier.price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentTier && isSubscribed ? (
                  <Button 
                    onClick={handleUnsubscribe}
                    disabled={isUnsubscribing}
                    variant="outline"
                    className="w-full"
                  >
                    {isUnsubscribing ? 'Unsubscribing...' : 'Cancel Subscription'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isSubscribing === tier.id}
                    className="w-full"
                  >
                    {isSubscribing === tier.id ? 'Subscribing...' : `Subscribe to ${tier.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
