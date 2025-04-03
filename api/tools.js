import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import cors from 'cors';
import { promisify } from 'util';

const app = express();

// --- Configuration ---
// Use process.cwd() for Vercel compatibility
const DATABASE_PATH = path.join(process.cwd(), 'ai_tools_resource', 'ai_tools.db');
// --- End Configuration ---

// Enable CORS for all origins
app.use(cors());

// Helper function to open the database connection
function openDb() {
  return new Promise((resolve, reject) => {
    // Ensure the database file exists or handle appropriately
    // Note: Vercel might have limitations on writable file systems on free tier
    const db = new sqlite3.Database(
      DATABASE_PATH,
      sqlite3.OPEN_READONLY, // Keep as read-only
      (err) => {
        if (err) {
          console.error('Error opening database:', err.message, 'Path:', DATABASE_PATH);
          reject(new Error('Failed to connect to the database.'));
        } else {
          console.log('Connected to the AI tools database.');
          // Promisify db methods
          db.allAsync = promisify(db.all).bind(db);
          db.closeAsync = promisify(db.close).bind(db);
          resolve(db);
        }
      }
    );
  });
}

// Helper function to safely parse JSON strings (used for some fields)
function safeJsonParse(jsonString, defaultValue = null) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Failed to parse JSON string:', jsonString, e.message);
    return defaultValue;
  }
}

// API endpoint logic (extracted from the original app.get)
async function handleGetTools(req, res) {
  let db;
  try {
    db = await openDb();

    // 1. Fetch all core tool data
    const toolsCoreData = await db.allAsync('SELECT * FROM tools');
    console.log(`Fetched ${toolsCoreData.length} core tool records.`);

    // 2. Fetch related data for all tools efficiently
    const toolIds = toolsCoreData.map((t) => t.id);
    if (toolIds.length === 0) {
        console.log('No tools found, returning empty array.');
        return res.json([]); // Return early if no tools
    }
    const placeholders = toolIds.map(() => '?').join(',');


    const [
      featuresData,
      prosData,
      consData,
      integrationsData,
      supportOptionsData,
      dataSourceUrlsData,
      securityCertsData,
      reviewRefsData,
      useCasesData,
      trainingResourcesData,
      reviewDetailsData,
      reviewCommonUsesData,
      pricingTiersData,
    ] = await Promise.all([
      db.allAsync(
        `SELECT tool_id, feature FROM tool_features WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, pro FROM tool_pros WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, con FROM tool_cons WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, integration FROM tool_integrations WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, support_option FROM tool_support_options WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, url FROM tool_data_source_urls WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, certification FROM tool_security_certifications WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, url FROM tool_review_references WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, title, description, example FROM tool_use_cases WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, type, url, description FROM tool_training_resources WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, source_name, rating, review_count, highlights, source_url FROM tool_user_review_details WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT tool_id, use_description FROM tool_user_review_common_uses WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
      db.allAsync(
        `SELECT id, tool_id, tier_name, price_description, tier_description, unit FROM tool_pricing_tiers WHERE tool_id IN (${placeholders})`,
        toolIds
      ),
    ]);
    console.log('Fetched related data.');

    // Fetch pricing tier features and metrics separately as they depend on tier IDs
    const tierIds = pricingTiersData.map((t) => t.id);
    const tierPlaceholders = tierIds.map(() => '?').join(',');
    const [pricingTierFeaturesData, pricingMetricsData] =
      tierIds.length > 0
        ? await Promise.all([
            db.allAsync(
              `SELECT tier_id, feature FROM tool_pricing_tier_features WHERE tier_id IN (${tierPlaceholders})`,
              tierIds
            ),
            db.allAsync(
              `SELECT tier_id, metric_name, value, unit, provider, architecture, gpus, topology, accelerator_memory FROM tool_pricing_metrics WHERE tier_id IN (${tierPlaceholders})`,
              tierIds
            ),
          ])
        : [[], []]; // Handle case with no pricing tiers
    console.log('Fetched pricing details.');

    // 3. Structure the data
    const structuredTools = toolsCoreData.map((tool) => {
      const toolId = tool.id;

      // Filter related data for the current tool
      const features = featuresData
        .filter((f) => f.tool_id === toolId)
        .map((f) => f.feature);
      const pros = prosData
        .filter((p) => p.tool_id === toolId)
        .map((p) => p.pro);
      const cons = consData
        .filter((c) => c.tool_id === toolId)
        .map((c) => c.con);
      const integrations = integrationsData
        .filter((i) => i.tool_id === toolId)
        .map((i) => i.integration);
      const supportOptions = supportOptionsData
        .filter((s) => s.tool_id === toolId)
        .map((s) => s.support_option);
      const dataSourceUrls = dataSourceUrlsData
        .filter((d) => d.tool_id === toolId)
        .map((d) => d.url);
      const securityCerts = securityCertsData
        .filter((s) => s.tool_id === toolId)
        .map((s) => s.certification);
      const reviewRefs = reviewRefsData
        .filter((r) => r.tool_id === toolId)
        .map((r) => r.url);
      const useCases = useCasesData
        .filter((u) => u.tool_id === toolId)
        .map(({ title, description, example }) => ({
          title,
          description,
          example,
        }));
      const trainingResources = trainingResourcesData
        .filter((t) => t.tool_id === toolId)
        .map(({ type, url, description }) => ({ type, url, description }));
      const reviewDetails = reviewDetailsData
        .filter((r) => r.tool_id === toolId)
        .map(
          ({ source_name, rating, review_count, highlights, source_url }) => ({
            source_name,
            rating,
            review_count,
            highlights: safeJsonParse(highlights, highlights),
            source_url,
          })
        ); // Parse highlights back if stored as JSON
      const reviewCommonUses = reviewCommonUsesData
        .filter((u) => u.tool_id === toolId)
        .map((u) => u.use_description);

      // Structure pricing
      const pricingTiers = pricingTiersData
        .filter((pt) => pt.tool_id === toolId)
        .map((tier) => {
          const tierId = tier.id;
          const tierFeatures = pricingTierFeaturesData
            .filter((f) => f.tier_id === tierId)
            .map((f) => f.feature);
          const tierMetrics = pricingMetricsData
            .filter((m) => m.tier_id === tierId)
            .map((m) => ({
              metric_name: m.metric_name,
              value: m.value,
              unit: m.unit,
              provider: m.provider,
              architecture: m.architecture,
              gpus: m.gpus,
              topology: m.topology,
              accelerator_memory: m.accelerator_memory,
            }));
          return {
            id: tierId,
            tier_name: tier.tier_name,
            price_description: tier.price_description,
            tier_description: tier.tier_description,
            unit: tier.unit,
            features: tierFeatures,
            metrics: tierMetrics,
          };
        });

      // Assemble the final tool object
      return {
        // Core fields from 'tools' table
        id: tool.id,
        name: tool.name,
        category: tool.category,
        description: tool.description,
        image_url: tool.image_url,
        documentation_url: tool.documentation_url,
        api_url: tool.api_url,
        sdk_url: tool.sdk_url,
        scalability: tool.scalability,
        tech_spec_api_type: tool.tech_spec_api_type,
        tech_spec_sdks: safeJsonParse(tool.tech_spec_sdks, []), // Parse SDK list
        user_reviews_summary: tool.user_reviews_summary,
        benchmark_overall: tool.benchmark_overall,
        benchmark_accuracy: tool.benchmark_accuracy,
        benchmark_speed: tool.benchmark_speed,
        benchmark_task_specific_notes: safeJsonParse(
          tool.benchmark_task_specific_notes,
          {}
        ), // Parse task specific dict
        security_data_protection: tool.security_data_protection,
        feature_visualization_mermaid: tool.feature_visualization_mermaid,
        last_updated: tool.last_updated,
        original_filename: tool.original_filename, // Keep for reference if needed

        // Joined data
        features: features,
        pros: pros,
        cons: cons,
        integration_capabilities: integrations, // Match original JSON key if needed
        support_options: supportOptions,
        data_source_urls: dataSourceUrls,
        security_compliance: {
          // Reconstruct object if needed by frontend
          certifications: securityCerts,
          data_protection: tool.security_data_protection, // Reuse from core tool data
        },
        review_references: reviewRefs, // Add this if frontend uses it
        use_cases: useCases,
        training_resources: trainingResources,
        user_reviews: {
          // Reconstruct object
          summary: tool.user_reviews_summary, // Reuse from core tool data
          sources: reviewDetails, // Use the structured details
          common_uses_from_reviews: reviewCommonUses,
        },
        pricing: {
          model: tool.pricing_model_description, // Reuse from core tool data
          notes: tool.pricing_notes, // Reuse from core tool data
          tiers: pricingTiers,
        },
      };
    });
    console.log('Structured tool data.');

    res.json(structuredTools);
  } catch (error) {
    console.error('Error in /api/tools endpoint:', error.message);
    res.status(500).json({ error: 'Failed to retrieve or process tool data.' });
  } finally {
    if (db) {
      try {
        await db.closeAsync();
        console.log('Closed the database connection.');
      } catch (closeErr) {
        console.error('Error closing database:', closeErr.message);
      }
    }
  }
}


// Define the route using the extracted handler
app.get('/api/tools', handleGetTools);

// Export the app instance for Vercel
export default app;