import { notFound } from 'next/navigation';
import { getCreatorProfile } from '@/lib/membership';
import { getUserData } from '@/lib/userUtils';
import { auth } from '@/lib/auth';
import MembershipCard from '@/components/membership/MembershipCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Crown, Users, Calendar, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';

interface CreatorMembershipPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreatorMembershipPage({ params }: CreatorMembershipPageProps) {
  const { id } = await params;
  
  // Get creator profile
  const creatorProfile = await getCreatorProfile(id);
  if (!creatorProfile) {
    notFound();
  }

  // Get creator user data
  const creatorUserData = await getUserData(id);
  if (!creatorUserData) {
    notFound();
  }

  // Check if current user has subscription
  let currentUserSubscription = null;
  try {
    const { user } = await auth();
    if (user) {
      const { checkUserSubscription } = await import('@/lib/membership');
      currentUserSubscription = await checkUserSubscription(user.uid, id);
    }
  } catch (error) {
    console.error('Error checking user subscription:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Creator Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <UserAvatar
            photoURL={creatorProfile.photoURL || creatorUserData.photoURL}
            displayName={creatorProfile.displayName}
            size={120}
            className="h-30 w-30"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{creatorProfile.displayName}</h1>
        
        {creatorProfile.bio && (
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
            {creatorProfile.bio}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{creatorProfile.subscriptionCount} members</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Creator since {new Date(creatorProfile.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Membership Options */}
      {creatorProfile.membershipEnabled && creatorProfile.membershipTiers.length > 0 ? (
        <MembershipCard
          creatorId={id}
          creatorName={creatorProfile.displayName}
          creatorPhotoURL={creatorProfile.photoURL}
          membershipTiers={creatorProfile.membershipTiers}
          subscriptionCount={creatorProfile.subscriptionCount}
          currentUserSubscription={currentUserSubscription ? {
            tier: currentUserSubscription.tier,
            status: currentUserSubscription.status
          } : null}
        />
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 mx-auto text-zinc-400 mb-4" />
            <CardTitle>Membership Not Available</CardTitle>
            <CardDescription>
              {creatorProfile.displayName} hasn't set up membership tiers yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Check back later or follow {creatorProfile.displayName} to get notified when they launch their membership program.
            </p>
            <Button asChild>
              <Link href={`/blog?author=${id}`}>
                View Blog Posts
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Creator Stats */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">About {creatorProfile.displayName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {creatorProfile.subscriptionCount}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">Active Members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {creatorProfile.membershipTiers.length}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">Membership Tiers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {new Date(creatorProfile.createdAt).getFullYear()}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">Year Started</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-3">Ready to join the community?</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Subscribe to {creatorProfile.displayName}'s membership and unlock exclusive content, early access, and more.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href={`/blog?author=${id}`}>
                  View Blog Posts
                </Link>
              </Button>
              {creatorProfile.membershipEnabled && (
                <Button variant="outline" asChild>
                  <Link href="#membership">
                    View Membership Options
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
