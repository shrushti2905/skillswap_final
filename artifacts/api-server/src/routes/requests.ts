import { Router } from "express";
import { db } from "@workspace/db";
import { requestsTable, usersTable, notificationsTable } from "@workspace/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

function omitPassword(user: typeof usersTable.$inferSelect) {
  const { password: _, ...rest } = user;
  return rest;
}

async function enrichRequest(request: typeof requestsTable.$inferSelect) {
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, request.senderId)).limit(1);
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, request.receiverId)).limit(1);
  return {
    ...request,
    sender: sender ? omitPassword(sender) : null,
    receiver: receiver ? omitPassword(receiver) : null,
  };
}

router.get("/requests", authenticate, async (req, res) => {
  try {
    const { type = "all", status } = req.query as Record<string, string>;
    const userId = req.user!.userId;

    const conditions: any[] = [];

    if (type === "sent") {
      conditions.push(eq(requestsTable.senderId, userId));
    } else if (type === "received") {
      conditions.push(eq(requestsTable.receiverId, userId));
    } else {
      conditions.push(or(eq(requestsTable.senderId, userId), eq(requestsTable.receiverId, userId)));
    }

    if (status) {
      conditions.push(eq(requestsTable.status, status as any));
    }

    const where = conditions.length === 1 ? conditions[0] : and(...conditions);
    const requests = await db.select().from(requestsTable).where(where).orderBy(sql`${requestsTable.createdAt} DESC`);
    const enriched = await Promise.all(requests.map(enrichRequest));

    res.json({ requests: enriched, total: enriched.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list requests" });
  }
});

router.post("/requests", authenticate, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested, message } = req.body;
    const senderId = req.user!.userId;

    if (!receiverId || !skillOffered || !skillRequested) {
      res.status(400).json({ error: "Bad Request", message: "receiverId, skillOffered, and skillRequested are required" });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ error: "Bad Request", message: "Cannot send request to yourself" });
      return;
    }

    const existing = await db.select().from(requestsTable)
      .where(and(
        eq(requestsTable.senderId, senderId),
        eq(requestsTable.receiverId, receiverId),
        eq(requestsTable.status, "pending"),
      )).limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "A pending request already exists with this user" });
      return;
    }

    const [request] = await db.insert(requestsTable).values({
      senderId,
      receiverId,
      skillOffered,
      skillRequested,
      message: message || null,
    }).returning();

    const [sender] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, senderId)).limit(1);

    await db.insert(notificationsTable).values({
      userId: receiverId,
      message: `${sender.name} sent you a skill swap request for "${skillRequested}"`,
      isRead: false,
    });

    const enriched = await enrichRequest(request);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to create request" });
  }
});

router.get("/requests/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) {
      res.status(404).json({ error: "Not Found", message: "Request not found" });
      return;
    }
    res.json(await enrichRequest(request));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get request" });
  }
});

router.delete("/requests/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) {
      res.status(404).json({ error: "Not Found", message: "Request not found" });
      return;
    }

    if (request.senderId !== userId) {
      res.status(403).json({ error: "Forbidden", message: "Only the sender can delete this request" });
      return;
    }

    await db.delete(requestsTable).where(eq(requestsTable.id, id));
    res.json({ message: "Request deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete request" });
  }
});

router.put("/requests/:id/accept", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) {
      res.status(404).json({ error: "Not Found", message: "Request not found" });
      return;
    }

    if (request.receiverId !== userId) {
      res.status(403).json({ error: "Forbidden", message: "Only the receiver can accept this request" });
      return;
    }

    const [updated] = await db.update(requestsTable).set({ status: "accepted" }).where(eq(requestsTable.id, id)).returning();

    const [receiver] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    await db.insert(notificationsTable).values({
      userId: request.senderId,
      message: `${receiver.name} accepted your skill swap request!`,
      isRead: false,
    });

    res.json(await enrichRequest(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to accept request" });
  }
});

router.put("/requests/:id/reject", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) {
      res.status(404).json({ error: "Not Found", message: "Request not found" });
      return;
    }

    if (request.receiverId !== userId) {
      res.status(403).json({ error: "Forbidden", message: "Only the receiver can reject this request" });
      return;
    }

    const [updated] = await db.update(requestsTable).set({ status: "rejected" }).where(eq(requestsTable.id, id)).returning();
    res.json(await enrichRequest(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to reject request" });
  }
});

router.put("/requests/:id/complete", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) {
      res.status(404).json({ error: "Not Found", message: "Request not found" });
      return;
    }

    if (request.senderId !== userId && request.receiverId !== userId) {
      res.status(403).json({ error: "Forbidden", message: "Not authorized" });
      return;
    }

    const [updated] = await db.update(requestsTable).set({ status: "completed" }).where(eq(requestsTable.id, id)).returning();

    const otherUserId = request.senderId === userId ? request.receiverId : request.senderId;
    const [currentUser] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    await db.insert(notificationsTable).values({
      userId: otherUserId,
      message: `${currentUser.name} marked your skill swap as completed!`,
      isRead: false,
    });

    res.json(await enrichRequest(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to complete request" });
  }
});

export default router;
