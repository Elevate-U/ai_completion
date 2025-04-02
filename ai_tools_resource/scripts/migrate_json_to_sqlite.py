import sqlite3
import json
import os
import shutil
import logging
from datetime import datetime

# --- Configuration ---
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'ai_tools.db')
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data') # Added data directory path
BACKUP_PATH = f"{DB_PATH}.{datetime.now().strftime('%Y%m%d%H%M%S')}.bak"
LOG_FILE = os.path.join(os.path.dirname(__file__), 'migration.log')

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler(LOG_FILE),
                        logging.StreamHandler()
                    ])

# --- Schema Definition ---
SCHEMA = """
-- Drop existing new tables if they exist (for idempotency during testing)
DROP TABLE IF EXISTS tool_pricing_metrics;
DROP TABLE IF EXISTS tool_pricing_tier_features;
DROP TABLE IF EXISTS tool_pricing_tiers;
DROP TABLE IF EXISTS tool_review_references;
DROP TABLE IF EXISTS tool_security_certifications;
DROP TABLE IF EXISTS tool_training_resources;
DROP TABLE IF EXISTS tool_use_cases;
DROP TABLE IF EXISTS tool_user_review_common_uses;
DROP TABLE IF EXISTS tool_user_review_details;
DROP TABLE IF EXISTS tool_data_source_urls;
DROP TABLE IF EXISTS tool_support_options;
DROP TABLE IF EXISTS tool_integrations;
DROP TABLE IF EXISTS tool_cons;
DROP TABLE IF EXISTS tool_pros;
DROP TABLE IF EXISTS tool_features;
DROP TABLE IF EXISTS tools;

-- Core tool information
CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    documentation_url TEXT,
    api_url TEXT,
    sdk_url TEXT,
    scalability TEXT,
    pricing_model_description TEXT,
    pricing_notes TEXT,
    tech_spec_api_type TEXT,
    tech_spec_sdks TEXT,
    user_reviews_summary TEXT,
    benchmark_overall TEXT,
    benchmark_accuracy TEXT,
    benchmark_speed TEXT,
    benchmark_task_specific_notes TEXT,
    security_data_protection TEXT,
    feature_visualization_mermaid TEXT,
    last_updated TEXT,
    original_filename TEXT
);

-- Simple list tables (Many-to-one relationship with tools)
CREATE TABLE tool_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    feature TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_pros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    pro TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_cons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    con TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    integration TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_support_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    support_option TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_data_source_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    url TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_security_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    certification TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_review_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

-- Structured list tables
CREATE TABLE tool_use_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    example TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_training_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    type TEXT,
    url TEXT,
    description TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_user_review_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    source_name TEXT,
    rating TEXT,
    review_count INTEGER,
    highlights TEXT, -- Store array as JSON string or newline-separated
    source_url TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_user_review_common_uses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    use_description TEXT NOT NULL,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

-- Pricing Structure
CREATE TABLE tool_pricing_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id INTEGER NOT NULL,
    tier_name TEXT NOT NULL,       -- e.g., 'Free', 'Pro', 'Image Analysis - Tier 1', 'Spaces Hardware - T4 Small'
    price_description TEXT, -- e.g., '$0', '$20/month', '$0.001 per image', '$0.40/hour'
    tier_description TEXT,  -- Optional: General notes about the tier
    unit TEXT,              -- Optional: Clarifies price_description, e.g., 'per month', 'per image', 'per hour'
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE tool_pricing_tier_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier_id INTEGER NOT NULL,
    feature TEXT NOT NULL,
    FOREIGN KEY (tier_id) REFERENCES tool_pricing_tiers(id) ON DELETE CASCADE
);

CREATE TABLE tool_pricing_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL, -- e.g., 'input', 'output', 'cost', 'vcpu', 'memory_gb', 'vram_gb', 'hourly_rate'
    value REAL,                -- Numeric value
    unit TEXT,                 -- Optional: Unit if not implied by metric_name or tier unit
    provider TEXT,             -- Optional: For cloud instances (e.g., AWS, GCP)
    architecture TEXT,         -- Optional: For hardware specs
    gpus INTEGER,              -- Optional: For hardware specs
    topology TEXT,             -- Optional: For hardware specs
    accelerator_memory TEXT,   -- Optional: For hardware specs
    FOREIGN KEY (tier_id) REFERENCES tool_pricing_tiers(id) ON DELETE CASCADE
);
"""

# --- Helper Functions ---
def safe_get(data, key, default=None):
    """Safely get a value from a dictionary."""
    return data.get(key, default) if isinstance(data, dict) else default

def insert_simple_list(cursor, tool_id, data, key, table_name, column_name):
    """Insert items from a list in the JSON into a simple list table."""
    items = safe_get(data, key, [])
    if items and isinstance(items, list):
        cursor.executemany(
            f"INSERT INTO {table_name} (tool_id, {column_name}) VALUES (?, ?)",
            [(tool_id, item) for item in items if item]
        )

def insert_structured_list(cursor, tool_id, data, key, table_name, columns):
    """Insert items from a list of objects into a structured list table."""
    items = safe_get(data, key, [])
    if items and isinstance(items, list):
        placeholders = ', '.join(['?'] * (len(columns)))
        sql = f"INSERT INTO {table_name} (tool_id, {', '.join(columns)}) VALUES (?, {placeholders})"
        rows_to_insert = []
        for item in items:
            if isinstance(item, dict):
                # Handle dictionary items (original logic)
                row_values = [safe_get(item, col) for col in columns]
                rows_to_insert.append(tuple([tool_id] + row_values))
            elif isinstance(item, str) and table_name == 'tool_use_cases' and 'description' in columns:
                # Handle string items specifically for tool_use_cases table
                # Assumes 'description' is the primary column to populate from the string
                row_values = []
                for col in columns:
                    if col == 'description':
                        row_values.append(item) # Put the string in the description column
                    else:
                        row_values.append(None) # Set other columns (title, example) to None
                rows_to_insert.append(tuple([tool_id] + row_values))
        if rows_to_insert:
            cursor.executemany(sql, rows_to_insert)

def process_pricing(cursor, tool_id, pricing_data):
    """Parse the complex pricing JSON and insert into normalized tables."""
    if not isinstance(pricing_data, dict):
        logging.warning(f"Tool ID {tool_id}: Pricing data is not a dictionary. Skipping.")
        return

    # --- Handle Simple Tiers (like ElevenLabs, Perplexity Pro/Enterprise) ---
    if 'paid_tiers' in pricing_data and isinstance(pricing_data['paid_tiers'], list):
        for tier_info in pricing_data['paid_tiers']:
            if isinstance(tier_info, dict):
                tier_name = safe_get(tier_info, 'name')
                price_desc = safe_get(tier_info, 'price')
                tier_desc = safe_get(tier_info, 'description') # Midjourney uses this
                unit = 'per month' if price_desc and '/month' in str(price_desc) else None # Basic unit inference

                if tier_name:
                    cursor.execute(
                        "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, tier_description, unit) VALUES (?, ?, ?, ?, ?)",
                        (tool_id, tier_name, str(price_desc) if price_desc else None, tier_desc, unit)
                    )
                    tier_id = cursor.lastrowid
                    # Insert features for this tier
                    features = safe_get(tier_info, 'features', [])
                    if features and isinstance(features, list):
                        cursor.executemany(
                            "INSERT INTO tool_pricing_tier_features (tier_id, feature) VALUES (?, ?)",
                            [(tier_id, feature) for feature in features if feature]
                        )

    # --- Handle Free Tier Description ---
    free_tier_desc = safe_get(pricing_data, 'free_tier')
    if free_tier_desc:
         cursor.execute(
            "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, tier_description, unit) VALUES (?, ?, ?, ?, ?)",
            (tool_id, "Free Tier", "$0", str(free_tier_desc), None)
         )


    # --- Handle OpenAI-style Model Pricing ---
    for model_category_key in ['reasoning_models', 'gpt_models', 'fine_tuning']:
        model_category = safe_get(pricing_data, model_category_key)
        if isinstance(model_category, dict):
            for model_name, metrics in model_category.items():
                if isinstance(metrics, dict):
                    # Create a tier for the model itself
                    unit = safe_get(metrics, 'unit')
                    cursor.execute(
                        "INSERT INTO tool_pricing_tiers (tool_id, tier_name, unit) VALUES (?, ?, ?)",
                        (tool_id, f"{model_category_key.replace('_',' ').title()} - {model_name}", unit)
                    )
                    tier_id = cursor.lastrowid
                    # Insert metrics for this model tier
                    for metric_name, value in metrics.items():
                        if metric_name != 'unit' and value is not None:
                             try:
                                 numeric_value = float(value)
                                 cursor.execute(
                                     "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                                     (tier_id, metric_name, numeric_value, unit) # Use tier's unit
                                 )
                             except (ValueError, TypeError):
                                 logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not convert metric '{metric_name}' value '{value}' to float.")


    # --- Handle OpenAI Tool Usage Pricing ---
    tool_usage = safe_get(pricing_data, 'tool_usage')
    if isinstance(tool_usage, dict):
         for tool_name, tool_data in tool_usage.items():
             if isinstance(tool_data, dict):
                 cost = safe_get(tool_data, 'cost')
                 unit = safe_get(tool_data, 'unit')
                 # Simple cost per unit
                 if cost is not None and unit:
                     cursor.execute(
                         "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                         (tool_id, f"Tool Usage - {tool_name.replace('_',' ').title()}", str(cost), unit)
                     )
                     tier_id = cursor.lastrowid
                     try:
                         numeric_cost = float(cost)
                         cursor.execute(
                             "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                             (tier_id, 'cost', numeric_cost, unit)
                         )
                     except (ValueError, TypeError):
                          logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not convert tool usage cost '{cost}' to float.")
                 # Nested structure (like web_search_tool_call) - needs specific handling
                 elif tool_name == 'web_search_tool_call' and isinstance(tool_data, dict):
                     for model_key, model_pricing in tool_data.items():
                         if isinstance(model_pricing, dict) and 'search_context_size' in model_pricing:
                             context_sizes = safe_get(model_pricing, 'search_context_size')
                             unit = safe_get(context_sizes, 'unit')
                             if isinstance(context_sizes, dict) and unit:
                                 for size_key, size_cost in context_sizes.items():
                                     if size_key != 'unit':
                                         tier_name_detail = f"Tool Usage - Web Search - {model_key} - {size_key} context"
                                         cursor.execute(
                                             "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                                             (tool_id, tier_name_detail, str(size_cost), unit)
                                         )
                                         tier_id = cursor.lastrowid
                                         try:
                                             numeric_size_cost = float(size_cost)
                                             cursor.execute(
                                                 "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                                                 (tier_id, 'cost', numeric_size_cost, unit)
                                             )
                                         except (ValueError, TypeError):
                                             logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not convert web search cost '{size_cost}' to float.")


    # --- Handle AWS Rekognition style pricing_table ---
    pricing_table = safe_get(pricing_data, 'pricing_table')
    if isinstance(pricing_table, list):
        for item in pricing_table:
            if isinstance(item, dict):
                feature_desc = safe_get(item, 'feature')
                price_desc = safe_get(item, 'price')
                if feature_desc and price_desc:
                    # Basic unit inference
                    unit = None
                    if 'per image' in price_desc: unit = 'per image'
                    elif 'per minute' in price_desc: unit = 'per minute'
                    elif 'per Compute Hour' in price_desc: unit = 'per Compute Hour'
                    elif 'per month' in price_desc: unit = 'per month'

                    cursor.execute(
                        "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                        (tool_id, feature_desc, str(price_desc), unit)
                    )
                    # Could try to parse numeric value for metrics, but price_desc is complex here

    # --- Handle Hugging Face style hardware/instance pricing ---
    for hf_category_key in ['spaces_hardware', 'spaces_persistent_storage', 'inference_endpoints']:
        hf_category = safe_get(pricing_data, hf_category_key)
        if isinstance(hf_category, dict):
            if hf_category_key == 'inference_endpoints': # Nested list structure
                 for instance_type in ['cpu_instances', 'gpu_instances', 'accelerator_instances']:
                     instances = safe_get(hf_category, instance_type, [])
                     if isinstance(instances, list):
                         for instance in instances:
                             if isinstance(instance, dict):
                                 provider = safe_get(instance, 'provider')
                                 arch = safe_get(instance, 'architecture')
                                 rate = safe_get(instance, 'hourly_rate')
                                 tier_name = f"Inference Endpoint - {provider.upper() if provider else ''} {arch} ({instance_type.split('_')[0]})"
                                 # Add more details to name if needed
                                 cursor.execute(
                                     "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                                     (tool_id, tier_name, str(rate) if rate is not None else None, 'per hour')
                                 )
                                 tier_id = cursor.lastrowid
                                 # Insert metrics
                                 for metric, value in instance.items():
                                     if metric != 'hourly_rate' and value is not None:
                                         try:
                                             numeric_value = float(value) if metric not in ['provider', 'architecture', 'memory', 'gpu_memory', 'topology', 'accelerator_memory'] else None
                                             cursor.execute(
                                                 "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit, provider, architecture, gpus, topology, accelerator_memory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                                 (tier_id, metric, numeric_value if numeric_value is not None else str(value), # Store non-numeric specs as string in value
                                                  None, # Unit is on tier
                                                  provider if metric == 'provider' else None,
                                                  arch if metric == 'architecture' else None,
                                                  int(value) if metric == 'gpus' else None,
                                                  value if metric == 'topology' else None,
                                                  value if metric == 'accelerator_memory' else None
                                                  )
                                             )
                                         except (ValueError, TypeError):
                                              logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not process metric '{metric}' value '{value}'. Storing as text.")
                                              cursor.execute(
                                                 "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit, provider, architecture, gpus, topology, accelerator_memory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                                 (tier_id, metric, str(value), None, None, None, None, None, None)
                                             )


            else: # Direct key-value structure (spaces_hardware, spaces_persistent_storage)
                for item_name, specs in hf_category.items():
                    if isinstance(specs, dict):
                        price = safe_get(specs, 'hourly_price') or safe_get(specs, 'monthly_price')
                        unit = 'per hour' if 'hourly_price' in specs else ('per month' if 'monthly_price' in specs else None)
                        tier_name = f"{hf_category_key.replace('_',' ').title()} - {item_name}"
                        cursor.execute(
                            "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                            (tool_id, tier_name, str(price) if price is not None else None, unit)
                        )
                        tier_id = cursor.lastrowid
                        # Insert metrics
                        for metric, value in specs.items():
                             if metric not in ['hourly_price', 'monthly_price'] and value is not None:
                                 try:
                                     numeric_value = float(value) if metric not in ['memory', 'accelerator', 'storage'] else None
                                     cursor.execute(
                                         "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                                         (tier_id, metric, numeric_value if numeric_value is not None else str(value), None) # Unit is on tier
                                     )
                                 except (ValueError, TypeError):
                                     logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not convert metric '{metric}' value '{value}' to float. Storing as text.")
                                     cursor.execute(
                                         "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                                         (tier_id, metric, str(value), None)
                                     )

    # --- Handle Google Cloud NLP style tiered pricing per feature ---
    if 'paid_tiers' in pricing_data and isinstance(pricing_data['paid_tiers'], list):
         # Check if the first element has a 'tiers' sub-list (GCP NLP structure)
         first_paid_tier = pricing_data['paid_tiers'][0] if pricing_data['paid_tiers'] else {}
         if isinstance(first_paid_tier, dict) and 'tiers' in first_paid_tier and 'feature' in first_paid_tier:
             for feature_pricing in pricing_data['paid_tiers']:
                 if isinstance(feature_pricing, dict):
                     feature_name = safe_get(feature_pricing, 'feature')
                     unit_size = safe_get(feature_pricing, 'unit_size', 1000) # Default unit size
                     unit_desc = f"per {unit_size} characters"
                     volume_tiers = safe_get(feature_pricing, 'tiers', [])
                     if feature_name and isinstance(volume_tiers, list):
                         for volume_tier in volume_tiers:
                             if isinstance(volume_tier, dict):
                                 usage_range = safe_get(volume_tier, 'range')
                                 price_per_unit = safe_get(volume_tier, 'price_per_unit')
                                 if usage_range and price_per_unit is not None:
                                     tier_name = f"{feature_name} - {usage_range}"
                                     cursor.execute(
                                         "INSERT INTO tool_pricing_tiers (tool_id, tier_name, price_description, unit) VALUES (?, ?, ?, ?)",
                                         (tool_id, tier_name, str(price_per_unit), unit_desc)
                                     )
                                     # Optionally add price_per_unit to metrics as well
                                     tier_id = cursor.lastrowid
                                     try:
                                         numeric_price = float(price_per_unit)
                                         cursor.execute(
                                             "INSERT INTO tool_pricing_metrics (tier_id, metric_name, value, unit) VALUES (?, ?, ?, ?)",
                                             (tier_id, 'price_per_unit', numeric_price, unit_desc)
                                         )
                                     except (ValueError, TypeError):
                                          logging.warning(f"Tool ID {tool_id}, Tier {tier_id}: Could not convert GCP price '{price_per_unit}' to float.")


# --- Main Execution ---
def main():
    logging.info("Starting database migration...")

    # 1. Backup existing database
    if os.path.exists(DB_PATH):
        try:
            shutil.copy2(DB_PATH, BACKUP_PATH)
            logging.info(f"Database backed up to {BACKUP_PATH}")
        except Exception as e:
            logging.error(f"Failed to backup database: {e}")
            return # Stop migration if backup fails
    else:
        logging.warning(f"Database file not found at {DB_PATH}. A new one will be created.")

    # 2. Connect to SQLite database
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        logging.info("Database connection established.")

        # 3. Create new schema
        logging.info("Creating new schema...")
        cursor.executescript(SCHEMA)
        logging.info("New schema created successfully.")

        # 4. Find JSON files in the data directory
        logging.info(f"Scanning for JSON files in {DATA_DIR}...")
        json_files_to_process = []
        try:
            for filename in os.listdir(DATA_DIR):
                if filename.endswith(".json") and filename != "ai_tool_schema_template.json":
                    filepath = os.path.join(DATA_DIR, filename)
                    json_files_to_process.append((filename, filepath))
            logging.info(f"Found {len(json_files_to_process)} JSON files to process.")
            if not json_files_to_process:
                logging.warning("No JSON files found in the data directory. Database will be empty.")
                # Optionally, you might want to exit here if no JSON files is an error
                # return
        except FileNotFoundError:
            logging.error(f"Data directory not found: {DATA_DIR}")
            return # Stop if data directory doesn't exist
        except Exception as e:
            logging.error(f"Error scanning data directory: {e}")
            return # Stop on other directory scanning errors

        # 5. Process and insert data from JSON files into new tables
        logging.info("Processing and inserting data from JSON files into new tables...")
        for filename, filepath in json_files_to_process:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    json_data_str = f.read()
                    # Handle potential BOM (Byte Order Mark) at the start of the file
                    if json_data_str.startswith('\ufeff'):
                        json_data_str = json_data_str[1:]
                    data = json.loads(json_data_str)
                logging.info(f"Processing {filename}...")

                # --- Insert into `tools` table ---
                tech_specs = safe_get(data, 'technical_specifications', {})
                user_reviews = safe_get(data, 'user_reviews', {})
                benchmarks = safe_get(data, 'benchmark_scores', {})
                security = safe_get(data, 'security_compliance', {})
                pricing = safe_get(data, 'pricing', {})

                cursor.execute(
                    """
                    INSERT INTO tools (
                        name, category, description, image_url, documentation_url, api_url, sdk_url,
                        scalability, pricing_model_description, pricing_notes, tech_spec_api_type,
                        tech_spec_sdks, user_reviews_summary, benchmark_overall, benchmark_accuracy,
                        benchmark_speed, benchmark_task_specific_notes, security_data_protection,
                        feature_visualization_mermaid, last_updated, original_filename
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        safe_get(data, 'name'), safe_get(data, 'category'), safe_get(data, 'description'),
                        safe_get(data, 'image_url'), safe_get(data, 'documentation_url'), safe_get(data, 'api_url'),
                        safe_get(data, 'sdk_url'), safe_get(data, 'scalability'),
                        safe_get(pricing, 'model'), safe_get(pricing, 'notes') or safe_get(pricing, 'overall_notes'),
                        safe_get(tech_specs, 'api_type'), json.dumps(safe_get(tech_specs, 'sdks')), # Store SDK list as JSON string
                        safe_get(user_reviews, 'summary'), safe_get(benchmarks, 'overall_performance'),
                        safe_get(benchmarks, 'accuracy'), safe_get(benchmarks, 'speed'),
                        json.dumps(safe_get(benchmarks, 'task_specific')), # Store task_specific dict as JSON
                        safe_get(security, 'data_protection'), safe_get(data, 'feature_visualization_mermaid'),
                        safe_get(data, 'last_updated'), filename
                    )
                )
                tool_id = cursor.lastrowid

                # --- Insert into simple list tables ---
                insert_simple_list(cursor, tool_id, data, 'features', 'tool_features', 'feature')
                insert_simple_list(cursor, tool_id, data, 'pros', 'tool_pros', 'pro')
                insert_simple_list(cursor, tool_id, data, 'cons', 'tool_cons', 'con')
                insert_simple_list(cursor, tool_id, data, 'integration_capabilities', 'tool_integrations', 'integration')
                insert_simple_list(cursor, tool_id, data, 'support_options', 'tool_support_options', 'support_option')
                insert_simple_list(cursor, tool_id, data, 'data_source_urls', 'tool_data_source_urls', 'url')
                insert_simple_list(cursor, tool_id, security, 'certifications', 'tool_security_certifications', 'certification')
                insert_simple_list(cursor, tool_id, data, 'review_references', 'tool_review_references', 'url') # Added for HF

                # --- Insert into structured list tables ---
                insert_structured_list(cursor, tool_id, data, 'use_cases', 'tool_use_cases', ['title', 'description', 'example'])
                insert_structured_list(cursor, tool_id, data, 'training_resources', 'tool_training_resources', ['type', 'url', 'description'])

                # --- Insert User Review Details ---
                review_sources = safe_get(user_reviews, 'sources', [])
                if review_sources and isinstance(review_sources, list):
                    rows_to_insert = []
                    for source in review_sources:
                        if isinstance(source, dict):
                             highlights_str = json.dumps(safe_get(source, 'highlights')) if safe_get(source, 'highlights') else None
                             rows_to_insert.append((
                                 tool_id,
                                 safe_get(source, 'name') or safe_get(source, 'source_name'), # Handle different naming
                                 safe_get(source, 'rating'),
                                 safe_get(source, 'review_count'),
                                 highlights_str,
                                 safe_get(source, 'source_url')
                             ))
                    if rows_to_insert:
                         cursor.executemany(
                             "INSERT INTO tool_user_review_details (tool_id, source_name, rating, review_count, highlights, source_url) VALUES (?, ?, ?, ?, ?, ?)",
                             rows_to_insert
                         )

                # --- Insert User Review Common Uses ---
                common_uses = safe_get(user_reviews, 'common_uses_from_reviews', [])
                if common_uses and isinstance(common_uses, list):
                     cursor.executemany(
                         "INSERT INTO tool_user_review_common_uses (tool_id, use_description) VALUES (?, ?)",
                         [(tool_id, use) for use in common_uses if use]
                     )

                # --- Process Pricing ---
                process_pricing(cursor, tool_id, pricing)

                logging.info(f"Successfully processed {filename} (New Tool ID: {tool_id})")
                conn.commit() # Commit after successfully processing each file
                logging.debug(f"Committed changes for {filename}")

            except json.JSONDecodeError as e:
                logging.error(f"Failed to decode JSON for {filename}: {e}")
                # No rollback here, as we want to keep previous successful commits
            except Exception as e:
                logging.error(f"Error processing {filename}: {e}", exc_info=True)
                # No rollback here
                logging.warning(f"Skipping {filename} due to error, previously committed files are safe.")


        # 6. (Optional) Clean up or vacuum database if needed
        # logging.info("Vacuuming database...")
        # cursor.execute("VACUUM")

        # 7. Final commit removed (commits happen per file now)
        logging.info("Finished processing all files.")

    except sqlite3.Error as e:
        logging.error(f"Database error during migration: {e}", exc_info=True)
        if conn:
            conn.rollback()
            logging.info("Database changes rolled back.")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}", exc_info=True)
        if conn:
            conn.rollback()
            logging.info("Database changes rolled back.")
    finally:
        if conn:
            conn.close()
            logging.info("Database connection closed.")

    logging.info("Database migration script finished.")

if __name__ == "__main__":
    main()