import { useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_INBOX: Notification[] = [
  { id: "1", type: "warning", title: "Low Attendance Alert", message: "CSE 301 has dropped below 75% attendance threshold this semester.", time: "2 hours ago", read: false },
  { id: "2", type: "warning", title: "Low Attendance Alert", message: "EEE 101 attendance rate is at 68% — 3 consecutive absences recorded.", time: "3 hours ago", read: false },
  { id: "3", type: "success", title: "New Student Registered", message: "Jean-Claude Mbarga has enrolled in Data Structures & Algorithms (CSE 201).", time: "5 hours ago", read: false },
  { id: "4", type: "success", title: "New Student Registered", message: "Wirba Che has registered for Circuit Theory (EEE 101).", time: "6 hours ago", read: true },
  { id: "5", type: "info", title: "Session Completed", message: "MAT 101 attendance session has ended with a 92% turnout.", time: "1 day ago", read: true },
  { id: "6", type: "info", title: "Timetable Conflict Detected", message: "Room CSE Lab 1 is double-booked on Wednesday at 10:00.", time: "1 day ago", read: true },
];

const MOCK_WHATS_NEW: Notification[] = [
  { id: "n1", type: "info", title: "Facial Recognition Beta", message: "Face-based attendance marking is now available for testing.", time: "2 days ago", read: false },
  { id: "n2", type: "success", title: "Semester 2 Timetables Published", message: "Schedules for all departments (Level 200–500) are now live.", time: "3 days ago", read: false },
  { id: "n3", type: "info", title: "Scheduled Maintenance", message: "System maintenance on May 15 from 2:00 AM to 4:00 AM UTC.", time: "4 days ago", read: true },
];

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  warning: <AlertCircle className="h-[18px] w-[18px] text-amber-500" />,
  success: <CheckCircle2 className="h-[18px] w-[18px] text-green-500" />,
  info: <Info className="h-[18px] w-[18px] text-blue-500" />,
};

const TYPE_DOT: Record<Notification["type"], string> = {
  warning: "bg-amber-500",
  success: "bg-green-500",
  info: "bg-blue-500",
};

function NotificationItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/60",
        !n.read && "bg-accent-soft/40"
      )}
      onClick={() => onRead(n.id)}
    >
      <div className="relative shrink-0 mt-0.5">
        {TYPE_ICON[n.type]}
        {!n.read && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-popover",
              TYPE_DOT[n.type]
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{n.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-wide">{n.time}</p>
      </div>
    </div>
  );
}

export function NotificationsPanel() {
  const [inbox, setInbox] = useState<Notification[]>(MOCK_INBOX);
  const [whatsNew, setWhatsNew] = useState<Notification[]>(MOCK_WHATS_NEW);

  const inboxUnread = inbox.filter((n) => !n.read).length;
  const newUnread = whatsNew.filter((n) => !n.read).length;
  const totalUnread = inboxUnread + newUnread;

  const markAsRead = (id: string) => {
    setInbox((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setWhatsNew((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setInbox((prev) => prev.map((n) => ({ ...n, read: true })));
    setWhatsNew((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[370px] p-0 overflow-hidden shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="text-[10px] h-[18px] px-1.5">
                {totalUnread} new
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="inbox">
          {/* Tab bar */}
          <TabsList className="w-full grid grid-cols-2 h-auto rounded-none bg-transparent border-b border-border p-0">
            <TabsTrigger
              value="inbox"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-2.5 text-sm font-medium gap-1.5 hover:bg-secondary/40 transition-colors"
            >
              Inbox
              {inboxUnread > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="whats-new"
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-2.5 text-sm font-medium gap-1.5 hover:bg-secondary/40 transition-colors"
            >
              What's new
              {newUnread > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-0 focus-visible:outline-none">
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
              {inbox.map((n) => (
                <NotificationItem key={n.id} n={n} onRead={markAsRead} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="whats-new" className="mt-0 focus-visible:outline-none">
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
              {whatsNew.map((n) => (
                <NotificationItem key={n.id} n={n} onRead={markAsRead} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {totalUnread > 0 && (
          <div className="border-t border-border p-3">
            <button
              onClick={markAllAsRead}
              className="w-full text-sm text-center text-accent hover:text-accent/70 font-medium transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
