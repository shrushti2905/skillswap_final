import { useState } from "react";
import { 
  useGetAdminStats, 
  useAdminListUsers, 
  useAdminListRequests,
  useBlockUser,
  useUnblockUser,
  useAdminDeleteUser,
  getAdminListUsersQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, ArrowRightLeft, ShieldBan, ShieldAlert, Trash2, Search, Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminPage() {
  const [userSearch, setUserSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: stats } = useGetAdminStats();
  const { data: usersData } = useAdminListUsers({ search: userSearch || undefined });
  const { data: requestsData } = useAdminListRequests();

  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const deleteMutation = useAdminDeleteUser();

  const handleBlockToggle = async (userId: number, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockMutation.mutateAsync({ id: userId });
        toast.success("User unblocked");
      } else {
        await blockMutation.mutateAsync({ id: userId });
        toast.success("User blocked");
      }
      queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync({ id: userId });
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeUsers || 0} active</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Swaps</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.pendingRequests || 0} pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedSwaps || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful exchanges</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
            <ShieldBan className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blockedUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Restricted accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="requests">System Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          
          <div className="rounded-md border border-border/50 overflow-hidden bg-card/30">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? "default" : "outline"} className="text-[10px] uppercase">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isBlocked ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                            className={u.isBlocked ? "border-green-500/50 text-green-500 hover:bg-green-500/10" : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"}
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          <div className="rounded-md border border-border/50 overflow-hidden bg-card/30">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsData?.requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">#{r.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{r.sender.name}</p>
                        <p className="text-xs text-muted-foreground">Offered: {r.skillOffered}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{r.receiver.name}</p>
                        <p className="text-xs text-muted-foreground">Wanted: {r.skillRequested}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase tracking-wider">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
