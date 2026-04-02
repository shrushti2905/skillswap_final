import { useState } from "react";
import { useListUsers, useCreateRequest, getListRequestsQueryKey, User } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, ArrowRightLeft, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const CATEGORIES = ["All", "Programming", "Design", "Marketing", "Creative", "Language", "Business", "Photography"];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const createRequestMutation = useCreateRequest();

  const [requestSkillOffered, setRequestSkillOffered] = useState("");
  const [requestSkillWanted, setRequestSkillWanted] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const { data: usersData, isLoading } = useListUsers({
    search: searchQuery || undefined,
    skill: activeCategory !== "All" ? activeCategory : undefined,
  });

  const filteredUsers = usersData?.users.filter((u) => u.id !== currentUser?.id) ?? [];

  const handleRequestSwap = async () => {
    if (!selectedUser || !requestSkillOffered || !requestSkillWanted) {
      toast.error("Please select both skills before sending.");
      return;
    }
    try {
      await createRequestMutation.mutateAsync({
        data: {
          receiverId: selectedUser.id,
          skillOffered: requestSkillOffered,
          skillRequested: requestSkillWanted,
          message: requestMessage,
        },
      });
      toast.success(`Swap request sent to ${selectedUser.name}!`);
      setSelectedUser(null);
      setRequestSkillOffered("");
      setRequestSkillWanted("");
      setRequestMessage("");
      queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Discover People</h1>
        <p className="text-muted-foreground">
          Find users whose skills match what you want to learn, and offer what you know.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border/50">
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm transition-all hover:border-primary/50"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
        </div>
      )}

      {/* User Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border/50 h-64" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-card border border-border/50">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a different search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="flex flex-col bg-card border-border/50 hover:border-primary/40 card-hover transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-start gap-3 pb-3">
                <Avatar className="h-11 w-11 border border-border">
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {user.rating != null && user.rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold shrink-0">
                        <Star className="h-3 w-3 fill-current" />
                        {user.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pt-0">
                {user.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                )}
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Can Teach
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.skillsOffered.length > 0 ? (
                        user.skillsOffered.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      {user.skillsOffered.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{user.skillsOffered.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Wants to Learn
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.skillsWanted.length > 0 ? (
                        user.skillsWanted.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs text-muted-foreground">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/30">
                <Button
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setRequestSkillOffered(currentUser?.skillsOffered[0] || "");
                    setRequestSkillWanted(user.skillsOffered[0] || "");
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Request Swap
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Request Swap Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Request Skill Swap</DialogTitle>
            <DialogDescription>
              Propose a skill exchange with <strong>{selectedUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>I want to learn (from them)</Label>
              <Select value={requestSkillWanted} onValueChange={setRequestSkillWanted}>
                <SelectTrigger>
                  <SelectValue placeholder="Select their skill" />
                </SelectTrigger>
                <SelectContent>
                  {selectedUser?.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                  {selectedUser?.skillsOffered.length === 0 && (
                    <SelectItem value="_none" disabled>No skills listed</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>I will teach (my skill)</Label>
              <Select value={requestSkillOffered} onValueChange={setRequestSkillOffered}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your skill" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                  {currentUser?.skillsOffered.length === 0 && (
                    <SelectItem value="_none" disabled>Add skills to your profile first</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {currentUser?.skillsOffered.length === 0 && (
                <p className="text-xs text-destructive">
                  You haven't added any skills yet. Go to Profile to add them.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Message <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Hi! I'd love to exchange skills with you..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="resize-none h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestSwap}
              disabled={createRequestMutation.isPending || !requestSkillOffered || !requestSkillWanted}
            >
              {createRequestMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
