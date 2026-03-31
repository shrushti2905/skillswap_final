import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/notifications", authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(sql`${notificationsTable.createdAt} DESC`);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get notifications" });
  }
});

router.put("/notifications/read-all", authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to update notifications" });
  }
});

router.put("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [notification] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
      .returning();

    if (!notification) {
      res.status(404).json({ error: "Not Found", message: "Notification not found" });
      return;
    }

    res.json(notification);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to update notification" });
  }
});

export default router;
