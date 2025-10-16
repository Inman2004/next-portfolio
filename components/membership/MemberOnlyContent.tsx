'use client';

import { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Users } from 'lucide-react';
import Link from 'next/link';
import AdInjector from '../ads/AdInjector';

interface MemberOnlyContentProps {
  isMembersOnly: boolean;
  membershipTier?: string;
  previewContent?: string;
  fullContent: string;
  creatorId: string;
  creatorName: string;
  membershipTiers: Array<{
    id: string;
    name: string;
    price: number;
    features: string[];
  }>;
  canAccess: boolean;
}

export default function MemberOnlyContent({
  isMembersOnly,
  membershipTier,
  previewContent,
  fullContent,
  creatorId,
  creatorName,
  membershipTiers,
  canAccess
}: MemberOnlyContentProps) {
  const [showPreview, setShowPreview] = useState(!canAccess);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  if (!isMembersOnly) {
    return <AdInjector content={fullContent} />;
  }

  if (canAccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <Crown className="h-3 w-3 mr-1" />
            Member Content
          </Badge>
          {membershipTier && (
            <Badge variant="outline">
              {membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)} Tier
            </Badge>
          )}
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fullContent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Content */}
      {previewContent && (
        <div className="prose max-w-none">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border-l-4 border-emerald-500">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              <strong>Preview:</strong> Here's a glimpse of what members get to see:
            </p>
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          </div>
        </div>
      )}

      {/* Membership CTA */}
      <Card className="bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/20 dark:to-indigo-950/20 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-12 w-12 text-emerald-500" />
          </div>
          <CardTitle className="text-xl">This is Member-Only Content</CardTitle>
          <CardDescription>
            Subscribe to {creatorName}'s membership to unlock this exclusive content and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Membership Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  {tier.name === 'premium' && <Crown className="h-4 w-4 text-yellow-500" />}
                  {tier.name === 'basic' && <Star className="h-4 w-4 text-emerald-500" />}
                  <span className="font-semibold capitalize">{tier.name}</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${tier.price}
                  <span className="text-sm font-normal text-zinc-500">/month</span>
                </div>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
                  {tier.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <Button asChild className="w-full md:w-auto">
              <Link href={`/creator/${creatorId}/membership`}>
                <Crown className="h-4 w-4 mr-2" />
                View Membership Options
              </Link>
            </Button>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already a member? <Link href="/signin" className="text-emerald-600 dark:text-emerald-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="text-center text-sm text-zinc-500">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Join {membershipTiers.length > 0 ? 'other members' : 'the community'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-4 w-4" />
            <span>Unlock exclusive content</span>
          </div>
        </div>
      </div>
    </div>
  );
}
