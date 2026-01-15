/**
 * Linear Importer Scaffold
 *
 * This script loads the Linear import JSON payload and provides a scaffold
 * for integrating with the Linear SDK.
 *
 * Usage: npx tsx ops/linear/import.ts
 *
 * Environment variables (optional):
 * - LINEAR_API_KEY: Linear API key for actual import
 * - LINEAR_TEAM_ID: Linear team ID for import target
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Types for Linear import payload
interface LinearMilestone {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  targetDate: string | null;
}

interface LinearLabel {
  name: string;
  color: string;
  description: string;
}

interface LinearIssue {
  id: string;
  title: string;
  description: string;
  priority: number;
  milestone: string;
  labels: string[];
  state: string;
}

interface LinearProject {
  name: string;
  description: string;
  state: string;
  milestones: LinearMilestone[];
  labels: LinearLabel[];
  issues: LinearIssue[];
}

interface LinearWorkspace {
  name: string;
  description: string;
  projects: LinearProject[];
}

interface LinearImportPayload {
  version: string;
  exportedAt: string;
  workspace: LinearWorkspace;
}

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load the Linear import JSON payload
 */
function loadImportPayload(): LinearImportPayload {
  const importPath = join(__dirname, "import.linear.json");

  try {
    const content = readFileSync(importPath, "utf-8");
    return JSON.parse(content) as LinearImportPayload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load import payload: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validate the import payload structure
 */
function validatePayload(payload: LinearImportPayload): void {
  if (!payload.workspace) {
    throw new Error("Invalid payload: missing workspace");
  }

  if (!Array.isArray(payload.workspace.projects)) {
    throw new Error("Invalid payload: missing projects array");
  }

  const project = payload.workspace.projects[0];
  if (!project) {
    throw new Error("Invalid payload: no projects found");
  }

  if (!Array.isArray(project.milestones)) {
    throw new Error("Invalid payload: missing milestones array");
  }

  if (!Array.isArray(project.labels)) {
    throw new Error("Invalid payload: missing labels array");
  }

  if (!Array.isArray(project.issues)) {
    throw new Error("Invalid payload: missing issues array");
  }
}

/**
 * TODO: Implement Linear SDK integration
 *
 * Steps to integrate with Linear:
 * 1. Install Linear SDK: pnpm add @linear/sdk
 * 2. Initialize client with API key from environment
 * 3. Create project using linearClient.createProject()
 * 4. Create milestones as Linear cycles or project milestones
 * 5. Create labels using linearClient.createIssueLabel()
 * 6. Create issues using linearClient.createIssue()
 *
 * Example:
 * ```typescript
 * import { LinearClient } from "@linear/sdk";
 *
 * const apiKey = process.env.LINEAR_API_KEY;
 * const teamId = process.env.LINEAR_TEAM_ID;
 *
 * if (!apiKey || !teamId) {
 *   throw new Error("LINEAR_API_KEY and LINEAR_TEAM_ID required");
 * }
 *
 * const linearClient = new LinearClient({ apiKey });
 *
 * // Create issues
 * for (const issue of payload.workspace.projects[0].issues) {
 *   await linearClient.createIssue({
 *     teamId,
 *     title: issue.title,
 *     description: issue.description,
 *     priority: issue.priority,
 *   });
 * }
 * ```
 */
async function importToLinear(_payload: LinearImportPayload): Promise<void> {
  // TODO: Implement actual Linear SDK integration
  // This scaffold demonstrates the structure for future implementation
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Load the import payload
  const payload = loadImportPayload();

  // Validate payload structure
  validatePayload(payload);

  // Log loaded workspace info
  console.log(`Loaded: ${payload.workspace.name}`);
  console.log(`Projects: ${payload.workspace.projects.length}`);

  const project = payload.workspace.projects[0];
  console.log(`Issues: ${project.issues.length}`);

  // Additional info for debugging
  console.log(`Milestones: ${project.milestones.length}`);
  console.log(`Labels: ${project.labels.length}`);

  // Check for Linear SDK environment variables
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;

  if (apiKey && teamId) {
    console.log("\nLinear credentials detected. Ready for import.");
    // TODO: Call importToLinear(payload) when SDK is integrated
    await importToLinear(payload);
  } else {
    console.log("\nNote: Set LINEAR_API_KEY and LINEAR_TEAM_ID to enable import.");
  }
}

// Run the main function
main().catch((error: unknown) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
