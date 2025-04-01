# Plan: Enhance Text Parser (Focus: Client-Side Pricing Scraper)

**Objective:** Analyze the existing text parsing logic within `website/js/utils/dataLoader.js`, specifically the pricing data scraping functionality, and implement incremental improvements to enhance its robustness, accuracy, and error handling.

**Primary Target File:** `website/js/utils/dataLoader.js`

---

## Phase 1: Incremental Improvement of Client-Side Pricing Scraper

This phase focuses on refining the existing JavaScript code responsible for fetching and parsing pricing information from external URLs.

**1. Analysis & Benchmarking:**

- **Identify Failure Cases:**
  - Select a diverse benchmark set of 10-15 `data_source_urls` (containing "pricing" or "cost") from various JSON files in `ai_tools_resource/data/`.
  - Execute the current `fetchPricingData` function for each benchmark URL.
  - Document results: Success (correct data), Partial Success (incomplete/minor errors), Failure (no data/major errors).
  - Categorize failure reasons:
    - Non-standard HTML table structure
    - Pricing data loaded dynamically via JavaScript
    - Uncommon/Obfuscated CSS class names or HTML structure
    - Keyword misses (pricing terms not in `PRICING_KEYWORDS`)
    - Target URL returns JSON instead of HTML
    - Proxy or fetch errors
- **Performance Measurement:**
  - Record the execution time of `fetchPricingData` for each benchmark URL using `performance.now()` or similar.
  - Note any significant delays or outliers.
- **Code Review:**
  - Analyze `scoreElementByKeywords`, `extractTableData`, `extractDivPricing` functions in `dataLoader.js`.
  - Identify specific logic points contributing to the documented failures.
  - Review current error handling (`try...catch`, `console.warn`) for clarity and completeness.

**2. Proposed Enhancements (Client-Side in `dataLoader.js`):**

- **Refine Heuristics:**
  - **Keywords:** Expand `PRICING_KEYWORDS` (lines 56-60) based on terms identified during failure analysis (e.g., "subscription", "license", "credits", "per seat", additional currency symbols/codes).
  - **Selectors:** Add alternative CSS selectors in `extractDivPricing` (line 175) and potentially `extractTableData` targeting common patterns (e.g., `div[data-testid*="pricing"]`, `section[aria-label*="pricing"]`, framework-specific classes if common patterns emerge).
  - **Structure Handling:**
    - Improve table header detection (`extractTableData`, lines 85-104): Give more weight to `<th>` elements, check for common header words (plan, feature, price, cost, limit) more explicitly.
    - _Optional:_ Add basic support for definition lists (`<dl>`, `<dt>`, `<dd>`) within `fetchPricingData` if analysis shows this is a common pattern for pricing.
  - **Content Cleaning:** Implement minor text normalization within extraction functions (e.g., remove "Starting at", standardize currency symbols, trim extra whitespace/newlines).
- **Improve Error Handling & Fallback:**
  - **Specific Logging:** Enhance `console.warn` messages (e.g., lines 112, 120, 152, 158, 248, 280, 289, 297) to provide more context about the failure (e.g., "No pricing table found matching keywords", "Multiple potential pricing tables found, using highest score", "Table structure mismatch - header/cell count differs", "Fetch failed via proxy").
  - **Frontend Feedback Integration:**
    - Ensure `fetchPricingData` consistently returns `null` on failure.
    - Modify the calling code (likely in `website/js/tool-details.js` or `website/js/components/PricingTab.js`) to check for `null` or empty pricing data.
    - When data is missing/null, display a user-friendly message (e.g., "Pricing details could not be automatically retrieved. Please check the source link.") instead of showing an empty or broken table/component.

**3. Metrics for Success (Phase 1 - Option A):**

- **Accuracy/Coverage:** Achieve a 15-20% increase (relative to the initial benchmark) in the number of benchmark URLs where pricing is successfully and correctly extracted.
- **Error Reduction:** Measurable decrease in the frequency of pricing-related `console.warn` and `console.error` messages during testing with benchmark URLs.
- **Qualitative:** Reduced instances of obviously incorrect, incomplete, or missing pricing data observed during manual testing of various tool detail pages.

---

## Phase 2: Parse Local JSON Content (Lower Priority)

This phase focuses on extracting structured information from the text fields _within_ the local JSON data files.

**1. Identify Targets:**

- Analyze the structure of JSON files in `ai_tools_resource/data/`.
- Identify text fields (e.g., `description`, `features.description`, `use_cases`, `integrations_description`) containing potentially valuable unstructured or semi-structured information.

**2. Proposed Techniques:**

- **Simple Regex/String Matching:** For extracting highly specific, consistent patterns (e.g., version numbers, explicit mentions of supported platforms/languages). Can be implemented client-side in `dataLoader.js` after loading JSON or server-side as a pre-processing step.
- **NLP Techniques (Server-Side Recommended):** If more complex extraction is needed:
  - **Named Entity Recognition (NER):** Extract technologies, platforms, organizations (using Python libraries like `spaCy`, `NLTK` in a backend script).
  - **Keyword Extraction:** Identify key terms/tags from feature descriptions.
  - **Classification:** Auto-categorize tools based on text content.
  - Store extracted information as new structured fields in the JSON files via a backend script.

**3. Metrics for Success (Phase 2):**

- **Extraction Quality:** F1-score or manual evaluation for specific extraction tasks (e.g., accuracy of extracted technology names).
- **Data Enrichment:** Successful population of new structured fields in the JSON data based on parsed text content.

---

**Implementation Approach:**

- Proceed with Phase 1 first.
- Implement changes iteratively within `website/js/utils/dataLoader.js` and related frontend components.
- Test against benchmark URLs after each significant change.
- Address Phase 2 only after Phase 1 improvements are deemed sufficient or if priorities change.
