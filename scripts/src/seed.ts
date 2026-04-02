import { db } from "@workspace/db";
import { usersTable, requestsTable, notificationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const admins = [
    {
      name: "Shrushti Patil",
      email: "shrushtipatil2905@gmail.com",
      bio: "SkillSwap platform administrator",
      location: "Indore",
    },
    {
      name: "Roshni",
      email: "roshroshi778@gmail.com",
      bio: "SkillSwap platform co-administrator",
      location: "Indore",
    },
  ];

  let adminId: number = 0;

  for (const adminData of admins) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, adminData.email)).limit(1);
    if (existing.length === 0) {
      const hashedAdminPw = await bcrypt.hash("Admin@123", 12);
      const [admin] = await db.insert(usersTable).values({
        name: adminData.name,
        email: adminData.email,
        password: hashedAdminPw,
        role: "admin",
        skillsOffered: ["Platform Management", "User Support"],
        skillsWanted: [],
        bio: adminData.bio,
        location: adminData.location,
        isBlocked: false,
        availability: ["Weekdays"],
        isPublic: true,
        ratingCount: 0,
      }).returning();
      if (adminData.email === "shrushtipatil2905@gmail.com") adminId = admin.id;
      console.log("Admin created:", adminData.email);
    } else {
      if (adminData.email === "shrushtipatil2905@gmail.com") adminId = existing[0].id;
      console.log("Admin already exists:", adminData.email);
    }
  }

  const sampleUsers = [
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: "password123",
      skillsOffered: ["Python", "Machine Learning", "Data Analysis"],
      skillsWanted: ["UI/UX Design", "Figma"],
      bio: "Data scientist with 3 years of experience. Love ML and data visualization.",
      location: "Bangalore",
      availability: ["Weekends", "Evenings"],
    },
    {
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      password: "password123",
      skillsOffered: ["React", "TypeScript", "Node.js"],
      skillsWanted: ["Python", "Machine Learning"],
      bio: "Full-stack developer passionate about clean code and modern web tech.",
      location: "Mumbai",
      availability: ["Weekdays", "Mornings"],
    },
    {
      name: "Aisha Khan",
      email: "aisha.khan@example.com",
      password: "password123",
      skillsOffered: ["Graphic Design", "Illustrator", "Branding"],
      skillsWanted: ["JavaScript", "React"],
      bio: "Creative designer specializing in brand identity and digital design.",
      location: "Delhi",
      availability: ["Afternoons", "Weekends"],
    },
    {
      name: "Vikram Singh",
      email: "vikram.singh@example.com",
      password: "password123",
      skillsOffered: ["Digital Marketing", "SEO", "Content Writing"],
      skillsWanted: ["Video Editing", "Photography"],
      bio: "Digital marketing expert helping businesses grow online.",
      location: "Pune",
      availability: ["Flexible"],
    },
    {
      name: "Sneha Patel",
      email: "sneha.patel@example.com",
      password: "password123",
      skillsOffered: ["Photography", "Video Editing", "Adobe Premiere"],
      skillsWanted: ["Digital Marketing", "Social Media"],
      bio: "Freelance photographer and videographer with an eye for storytelling.",
      location: "Ahmedabad",
      availability: ["Weekends", "Evenings"],
    },
  ];

  const createdUserIds: number[] = [];

  for (const userData of sampleUsers) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1);
    if (existing.length === 0) {
      const hashedPw = await bcrypt.hash(userData.password, 12);
      const [user] = await db.insert(usersTable).values({
        name: userData.name,
        email: userData.email,
        password: hashedPw,
        role: "user",
        skillsOffered: userData.skillsOffered,
        skillsWanted: userData.skillsWanted,
        bio: userData.bio,
        location: userData.location,
        isBlocked: false,
        availability: userData.availability,
        isPublic: true,
        ratingCount: 0,
      }).returning();
      createdUserIds.push(user.id);
      console.log("Created user:", userData.name);
    } else {
      createdUserIds.push(existing[0].id);
      console.log("User already exists:", userData.name);
    }
  }

  if (createdUserIds.length >= 2) {
    const [u1, u2, u3, u4, u5] = createdUserIds;

    const sampleRequests = [
      {
        senderId: u1,
        receiverId: u2,
        skillOffered: "Python",
        skillRequested: "React",
        message: "Hi! I'd love to learn React from you in exchange for Python lessons.",
        status: "pending" as const,
      },
      {
        senderId: u2,
        receiverId: u3,
        skillOffered: "TypeScript",
        skillRequested: "Graphic Design",
        message: "Looking to improve my design skills. Happy to teach TypeScript!",
        status: "accepted" as const,
      },
      {
        senderId: u3,
        receiverId: u4,
        skillOffered: "Branding",
        skillRequested: "SEO",
        message: "Your SEO expertise would help my freelance business grow.",
        status: "completed" as const,
      },
      {
        senderId: u4,
        receiverId: u5,
        skillOffered: "Content Writing",
        skillRequested: "Photography",
        message: "I need product photography skills for my clients.",
        status: "pending" as const,
      },
      {
        senderId: u5,
        receiverId: u1,
        skillOffered: "Video Editing",
        skillRequested: "Data Analysis",
        message: "Would love to analyze viewer data for my YouTube channel.",
        status: "rejected" as const,
      },
    ];

    for (const reqData of sampleRequests) {
      await db.insert(requestsTable).values(reqData).onConflictDoNothing();
    }
    console.log("Sample requests created");

    await db.insert(notificationsTable).values([
      {
        userId: u2,
        message: "Priya Sharma sent you a skill swap request for React",
        isRead: false,
      },
      {
        userId: u1,
        message: "Your request to Rohan Mehta has been accepted!",
        isRead: false,
      },
      {
        userId: u3,
        message: "Skill swap with Vikram Singh marked as completed",
        isRead: true,
      },
    ]).onConflictDoNothing();
    console.log("Sample notifications created");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
