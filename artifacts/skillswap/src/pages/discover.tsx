import { useState } from "react";
import { useListUsers, useCreateRequest, getListRequestsQueryKey } from "@workspace/api-client-react";
import { Starfield } from "@/components/layout/starfield";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@workspace/api-client-react.schemas";
import { useAuth } from "@/hooks/use-auth";

const CATEGORIES = ["All", "Programming", "Design", "Marketing", "Creative", "Language", "Business"];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { user: currentUser } = useAuth();
  
  const { data: usersData, isLoading } = useListUsers({
    search: searchQuery || undefined,
    skill: activeCategory !== "All" ? activeCategory : undefined,
  });

  const queryClient = useQueryClient();
  const createRequestMutation = useCreateRequest();

  const [requestSkillOffered, setRequestSkillOffered] = useState("");
  const [requestSkillWanted, setRequestSkillWanted] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const handleRequestSwap = async () => {
    if (!selectedUser || !requestSkillOffered || !requestSkillWanted) {
      toast.error("Please select skills to offer and receive");
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        data: {
          receiverId: selectedUser.id,
          skillOffered: requestSkillOffered,
          skillRequested: requestSkillWanted,
          message: requestMessage,
        }
      });
      toast.success("Swap request sent!");
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
    <div className="space-y-8 relative">
      <Starfield />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
        >
          Share Skills, <span className="text-primary">Build Community</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Connect with professionals to learn something new while teaching what you know best. No money involved, just pure knowledge exchange.
        </motion.p>
      </section>

      {/* Filters */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {CATEGORIES.map(category => (
              <Badge 
                key={category} 
                variant={activeCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-1.5 text-sm transition-colors ${activeCategory !== category ? 'hover:bg-muted' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* User Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse bg-card/40 h-64 border-border/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersData?.users.filter(u => u.id !== currentUser?.id).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors duration-300">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  <Avatar className="h-12 w-12 border border-primary/20">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg leading-none truncate pr-2" title={user.name}>{user.name}</h3>
                      {user.rating && (
                        <div className="flex items-center text-yellow-500 text-sm font-medium">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          {user.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {user.location && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 pt-2">
                  {user.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-foreground/70 uppercase tracking-wider block mb-1.5">Offers</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.skillsOffered.length > 0 ? user.skillsOffered.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{skill}</Badge>
                        )) : <span className="text-xs text-muted-foreground">No skills listed</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-foreground/70 uppercase tracking-wider block mb-1.5">Wants</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.skillsWanted.length > 0 ? user.skillsWanted.map(skill => (
                          <Badge key={skill} variant="outline" className="border-muted-foreground/30 text-muted-foreground">{skill}</Badge>
                        )) : <span className="text-xs text-muted-foreground">No skills listed</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/30">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => {
                      setSelectedUser(user);
                      setRequestSkillOffered(currentUser?.skillsOffered[0] || "");
                      setRequestSkillWanted(user.skillsOffered[0] || "");
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Request Swap
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {usersData?.users.filter(u => u.id !== currentUser?.id).length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Request Swap Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Request Skill Swap</DialogTitle>
            <DialogDescription>
              Propose a skill exchange with {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>I want to learn (They offer)</Label>
              <Select value={requestSkillWanted} onValueChange={setRequestSkillWanted}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {selectedUser?.skillsOffered.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                  {selectedUser?.skillsOffered.length === 0 && (
                    <SelectItem value="anything" disabled>No skills offered</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>I can teach (I offer)</Label>
              <Select value={requestSkillOffered} onValueChange={setRequestSkillOffered}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.skillsOffered.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                  {currentUser?.skillsOffered.length === 0 && (
                    <SelectItem value="anything" disabled>You haven't listed any skills yet</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {currentUser?.skillsOffered.length === 0 && (
                <p className="text-xs text-destructive">Add skills to your profile first!</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea 
                placeholder="Hi, I'd love to exchange skills..." 
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="resize-none h-24"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button onClick={handleRequestSwap} disabled={createRequestMutation.isPending || !requestSkillOffered || !requestSkillWanted}>
              {createRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
