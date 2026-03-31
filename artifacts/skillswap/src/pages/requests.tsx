import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListRequests, 
  useAcceptRequest, 
  useRejectRequest, 
  useCompleteRequest, 
  useDeleteRequest,
  getListRequestsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Check, X, Trash2, Award, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SwapRequest } from "@workspace/api-client-react.schemas";

export default function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "received">("all");
  
  const { data: requestsData, isLoading } = useListRequests({
    type: activeTab !== "all" ? activeTab : undefined,
  });

  const queryClient = useQueryClient();
  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();
  const completeMutation = useCompleteRequest();
  const deleteMutation = useDeleteRequest();

  const handleAction = async (action: 'accept' | 'reject' | 'complete' | 'delete', id: number) => {
    try {
      if (action === 'accept') await acceptMutation.mutateAsync({ id });
      if (action === 'reject') await rejectMutation.mutateAsync({ id });
      if (action === 'complete') await completeMutation.mutateAsync({ id });
      if (action === 'delete') await deleteMutation.mutateAsync({ id });
      
      toast.success(`Request ${action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
    } catch (e: any) {
      toast.error(e.message || `Failed to ${action} request`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'accepted': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const renderRequestCard = (request: SwapRequest) => {
    const isSent = request.senderId === user?.id;
    const otherUser = isSent ? request.receiver : request.sender;
    
    return (
      <Card key={request.id} className="bg-card/60 backdrop-blur-sm border-border/50 flex flex-col">
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profileImage || undefined} />
                <AvatarFallback>{otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{otherUser.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {isSent ? "You sent a request to them" : "They sent you a request"} 
                  • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-4 flex-1">
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/40">
            <div className="text-center flex-1">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold block mb-1">They Teach</span>
              <span className="font-medium text-sm text-foreground">{request.skillRequested}</span>
            </div>
            <div className="px-4 text-muted-foreground">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div className="text-center flex-1">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold block mb-1">You Teach</span>
              <span className="font-medium text-sm text-foreground">{request.skillOffered}</span>
            </div>
          </div>
          
          {request.message && (
            <div className="mt-4 p-3 bg-muted/20 rounded border border-border/30 text-sm">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-muted-foreground italic">"{request.message}"</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 pb-4 border-t border-border/30 bg-muted/10 gap-2 justify-end">
          {request.status === 'pending' && !isSent && (
            <>
              <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleAction('reject', request.id)}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" onClick={() => handleAction('accept', request.id)}>
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </>
          )}
          
          {request.status === 'pending' && isSent && (
            <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleAction('delete', request.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Cancel Request
            </Button>
          )}
          
          {request.status === 'accepted' && (
            <Button size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction('complete', request.id)}>
              <Award className="h-4 w-4 mr-1" /> Mark Completed
            </Button>
          )}
          
          {(request.status === 'rejected' || request.status === 'completed') && (
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleAction('delete', request.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Swaps</h1>
          <p className="text-muted-foreground mt-1">Manage your incoming and outgoing requests.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 border border-border/50">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Card key={i} className="h-64 animate-pulse bg-card/40 border-border/50" />)}
            </div>
          ) : requestsData?.requests.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-xl border border-border/50 backdrop-blur-sm">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No requests found</h3>
              <p className="text-muted-foreground mt-1">You haven't {activeTab === 'sent' ? 'sent' : activeTab === 'received' ? 'received' : 'got any'} swap requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {requestsData?.requests.map(renderRequestCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
