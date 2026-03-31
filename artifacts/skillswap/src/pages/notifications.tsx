import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Bell, BellRing, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const { data, isLoading } = useListNotifications({
    query: { refetchInterval: 30000 }
  });
  
  const queryClient = useQueryClient();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } catch (e) {
      // silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } catch (e: any) {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on your swap activity.</p>
          </div>
        </div>
        
        {data?.unreadCount ? (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}>
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-card/40 border-border/50" />)
        ) : data?.notifications.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-xl border border-border/50">
            <BellRing className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground mt-1">You don't have any new notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.notifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className={`border-border/50 transition-colors ${!notification.isRead ? 'bg-card border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]' : 'bg-card/40'}`}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {!notification.isRead ? (
                        <Circle className="h-3 w-3 fill-primary text-primary animate-pulse" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0" onClick={() => handleMarkRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
