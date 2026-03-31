import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

function omitPassword(user: typeof usersTable.$inferSelect) {
  const { password: _, ...rest } = user;
  return rest;
}

router.get("/users", authenticate, async (req, res) => {
  try {
    const { search, skill, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(usersTable)
      .$dynamic();

    const conditions = [eq(usersTable.isBlocked, false)];

    if (search) {
      conditions.push(
        or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.location, `%${search}%`),
        ) as any
      );
    }

    if (skill) {
      conditions.push(
        or(
          sql`${usersTable.skillsOffered} @> ARRAY[${skill}]::text[]`,
          sql`${usersTable.skillsWanted} @> ARRAY[${skill}]::text[]`,
        ) as any
      );
    }

    const whereCondition = conditions.length === 1 ? conditions[0] : sql`${conditions.reduce((acc, c, i) => i === 0 ? c : sql`${acc} AND ${c}`)}`;

    const users = await db.select().from(usersTable)
      .where(whereCondition as any)
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable)
      .where(whereCondition as any);

    res.json({
      users: users.map(omitPassword),
      total: Number(count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list users" });
  }
});

router.get("/users/me/profile", authenticate, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get profile" });
  }
});

router.put("/users/me/profile", authenticate, async (req, res) => {
  try {
    const { name, bio, location, profileImage, availability, isPublic } = req.body;
    const updates: Partial<typeof usersTable.$inferInsert> = {};

    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (availability !== undefined) updates.availability = availability;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user!.userId)).returning();
    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to update profile" });
  }
});

router.post("/users/me/skills/offered", authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      res.status(400).json({ error: "Bad Request", message: "Skill is required" });
      return;
    }

    const [current] = await db.select({ skillsOffered: usersTable.skillsOffered })
      .from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

    if (current.skillsOffered.includes(skill)) {
      res.status(400).json({ error: "Bad Request", message: "Skill already added" });
      return;
    }

    const [user] = await db.update(usersTable)
      .set({ skillsOffered: [...current.skillsOffered, skill] })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();

    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to add skill" });
  }
});

router.delete("/users/me/skills/offered", authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      res.status(400).json({ error: "Bad Request", message: "Skill is required" });
      return;
    }

    const [current] = await db.select({ skillsOffered: usersTable.skillsOffered })
      .from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

    const [user] = await db.update(usersTable)
      .set({ skillsOffered: current.skillsOffered.filter((s) => s !== skill) })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();

    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to remove skill" });
  }
});

router.post("/users/me/skills/wanted", authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      res.status(400).json({ error: "Bad Request", message: "Skill is required" });
      return;
    }

    const [current] = await db.select({ skillsWanted: usersTable.skillsWanted })
      .from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

    if (current.skillsWanted.includes(skill)) {
      res.status(400).json({ error: "Bad Request", message: "Skill already added" });
      return;
    }

    const [user] = await db.update(usersTable)
      .set({ skillsWanted: [...current.skillsWanted, skill] })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();

    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to add skill" });
  }
});

router.delete("/users/me/skills/wanted", authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) {
      res.status(400).json({ error: "Bad Request", message: "Skill is required" });
      return;
    }

    const [current] = await db.select({ skillsWanted: usersTable.skillsWanted })
      .from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

    const [user] = await db.update(usersTable)
      .set({ skillsWanted: current.skillsWanted.filter((s) => s !== skill) })
      .where(eq(usersTable.id, req.user!.userId))
      .returning();

    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to remove skill" });
  }
});

router.get("/users/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid user ID" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }
    res.json(omitPassword(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to get user" });
  }
});

export default router;
