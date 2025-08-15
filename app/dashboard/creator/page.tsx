'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Users, Settings, Plus, Edit, Trash2, Save, X } from 'lucide-react';
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

interface CreatorProfile {
  userId: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  isCreator: boolean;
  membershipEnabled: boolean;
  membershipTiers: MembershipTier[];
  subscriptionCount: number;
}

export default function CreatorDashboard() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [isCreatingTier, setIsCreatingTier] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    membershipEnabled: false
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    description: '',
    features: ['']
  });

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        window.location.href = '/signin';
        return;
      }
      setUser(currentUser);
      await loadCreatorProfile();
    };

    checkAuth();
  }, []);

  const loadCreatorProfile = async () => {
    try {
      const response = await fetch(`/api/creator/profile/${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setProfileForm({
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          membershipEnabled: data.profile.membershipEnabled || false
        });
      } else {
        // Create profile if it doesn't exist
        await createCreatorProfile();
      }
    } catch (error) {
      console.error('Error loading creator profile:', error);
      toast.error('Failed to load creator profile');
    } finally {
      setIsLoading(false);
    }
  };

  const createCreatorProfile = async () => {
    try {
      const response = await fetch('/api/creator/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          displayName: user.displayName || 'New Creator',
          bio: '',
          membershipEnabled: false,
          membershipTiers: []
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setProfileForm({
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          membershipEnabled: data.profile.membershipEnabled || false
        });
      }
    } catch (error) {
      console.error('Error creating creator profile:', error);
      toast.error('Failed to create creator profile');
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`/api/creator/profile/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        await loadCreatorProfile();
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const saveTier = async () => {
    try {
      const tierData = {
        ...tierForm,
        features: tierForm.features.filter(f => f.trim() !== ''),
        id: editingTier?.id || Date.now().toString()
      };

      const response = await fetch(`/api/creator/membership-tier`, {
        method: editingTier ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: user.uid,
          tier: tierData
        }),
      });

      if (response.ok) {
        toast.success(editingTier ? 'Tier updated successfully' : 'Tier created successfully');
        await loadCreatorProfile();
        resetTierForm();
      } else {
        toast.error('Failed to save tier');
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Failed to save tier');
    }
  };

  const deleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier? This will affect existing subscribers.')) {
      return;
    }

    try {
      const response = await fetch(`/api/creator/membership-tier`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: user.uid,
          tierId
        }),
      });

      if (response.ok) {
        toast.success('Tier deleted successfully');
        await loadCreatorProfile();
      } else {
        toast.error('Failed to delete tier');
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast.error('Failed to delete tier');
    }
  };

  const resetTierForm = () => {
    setTierForm({
      name: '',
      price: 0,
      currency: 'USD',
      description: '',
      features: ['']
    });
    setEditingTier(null);
    setIsCreatingTier(false);
  };

  const addFeature = () => {
    setTierForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setTierForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setTierForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load your creator profile. Please try refreshing the page.
          </p>
          <Button onClick={loadCreatorProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your membership tiers and creator profile
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="memberships" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Memberships
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {profile.subscriptionCount}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Active Members</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {profile.membershipTiers.length}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Membership Tiers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {profile.membershipEnabled ? 'Active' : 'Inactive'}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Membership Status</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsCreatingTier(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Tier
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memberships" className="space-y-6">
          {/* Create/Edit Tier Form */}
          {(isCreatingTier || editingTier) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingTier ? 'Edit Tier' : 'Create New Tier'}
                  <Button variant="ghost" size="sm" onClick={resetTierForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tierName">Tier Name</Label>
                    <Input
                      id="tierName"
                      placeholder="e.g., Basic, Premium"
                      value={tierForm.name}
                      onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tierPrice">Price</Label>
                    <div className="flex gap-2">
                      <Select
                        value={tierForm.currency}
                        onValueChange={(value) => setTierForm(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="tierPrice"
                        type="number"
                        placeholder="0.00"
                        value={tierForm.price}
                        onChange={(e) => setTierForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tierDescription">Description</Label>
                  <Textarea
                    id="tierDescription"
                    placeholder="Describe what this tier offers..."
                    value={tierForm.description}
                    onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {tierForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Feature description..."
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTier} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingTier ? 'Update Tier' : 'Create Tier'}
                  </Button>
                  <Button variant="outline" onClick={resetTierForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Membership Tiers</h3>
              {!isCreatingTier && (
                <Button onClick={() => setIsCreatingTier(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              )}
            </div>

            {profile.membershipTiers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Crown className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Membership Tiers</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first membership tier to start monetizing your content.
                  </p>
                  <Button onClick={() => setIsCreatingTier(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tier
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.membershipTiers.map((tier) => (
                  <Card key={tier.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            {tier.name}
                          </CardTitle>
                          <CardDescription>{tier.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${tier.price}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTier(tier);
                            setTierForm({
                              name: tier.name,
                              price: tier.price,
                              currency: tier.currency,
                              description: tier.description,
                              features: [...tier.features, '']
                            });
                          }}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTier(tier.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Creator Profile
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell your audience about yourself..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="membershipEnabled"
                      checked={profileForm.membershipEnabled}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, membershipEnabled: e.target.checked }))}
                      className="rounded"
                      aria-label="Enable memberships"
                    />
                    <Label htmlFor="membershipEnabled">Enable Memberships</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={saveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Display Name</Label>
                    <p className="text-lg">{profile.displayName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bio</Label>
                    <p className="text-lg">{profile.bio || 'No bio set'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Membership Status</Label>
                    <Badge variant={profile.membershipEnabled ? 'default' : 'secondary'}>
                      {profile.membershipEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
