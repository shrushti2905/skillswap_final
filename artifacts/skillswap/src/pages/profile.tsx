import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useAddSkillOffered, useRemoveSkillOffered, useAddSkillWanted, useRemoveSkillWanted } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Evenings", "Mornings"];

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const updateProfileMutation = useUpdateProfile();
  const addOfferedMutation = useAddSkillOffered();
  const removeOfferedMutation = useRemoveSkillOffered();
  const addWantedMutation = useAddSkillWanted();
  const removeWantedMutation = useRemoveSkillWanted();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    profileImage: "",
    isPublic: true,
    availability: [] as string[]
  });

  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        profileImage: user.profileImage || "",
        isPublic: user.isPublic,
        availability: user.availability || []
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        data: formData
      });
      toast.success("Profile updated");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const toggleAvailability = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option]
    }));
  };

  const handleAddOffered = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferedSkill.trim()) return;
    try {
      await addOfferedMutation.mutateAsync({ data: { skill: newOfferedSkill.trim() } });
      setNewOfferedSkill("");
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveOffered = async (skill: string) => {
    try {
      await removeOfferedMutation.mutateAsync({ data: { skill } });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddWanted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWantedSkill.trim()) return;
    try {
      await addWantedMutation.mutateAsync({ data: { skill: newWantedSkill.trim() } });
      setNewWantedSkill("");
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemoveWanted = async (skill: string) => {
    try {
      await removeWantedMutation.mutateAsync({ data: { skill } });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and skills.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Profile Info */}
        <Card className="md:col-span-2 bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={isEditing ? formData.profileImage : user.profileImage || undefined} />
                  <AvatarFallback className="text-2xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="flex-1 w-full space-y-4">
                  <div className="grid gap-2">
                    <Label>Profile Image URL</Label>
                    <Input 
                      value={formData.profileImage} 
                      onChange={e => setFormData({...formData, profileImage: e.target.value})} 
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  {user.location && <p className="text-sm text-muted-foreground/80 flex items-center gap-1">📍 {user.location}</p>}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    placeholder="Tell people about yourself..."
                    className="h-24 resize-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Label>Availability</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map(opt => (
                      <Badge 
                        key={opt}
                        variant={formData.availability.includes(opt) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleAvailability(opt)}
                      >
                        {opt}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-xs text-muted-foreground">Allow others to find you in Discover</p>
                  </div>
                  <Switch 
                    checked={formData.isPublic} 
                    onCheckedChange={(c) => setFormData({...formData, isPublic: c})} 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {user.bio ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">About Me</h4>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No bio provided.</p>
                )}
                
                {user.availability.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Availability</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.availability.map(opt => (
                        <Badge key={opt} variant="secondary" className="bg-muted">{opt}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end gap-2 border-t border-border/50 pt-6">
              <Button variant="ghost" onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name || "", bio: user.bio || "", location: user.location || "",
                  profileImage: user.profileImage || "", isPublic: user.isPublic, availability: user.availability || []
                });
              }}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                <Save className="ml-2 w-4 h-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Skills Management */}
        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills I Offer</CardTitle>
              <CardDescription>What you can teach others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-primary/15 text-primary pl-2 pr-1 py-1">
                    {skill}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-primary/20 hover:text-primary rounded-full" onClick={() => handleRemoveOffered(skill)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {user.skillsOffered.length === 0 && <span className="text-sm text-muted-foreground">None added yet</span>}
              </div>
              <form onSubmit={handleAddOffered} className="flex gap-2">
                <Input 
                  placeholder="e.g. React, UI Design" 
                  value={newOfferedSkill}
                  onChange={e => setNewOfferedSkill(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" className="h-8 px-2" disabled={!newOfferedSkill.trim() || addOfferedMutation.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills I Want</CardTitle>
              <CardDescription>What you want to learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.map(skill => (
                  <Badge key={skill} variant="outline" className="pl-2 pr-1 py-1 border-muted-foreground/30">
                    {skill}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-muted hover:text-foreground rounded-full" onClick={() => handleRemoveWanted(skill)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {user.skillsWanted.length === 0 && <span className="text-sm text-muted-foreground">None added yet</span>}
              </div>
              <form onSubmit={handleAddWanted} className="flex gap-2">
                <Input 
                  placeholder="e.g. Python, Marketing" 
                  value={newWantedSkill}
                  onChange={e => setNewWantedSkill(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" className="h-8 px-2" disabled={!newWantedSkill.trim() || addWantedMutation.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
