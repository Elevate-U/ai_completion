import os
import json
import requests
from bs4 import BeautifulSoup
import logging
import time

# --- Configuration ---
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
# Simple keywords to help identify potentially relevant tables/sections
PRICING_KEYWORDS = [
    'price', 'pricing', 'cost', 'plan', 'tier', 'rate', 'fee', 'charge',
    'usd', 'eur', 'gbp', '$', '€', '£', '/mo', '/yr', 'month', 'year',
    'feature', 'limit', 'user', 'request', 'api', 'call', 'storage', 'gb', 'mb',
    'free', 'basic', 'standard', 'pro', 'premium', 'enterprise', 'business',
    'unit', 'character', 'record', 'training', 'inference', 'endpoint'
]
# Minimum keyword score for a table to be considered relevant
MIN_TABLE_SCORE = 2
# User agent for requests
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
REQUEST_TIMEOUT = 15 # seconds

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Helper Functions ---

def normalize_text(text):
    """Cleans up extracted text."""
    if not isinstance(text, str):
        return ''
    # Replace various whitespace chars with a single space, collapse multiple spaces, trim
    text = ' '.join(text.split()).strip()
    return text

def score_element_by_keywords(element, keywords):
    """Scores an element based on keyword presence in its text content."""
    if not element or not hasattr(element, 'get_text'):
        return 0
    text = element.get_text().lower()
    score = sum(1 for keyword in keywords if keyword in text)
    return score

def extract_table_data(table_element):
    """Extracts data rows from an HTML table element."""
    headers = []
    data_rows = []
    header_row_found = False

    # Try finding headers in <thead> first
    thead = table_element.find('thead')
    if thead:
        header_cells = thead.find_all(['th', 'td'], recursive=False) # Check direct children first
        if not header_cells: # If no direct children, check deeper
             header_cells = thead.find_all(['th', 'td'])
        if header_cells:
            headers = [normalize_text(cell.get_text()) for cell in header_cells]
            header_row_found = True
            logging.debug(f"Found headers in thead: {headers}")

    # If no thead headers, check first few rows of the table body/table itself
    if not header_row_found:
        rows = table_element.find_all('tr', limit=3) # Check first 3 rows
        for i, row in enumerate(rows):
            potential_header_cells = row.find_all(['th', 'td'])
            # Basic heuristic: more th elements or fewer numbers might indicate a header
            th_count = len(row.find_all('th'))
            text_content = normalize_text(row.get_text())
            numeric_chars = sum(c.isdigit() for c in text_content)
            if potential_header_cells and (th_count > len(potential_header_cells) / 2 or numeric_chars < len(text_content) / 4):
                 headers = [normalize_text(cell.get_text()) for cell in potential_header_cells]
                 header_row_found = True
                 logging.debug(f"Found potential headers in row {i}: {headers}")
                 # Assume rows after this are data rows
                 data_rows.extend(table_element.find_all('tr')[i+1:])
                 break # Stop after finding first potential header row

    # If still no headers, use generic ones based on first data row cell count
    all_rows = table_element.find_all('tr')
    if not data_rows: # If headers were in thead or not found, get all rows
        start_index = 1 if header_row_found else 0 # Skip header row if found in thead
        data_rows = all_rows[start_index:]

    if not headers and data_rows:
         first_data_cells = data_rows[0].find_all(['td', 'th'])
         headers = [f"Column {i+1}" for i in range(len(first_data_cells))]
         logging.warning(f"Could not detect headers reliably, using generic: {headers}")
    elif not headers and not data_rows:
         logging.warning("Table has no detectable headers or data rows.")
         return [] # Return empty if no headers and no data

    # Extract data
    extracted_data = []
    num_headers = len(headers)
    for row in data_rows:
        cells = row.find_all(['td', 'th'])
        # Simple handling for cells spanning multiple columns (colspan)
        row_data_list = []
        cell_idx = 0
        for cell in cells:
            colspan = int(cell.get('colspan', 1))
            cell_text = normalize_text(cell.get_text())
            for _ in range(colspan):
                 if cell_idx < num_headers: # Avoid index out of bounds
                     row_data_list.append(cell_text)
                     cell_idx += 1
                 else:
                     logging.warning(f"Row has more effective cells (colspan) than headers ({num_headers}). Data: {cell_text}")
                     break # Stop processing cells for this row if mismatch

        # Pad row if it has fewer cells than headers
        while len(row_data_list) < num_headers:
            row_data_list.append('')

        # Truncate row if it somehow has more cells than headers after padding attempt
        if len(row_data_list) > num_headers:
             logging.warning(f"Row has more cells ({len(row_data_list)}) than headers ({num_headers}) after processing. Truncating.")
             row_data_list = row_data_list[:num_headers]


        # Create dictionary only if the row isn't completely empty
        if any(cell_text for cell_text in row_data_list):
             extracted_data.append(dict(zip(headers, row_data_list)))

    return extracted_data


# Placeholder for the new function (to be implemented)
def extract_non_table_pricing(soup, keywords):
    """
    Extracts pricing information from non-table structures like divs, cards, etc.
    (Placeholder implementation)
    """
    logging.info("Attempting to extract pricing from non-table elements...")
    extracted_cards = []
    
    # --- Placeholder Logic ---
    # Example: Find divs that seem like pricing containers based on keywords
    potential_containers = []
    all_divs = soup.find_all('div')
    logging.debug(f"Found {len(all_divs)} total divs to check for non-table pricing.")
    
    # Simple heuristic: Find divs with a decent keyword score
    # This needs significant refinement based on actual website structures
    MIN_DIV_SCORE = 3 # Adjust this threshold as needed
    for i, div in enumerate(all_divs):
        # Avoid checking divs that are parents of already found pricing tables
        if div.find('table', recursive=False):
             continue # Skip if it directly contains a table

        score = score_element_by_keywords(div, keywords)
        if score >= MIN_DIV_SCORE:
             # Basic check to avoid huge, overly general divs
             text_len = len(normalize_text(div.get_text()))
             if text_len > 50 and text_len < 2000: # Arbitrary limits, needs tuning
                 logging.debug(f"Div {i} scored {score} (>= {MIN_DIV_SCORE}), considering as potential container.")
                 potential_containers.append(div)
             else:
                 logging.debug(f"Div {i} scored {score} but skipped due to text length ({text_len}).")


    logging.info(f"Found {len(potential_containers)} potential non-table pricing containers.")

    # TODO: Implement detailed extraction logic for each container
    # - Find plan name (h2, h3, specific class?)
    # - Find price (span/div with '$', class 'price'?)
    # - Find features (ul/li, divs with checkmarks?)
    # - Structure the output (list of dicts)

    # Example structure for a found card (replace with actual extracted data)
    # if potential_containers:
    #     extracted_cards.append({
    #         "title": "Example Plan Card",
    #         "price": "$10 / month",
    #         "features": ["Feature 1", "Feature 2"],
    #         "source_element_snippet": str(potential_containers[0])[:200] # For debugging
    #     })

    if not extracted_cards:
        logging.info("No non-table pricing structures identified with current heuristics.")
    
    return extracted_cards
def fetch_and_parse_pricing(url):
    """Fetches HTML from a URL and extracts pricing tables and non-table structures."""
    logging.info(f"Attempting to fetch pricing data from: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        logging.info(f"Successfully fetched content from {url} (Status: {response.status_code})")
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    all_tables = soup.find_all('table')
    logging.info(f"Found {len(all_tables)} table(s) on {url}.")

    # --- Table Extraction (Existing Logic) ---
    extracted_pricing_tables = []
    processed_tables = set() # Keep track of tables processed to avoid double counting parents
    for i, table in enumerate(all_tables):
        score = score_element_by_keywords(table, PRICING_KEYWORDS)
        # Also check parent elements slightly for context
        parent_score = score_element_by_keywords(table.parent, PRICING_KEYWORDS) if table.parent else 0
        total_score = score + parent_score // 2 # Give parent score less weight

        logging.debug(f"Table {i+1} score: {score} (Parent score contribution: {parent_score // 2}, Total: {total_score})")

        if total_score >= MIN_TABLE_SCORE:
            logging.info(f"Table {i+1} meets score threshold ({total_score} >= {MIN_TABLE_SCORE}). Extracting data.")
            table_data = extract_table_data(table)

            if table_data:
                # Try to find a title
                table_title = f"Pricing Table {len(extracted_pricing_tables) + 1}"
                # Look for preceding H2, H3, H4
                for sibling in table.find_previous_siblings(['h2', 'h3', 'h4'], limit=1):
                     table_title = normalize_text(sibling.get_text())
                     break
                # Look for caption inside table
                caption = table.find('caption')
                if caption:
                    table_title = normalize_text(caption.get_text())

                extracted_pricing_tables.append({
                    "title": table_title,
                    "data": table_data
                })
                processed_tables.add(table) # Mark this table as processed
                logging.info(f"Successfully extracted {len(table_data)} rows from Table {i+1} ('{table_title}').")
            else:
                logging.warning(f"Table {i+1} met score threshold but no data could be extracted.")
        else:
             logging.debug(f"Table {i+1} skipped (score {total_score} < {MIN_TABLE_SCORE}).")

    # --- Non-Table Extraction (New Logic) ---
    extracted_pricing_cards = extract_non_table_pricing(soup, PRICING_KEYWORDS)

    # --- Combine Results ---
    final_pricing_data = {}
    if extracted_pricing_tables:
        final_pricing_data["tables"] = extracted_pricing_tables
    if extracted_pricing_cards:
        final_pricing_data["cards"] = extracted_pricing_cards

    if not final_pricing_data:
        logging.warning(f"No suitable pricing tables or cards found on {url} based on current heuristics.")
        return None # Return None if nothing found

    return final_pricing_data

# --- Main Processing Logic ---

def update_all_pricing_data():
    """Iterates through JSON files, fetches pricing, and updates them."""
    logging.info(f"Starting pricing update process in directory: {DATA_DIR}")
    json_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json') and f != 'ai_tool_schema_template.json' and f != 'tool_analysis_results.json' and f != 'ai_updates_review.json']
    logging.info(f"Found {len(json_files)} tool JSON files to process.")

    for filename in json_files:
        filepath = os.path.join(DATA_DIR, filename)
        logging.info(f"--- Processing file: {filename} ---")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                tool_data = json.load(f)
        except Exception as e:
            logging.error(f"Failed to load or parse JSON from {filename}: {e}")
            continue

        pricing_url = None
        if 'data_source_urls' in tool_data and isinstance(tool_data['data_source_urls'], list):
            for url in tool_data['data_source_urls']:
                if isinstance(url, str) and ('pricing' in url.lower() or 'cost' in url.lower()):
                    pricing_url = url
                    break # Use the first found pricing URL

        if pricing_url:
            scraped_data = fetch_and_parse_pricing(pricing_url)
            if scraped_data:
                if 'pricing' not in tool_data or not isinstance(tool_data['pricing'], dict):
                    tool_data['pricing'] = {}

                # Store potentially both tables and cards
                if "tables" in scraped_data:
                     tool_data['pricing']['scraped_pricing_tables'] = scraped_data["tables"]
                if "cards" in scraped_data:
                     tool_data['pricing']['scraped_pricing_cards'] = scraped_data["cards"]
                
                # Always update timestamp if any data was scraped
                tool_data['pricing']['last_scraped_utc'] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                logging.info(f"Successfully scraped pricing data (tables: {len(scraped_data.get('tables',[]))}, cards: {len(scraped_data.get('cards',[]))}) for {filename}. Updating JSON.")

                # Write the updated data back to the file
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(tool_data, f, indent=2, ensure_ascii=False)
                    logging.info(f"Successfully updated {filename}.")
                except Exception as e:
                    logging.error(f"Failed to write updated JSON to {filename}: {e}")
            else:
                logging.warning(f"No pricing data could be scraped from {pricing_url} for {filename}.")
        else:
            logging.info(f"No pricing URL found in {filename}. Skipping scrape.")

        # Optional: Add a small delay between requests
        time.sleep(1)

    logging.info("--- Pricing update process finished ---")

if __name__ == "__main__":
    update_all_pricing_data()