# Automated Workflow for Website CMS Updates

## Overview

This document outlines the design for an automated workflow to handle regular updates to the website's CMS. The workflow will:

1.  Periodically check for new AI tool data or updates in the master dataset (Google Sheet).
2.  Flag new/updated content for review.
3.  Allow editors to approve changes.
4.  Automatically update the relevant website pages upon approval.
5.  Generate a weekly content audit report identifying pages not updated in the last 3 months.

## Workflow Diagram

```mermaid
graph LR
    A[Google Sheet (Master Dataset)] --> B{Check for Updates};
    B -- New/Updated Data --> C{Flag Content for Review};
    C --> D{Editor Approval Interface};
    D -- Approved --> E{Update JSON Data Files};
    E --> F[Website (ai_tools_resource/website)];
    B -- No Updates --> G[Weekly Content Audit Report];
    G -- Pages Not Updated in 3 Months --> H[Report Output];
    F --> I{Generate Website Pages};
    I --> F;
```

## Detailed Plan

1.  **Data Ingestion:**
    *   **Goal:** Periodically check the Google Sheet for new or updated AI tool data.
    *   **Method:**
        *   Use the Google Sheets API to access the master dataset.
        *   Write a script (e.g., Python) to:
            *   Download the Google Sheet data as a CSV or JSON file.
            *   Compare the downloaded data with the existing JSON data files in the `ai_tools_resource/data/` directory.
            *   Identify new or updated entries based on a unique identifier (e.g., tool name) and the `last_updated` field.
    *   **Schedule:** Run the script weekly using a task scheduler (e.g., cron).

2.  **Content Flagging:**
    *   **Goal:** Flag new or updated content for review.
    *   **Method:**
        *   Modify the data ingestion script to:
            *   Create a new JSON file (e.g., `ai_tools_resource/data/updates.json`) to store the new or updated entries.
            *   Include a "status" field (e.g., "pending", "approved", "rejected") for each entry in the `updates.json` file.

3.  **Editor Approval Interface:**
    *   **Goal:** Create an interface for editors to review and approve changes.
    *   **Method:**
        *   Since this is a static site, a simple HTML interface with JavaScript can be created.
        *   The interface will:
            *   Read the data from the `updates.json` file.
            *   Display the new or updated entries in a table or list format.
            *   Provide buttons for approving or rejecting each entry.
            *   Update the "status" field in the `updates.json` file based on the editor's action.
        *   The interface can be accessed by opening an HTML file in a browser.

4.  **Website Updates:**
    *   **Goal:** Automatically update the relevant website pages upon approval.
    *   **Method:**
        *   Modify the data ingestion script to:
            *   Read the `updates.json` file.
            *   For each entry with "status" set to "approved":
                *   Update the corresponding JSON data file in the `ai_tools_resource/data/` directory with the new or updated data.
                *   Remove the entry from the `updates.json` file.
        *   Modify the `updateLastUpdated()` function in `ai_tools_resource/website/js/main.js` to read the `last_updated` field from all JSON files in the `ai_tools_resource/data/` directory and display the most recent date.

5.  **Content Audit Report:**
    *   **Goal:** Generate a weekly report identifying pages not updated in the last 3 months.
    *   **Method:**
        *   Write a script (e.g., Python) to:
            *   Read the `last_updated` field from all JSON files in the `ai_tools_resource/data/` directory.
            *   Identify the files that have not been updated in the last 3 months.
            *   Generate a report in a suitable format (e.g., CSV, HTML) listing the outdated files.
        *   Schedule the script to run weekly using a task scheduler (e.g., cron).