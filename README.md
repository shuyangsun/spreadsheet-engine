# Spreadsheet Engine

A powerful open-source solution that transforms Excel spreadsheets into production-ready microservices. This engine allows you to:

- **Convert Excel Logic**: Transform complex spreadsheet calculations into scalable web services
- **Configurable I/O**: Define custom input parameters and output formats to match your API requirements
- **Microservice Architecture**: Deploy spreadsheet logic as independent, containerized services
- **No Code Migration**: Preserve existing Excel formulas and business logic without rewriting
- **RESTful APIs**: Automatically generate REST endpoints from your spreadsheet functions

## Workflow

There are two end‑user web applications: the Admin Portal and the Calculation Engine.

### Admin Portal

- Configure and label spreadsheet inputs and outputs by mapping named cells.
- Define data types and, when needed, discrete value sets or continuous ranges.
- Generate a JSON configuration that captures this mapping and metadata. You will paste this JSON into the Calculation Engine later.

### Calculation Engine

- Paste the JSON configuration and upload a single Excel workbook.
- The system automatically provisions a backend service that exposes REST APIs derived from your spreadsheet logic.
- Provide input values to compute outputs on demand.
- Explore sensitivity and visualization:

  - Sweep a discrete set of values or a continuous range for any input (based on its type).
  - Visualize how outputs change over the sweep with charts.
  - Select up to two inputs to generate a 2D plot (e.g., surface or heatmap) of an output to understand how two variables jointly affect the result.
