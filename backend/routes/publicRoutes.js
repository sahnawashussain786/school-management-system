import { Router } from "express";
import Announcement from "../models/Announcement.js";
import Event from "../models/Event.js";
import Trip from "../models/Trip.js";

const router = Router();

// @desc   Public site info (no auth)
// @route  GET /api/public/info
router.get("/info", (req, res) => {
  res.json({
    name: "Junior Champ's Higher Secondary School, Chandia",
    tagline: "Nurturing Minds, Building Futures",
    director: "Shakeel Khan",
    address: "Ward No. 9, Near Naogaza Baba Dargah, Chandia, District Umaria, Madhya Pradesh",
    phone: "+91 9806859090",
    classes: "Nursery to 12th",
  });
});

// @desc   Public announcements
// @route  GET /api/public/announcements
router.get("/announcements", async (req, res) => {
  const items = await Announcement.find({ published: true })
    .sort("-publishedAt")
    .limit(6)
    .select("title body category priority publishedAt");
  res.json(items);
});

// @desc   Public events
// @route  GET /api/public/events
router.get("/events", async (req, res) => {
  const items = await Event.find({ isPublic: true })
    .sort("-startDate")
    .limit(8);
  res.json(items);
});

// @desc   Public upcoming trips (registration requires login)
// @route  GET /api/public/trips
router.get("/trips", async (req, res) => {
  const items = await Trip.find({
    isPublic: true,
    status: { $in: ["open", "closed"] },
  })
    .sort("startDate")
    .limit(6)
    .select(
      "title destination description category startDate endDate costPerStudent capacity status",
    )
    .lean();
  const withCounts = items.map((t) => ({
    ...t,
    registeredCount: t.registrations ? t.registrations.length : 0,
    registrations: undefined,
  }));
  res.json(withCounts);
});

export default router;
