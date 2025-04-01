# ThinkStack Project - Prompt Library

This document contains the prompt templates used throughout the project lifecycle.

## Table of Contents

- [Step 2: Comprehensive Research](#step-2-comprehensive-research)
- [Step 3: Data Compilation, Analysis, & Validation](#step-3-data-compilation-analysis--validation)
- [Step 4: Data Visualization & Chart Creation](#step-4-data-visualization--chart-creation)
- [Step 5: Website Design & Development](#step-5-website-design--development)
- [Step 6: Monetization & Advertising Integration](#step-6-monetization--advertising-integration)
- [Step 7: Final Testing, Launch, & Continuous Improvement](#step-7-final-testing-launch--continuous-improvement)

## Step 2: Comprehensive Research

### Initial Query Prompts

- **Template:** `List the most recent and top-rated AI tools in the [specific category] category. For each tool, provide detailed information on: Features, Pricing (including different tiers), Pros, Cons, Technical Specifications, User Reviews (summarized sentiment and key quotes if available), Integration Capabilities, Scalability, and Support Options. Ensure information is sourced from official websites, recent industry reports (mention publication dates), and reputable tech review sites published within the last 12 months.`
  - _Usage:_ Replace `[specific category]` with one of the defined categories (e.g., Natural Language Processing, Generative AI).

### Source Targeting Prompts

- **Template:** `Retrieve recent industry reports (published within the last 18 months) focusing on AI tools in the [specific category] space. Extract key findings, market trends, comparative analyses, and expert commentary related to features, adoption, and future outlook.`
  - _Usage:_ Replace `[specific category]` as needed.

### Data Extraction/Scraping Prompts (Conceptual)

- **Template:** `From the provided text content of [source URL/document name], extract the following data points for the AI tool "[tool name]": Features, Pricing, Pros, Cons, Technical Specifications, Integration Capabilities, Scalability, Support Options. Format the output as a structured JSON object.`
  - _Usage:_ This is a conceptual template for potential automation scripts. Requires careful implementation respecting terms of service.

## Step 3: Data Compilation, Analysis, & Validation

### Standardization Prompts

- **Template:** `Review the following dataset entries for AI tools. Standardize the data fields according to the defined schema (Name, Category, Features, Pros, Cons, Pricing, User Reviews, Tech Specs, Integrations, Scalability, Support). Identify and flag duplicate entries, inconsistent formatting (especially in Pricing and Tech Specs), and missing information. Suggest corrections for inconsistencies.`

### Comparative Analysis Prompts

- **Template:** `Based on the compiled dataset for the [specific category] category, rank the AI tools using the following weighted criteria: Feature Set (40%), Cost-Effectiveness (calculated from Pricing tiers) (25%), User Satisfaction (from User Reviews) (20%), Scalability (10%), Integration Capabilities (5%). Generate a comparative summary table and a brief narrative highlighting the top 3 tools and their key differentiators.`

### Quality Assurance/Validation Prompts

- **Template:** `Cross-reference the "Pros" and "Cons" listed for "[tool name]" in our dataset against information found at [source URL 1] and [source URL 2]. Verify the claims and flag any discrepancies or unsupported points. Summarize the verification findings.`
- **Template:** `Analyze the "User Reviews" data for "[tool name]". Check for consistency in sentiment across different sources. Identify any potential biases or outliers in the review data. Provide a confidence score (Low, Medium, High) for the overall user sentiment.`

## Step 4: Data Visualization & Chart Creation

### Visualization Planning Prompts

- **Template:** `Given the dataset comparing AI tools in [specific category] based on [data point 1], [data point 2], and [data point 3], recommend the most effective visualization type (e.g., bar chart, scatter plot, radar chart, heatmap) to clearly illustrate the comparisons and highlight key differences. Justify your recommendation.`

### Visualization Generation Prompts (Conceptual for Libraries like D3.js/Chart.js)

- **Template:** `Generate the necessary JavaScript code using [Chart.js/D3.js] to create an interactive [chart type] based on the following data: [structured data snippet]. The chart should compare [tool names or categories] based on [metric 1] and [metric 2]. Ensure the chart includes tooltips displaying detailed values, interactive filtering options for [filter criteria], and adheres to the project's visual style guide (colors, fonts).`

### Visualization Testing Prompts

- **Template:** `Analyze the provided user feedback regarding the [chart type] visualization for [specific category]. Summarize the key points related to clarity, usability, and information density. Based on the feedback, suggest specific, actionable refinements to improve the visualization.`

## Step 5: Website Design & Development

### UI/UX Blueprint Prompts

- **Template:** `Propose a modern, clean website layout concept for the ThinkStack project. The design should prioritize intuitive navigation, clear presentation of complex data (including integrated visualizations), mobile responsiveness, and strategically placed areas for monetization (ads/affiliate links). Include suggestions for key sections (Homepage, Category Pages, Tool Comparison Pages, Blog/Articles).`

### CMS Workflow Prompts

- **Template:** `Design an automated workflow for the website's CMS to handle regular updates. The workflow should: 1. Periodically check for new AI tool data or updates in the master dataset. 2. Flag new/updated content for review. 3. Allow editors to approve changes. 4. Automatically update the relevant website pages and visualizations upon approval. 5. Generate a weekly content audit report identifying pages not updated in the last [X] months.`

### Testing Script Prompts (Conceptual)

- **Template:** `Generate a test script (e.g., using Selenium or Puppeteer) to simulate the following user journey on the ThinkStack website: 1. Navigate to the 'Generative AI' category page. 2. Filter tools based on 'Free Tier Available'. 3. Click on the comparison chart. 4. Interact with a tooltip on the chart. 5. Navigate to the details page for the top-ranked tool. Verify that all elements load correctly, data is accurate, and interactive components respond as expected.`

## Step 6: Monetization & Advertising Integration

### Ad Strategy Prompts

- **Template:** `Based on typical user behavior patterns for informational and comparison websites (e.g., time on page, bounce rate, page flow), analyze the proposed website layout ([link to wireframe/mockup]). Recommend optimal ad placements (e.g., header banner, sidebar, in-content, footer) and ad types (display ads, native ads, affiliate links) for the [page type - e.g., Category Page, Tool Detail Page] that maximize potential revenue while minimizing disruption to the user experience. Justify your recommendations with data or best practices.`

### Ad Testing Prompts

- **Template:** `Design an A/B test scenario to compare the performance (Click-Through Rate, Revenue Per Mille) of two different ad placements on the [page type] page: Placement A ([description]) vs. Placement B ([description]). Outline the setup, duration, target audience segment, and key metrics to track.`

## Step 7: Final Testing, Launch, & Continuous Improvement

### Pre-Launch Checklist Prompts

- **Template:** `Generate a comprehensive pre-launch testing checklist for the ThinkStack website. The checklist should cover: Data Accuracy (cross-referencing sample data points), Visualization Functionality (interactivity, responsiveness, data binding), Website Performance (load speed using tools like PageSpeed Insights), Responsiveness (across major devices/browsers), Ad Integration (ads loading correctly, links working), Security (basic checks for common vulnerabilities), and Compliance (Privacy Policy, Cookie Consent).`

### Marketing Prompts

- **Template:** `Draft a series of 3 social media posts (for LinkedIn, Twitter/X) announcing the launch of the ThinkStack website. Highlight its key features: comprehensive data, interactive visualizations, focus on specific AI categories ([Category 1], [Category 2]), and unique value proposition (e.g., "up-to-date, unbiased comparisons"). Include relevant hashtags.`

### Monitoring & Improvement Prompts

- **Template:** `Analyze the website analytics data for the past week ([data summary/link]). Identify key trends in user behavior (e.g., popular categories, high-bounce pages, user flow bottlenecks). Based on this data and recent user feedback ([feedback summary]), recommend 2-3 specific, actionable improvements to enhance user engagement, data clarity, or site performance.`
