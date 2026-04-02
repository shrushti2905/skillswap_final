import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, requestsTable } from "@workspace/db/schema";
import { eq, ilike, sql, ne } from "drizzle-orm";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

function omitPassword(user: typeof usersTable.$inferSelect) {
  const { password: _, ...rest } = user;
  return rest;
}

router.get("/admin/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)` }).from(usersTable);
    const [{ activeUsers }] = await db.select({ activeUsers: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isBlocked, false));
    const [{ totalRequests }] = await db.select({ totalRequests: sql<number>`count(*)` }).from(requestsTable);
    const [{ completedRequests }] = await db.select({ completedRequests: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "completed"));
    const [{ pendingRequests }] = await db.select({ pendingRequests: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "pending"));
    const [{ rejectedRequests }] = await db.select({ rejectedRequests: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, "rejected"));
    const [{ blockedUsers }] = await db.select({ blockedUsers: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isBlocked, true));

    const allUsers = await db.select({ skillsOffered: usersTable.skillsOffered }).from(usersTable);
    const allSkills = new Set<string>();
    allUsers.forEach((u) => u.skillsOffered.forEach((s) => allSkills.add(s)));
    const skillsAvailable = allSkills.size;

    res.json({
      totalUsers: Number(totalUsers),
      activeUsers: Number(activeUsers),
      totalRequests: Number(totalRequests),
      completedRequests: Number(completedRequests),
      pendingRequests: Number(pendingRequests),
      rejectedRequests: Number(rejectedRequests),
      blockedUsers: Number(blockedUsers),
      skillsAvailable,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get stats" });
  }
});

router.get("/admin/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let users;
    let total;

    if (search) {
      users = await db.select().from(usersTable)
        .where(ilike(usersTable.name, `%${search}%`))
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${usersTable.createdAt} DESC`);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable)
        .where(ilike(usersTable.name, `%${search}%`));
      total = Number(count);
    } else {
      users = await db.select().from(usersTable)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${usersTable.createdAt} DESC`);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
      total = Number(count);
    }

    res.json({
      users: users.map(omitPassword),
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list users" });
  }
});

router.put("/admin/users/:id/block", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.update(usersTable).set({ isBlocked: true }).where(eq(usersTable.id, id)).returning();
    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to block user" });
  }
});

router.put("/admin/users/:id/unblock", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.update(usersTable).set({ isBlocked: false }).where(eq(usersTable.id, id)).returning();
    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to unblock user" });
  }
});

router.delete("/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user!.userId) {
      res.status(400).json({ error: "Bad Request", message: "Cannot delete your own account" });
      return;
    }
    const deleted = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete user" });
  }
});

router.get("/admin/requests", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let requests;
    let total;

    if (status) {
      requests = await db.select().from(requestsTable)
        .where(eq(requestsTable.status, status as any))
        .limit(limitNum).offset(offset)
        .orderBy(sql`${requestsTable.createdAt} DESC`);
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable).where(eq(requestsTable.status, status as any));
      total = Number(count);
    } else {
      requests = await db.select().from(requestsTable)
        .limit(limitNum).offset(offset)
        .orderBy(sql`${requestsTable.createdAt} DESC`);
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(requestsTable);
      total = Number(count);
    }

    const enriched = await Promise.all(requests.map(async (r) => {
      const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, r.senderId)).limit(1);
      const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, r.receiverId)).limit(1);
      return {
        ...r,
        sender: sender ? omitPassword(sender) : null,
        receiver: receiver ? omitPassword(receiver) : null,
      };
    }));

    res.json({ requests: enriched, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list requests" });
  }
});

export default router;
