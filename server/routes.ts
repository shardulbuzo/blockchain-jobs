import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchJobsAndCompanies } from "./google-sheets";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/jobs", async (_req, res) => {
    try {
      const { jobs } = await fetchJobsAndCompanies();
      res.json({ jobs });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to load jobs from Google Sheets.",
        error: error?.message || "Unknown error",
      });
    }
  });

  app.get("/api/companies", async (_req, res) => {
    try {
      const { companies } = await fetchJobsAndCompanies();
      res.json({ companies });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to load companies from Google Sheets.",
        error: error?.message || "Unknown error",
      });
    }
  });

  return httpServer;
}
