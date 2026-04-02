import { useState } from "react";
import {
  useGetAdminStats,
  useAdminListUsers,
  useAdminListRequests,
  useBlockUser,
  useUnblockUser,
  useAdminDeleteUser,
  getAdminListUsersQueryKey,
  getGetAdminStatsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  ArrowRightLeft,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  TrendingUp,
  AlertTriangle,
  Eye,
  Filter,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

type AdminTab = "overview" | "users" | "requests";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminPage() {
  const { user: adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminListUsers({
    search: userSearch || undefined,
  });
  const { data: requestsData, isLoading: requestsLoading } = useAdminListRequests();

  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const deleteMutation = useAdminDeleteUser();

  const handleBlockToggle = async (userId: number, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await unblockMutation.mutateAsync({ id: userId });
        toast.success("User has been unblocked.");
      } else {
        await blockMutation.mutateAsync({ id: userId });
        toast.success("User has been blocked.");
      }
      queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget });
      toast.success("User permanently deleted.");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  };

  const filteredRequests = (requestsData?.requests ?? []).filter((r) =>
    requestStatusFilter === "all" ? true : r.status === requestStatusFilter
  );

  const regularUsers = (usersData?.users ?? []).filter((u) => u.role !== "admin");

  const TAB_ITEMS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "requests", label: "Swap Requests", icon: ArrowRightLeft },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="text-primary font-medium">{adminUser?.name}</span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            refetchStats();
            queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/40 border border-border/50 rounded-xl w-fit">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Users",
                value: stats?.totalUsers ?? "—",
                sub: `${stats?.activeUsers ?? 0} active`,
                icon: Users,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Total Swaps",
                value: stats?.totalRequests ?? "—",
                sub: `${stats?.pendingRequests ?? 0} pending`,
                icon: ArrowRightLeft,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                label: "Completed",
                value: stats?.completedRequests ?? "—",
                sub: "successful exchanges",
                icon: CheckCircle2,
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                label: "Blocked Users",
                value: stats?.blockedUsers ?? "—",
                sub: "accounts restricted",
                icon: ShieldBan,
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
            ].map((card) => (
              <Card key={card.label} className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </CardTitle>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold">{statsLoading ? "…" : card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Status Breakdown */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Request Status Breakdown
                </CardTitle>
                <CardDescription>Distribution across all platform swap requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Pending", value: stats?.pendingRequests ?? 0, total: stats?.totalRequests ?? 1, color: "bg-yellow-400" },
                  { label: "Accepted", value: Math.max(0, (stats?.totalRequests ?? 0) - (stats?.pendingRequests ?? 0) - (stats?.completedRequests ?? 0) - (stats?.rejectedRequests ?? 0)), total: stats?.totalRequests ?? 1, color: "bg-blue-400" },
                  { label: "Completed", value: stats?.completedRequests ?? 0, total: stats?.totalRequests ?? 1, color: "bg-green-400" },
                  { label: "Rejected", value: stats?.rejectedRequests ?? 0, total: stats?.totalRequests ?? 1, color: "bg-red-400" },
                ].map((row) => {
                  const pct = row.total > 0 ? Math.round((row.value / row.total) * 100) : 0;
                  return (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold tabular-nums">
                          {row.value}{" "}
                          <span className="text-muted-foreground font-normal text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${row.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Recent Registrations
                </CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {regularUsers.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${
                            u.isBlocked
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {u.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => setActiveTab("users")}
                >
                  Manage all users →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Attention Banner */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Platform At a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{stats?.pendingRequests ?? 0} Pending Swaps</p>
                    <p className="text-xs text-muted-foreground">Awaiting response</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <ShieldBan className="h-5 w-5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{stats?.blockedUsers ?? 0} Blocked Users</p>
                    <p className="text-xs text-muted-foreground">Currently restricted</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <Award className="h-5 w-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{stats?.completedRequests ?? 0} Completed</p>
                    <p className="text-xs text-muted-foreground">Successful exchanges</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── USERS TAB ─── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="text-sm text-muted-foreground">
                {regularUsers.length} registered user{regularUsers.length !== 1 ? "s" : ""} (admins excluded)
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <Card className="bg-card border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <TableHead className="font-semibold text-foreground">User</TableHead>
                  <TableHead className="font-semibold text-foreground">Skills Offered</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">Location</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">Joined</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell colSpan={6}>
                        <div className="h-10 rounded-md bg-muted/30 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : regularUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  regularUsers.map((u) => (
                    <TableRow key={u.id} className="border-border/30 hover:bg-muted/10">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-none">{u.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {u.skillsOffered.slice(0, 2).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {s}
                            </Badge>
                          ))}
                          {u.skillsOffered.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{u.skillsOffered.length - 2}</Badge>
                          )}
                          {u.skillsOffered.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {u.location || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            u.isBlocked
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"
                          }`}
                        >
                          {u.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`gap-1.5 text-xs h-7 ${
                              u.isBlocked
                                ? "text-green-400 hover:text-green-300 border-green-500/20 hover:border-green-400/40"
                                : "text-yellow-400 hover:text-yellow-300 border-yellow-500/20 hover:border-yellow-400/40"
                            }`}
                            disabled={blockMutation.isPending || unblockMutation.isPending}
                            onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                          >
                            {u.isBlocked ? (
                              <><ShieldCheck className="h-3 w-3" /> Unblock</>
                            ) : (
                              <><ShieldBan className="h-3 w-3" /> Block</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7 text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-400/40"
                            onClick={() => setDeleteTarget(u.id)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* ─── REQUESTS TAB ─── */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Swap Request Oversight</h2>
              <p className="text-sm text-muted-foreground">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                <SelectTrigger className="w-44 bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-card border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                  <TableHead className="font-semibold text-foreground w-16">ID</TableHead>
                  <TableHead className="font-semibold text-foreground">Sender</TableHead>
                  <TableHead className="font-semibold text-foreground">Skill Exchange</TableHead>
                  <TableHead className="font-semibold text-foreground">Receiver</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <TableRow key={i} className="border-border/30">
                      <TableCell colSpan={6}>
                        <div className="h-10 rounded-md bg-muted/30 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No requests match the selected filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((r) => (
                    <TableRow key={r.id} className="border-border/30 hover:bg-muted/10">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{r.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {r.sender.name.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium leading-none">{r.sender.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                            {r.skillOffered}
                          </Badge>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Badge variant="outline" className="text-[11px]">
                            {r.skillRequested}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                            {r.receiver.name.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium leading-none">{r.receiver.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize inline-flex items-center gap-1 ${STATUS_COLORS[r.status] ?? ""}`}
                        >
                          {r.status === "pending" && <Clock className="h-3 w-3" />}
                          {r.status === "accepted" && <Eye className="h-3 w-3" />}
                          {r.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                          {r.status === "rejected" && <XCircle className="h-3 w-3" />}
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {format(new Date(r.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action <strong className="text-foreground">cannot be undone</strong>. The user's
              account and all associated swap requests will be permanently removed from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
