import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListNotifications } from "@workspace/api-client-react";
import { Bell, LogOut, UserCircle, LayoutDashboard, ArrowRightLeft, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: notificationsData } = useListNotifications({
    query: {
      enabled: !!user,
      refetchInterval: 30000,
    }
  });

  const unreadCount = notificationsData?.unreadCount || 0;

  if (!user) return null;

  const navLinks = [
    { href: "/discover", label: "Discover", icon: LayoutDashboard },
    { href: "/requests", label: "My Swaps", icon: ArrowRightLeft },
    { href: "/profile", label: "Profile", icon: User },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4" style={{ height: "60px" }}>

        {/* Logo */}
        <Link href="/discover" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            SS
          </div>
          <span className="hidden font-bold text-base sm:inline-block tracking-tight">SkillSwap</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className={`relative ${location === "/notifications" ? "bg-primary/10 text-primary" : ""}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-8 w-8 border-2 border-border">
                  <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-3 py-2">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
              </div>
              <DropdownMenuSeparator />
              {/* Mobile nav links */}
              <div className="md:hidden">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
                <DropdownMenuSeparator />
              </div>
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <UserCircle className="h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
