# Quick Start Guide: Admin Portal Prototype v0

**Version**: v0
**Last Updated**: October 23, 2025

## Overview

The Admin Portal prototype is a single-file web application that allows administrators to configure spreadsheet inputs and outputs. It demonstrates the UX approach for mapping named Excel cells to labeled API parameters with data types and constraints.

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Minimum screen width: 1024px
- JavaScript enabled

### Installation

No installation required! Simply open the HTML file in your browser.

#### Option 1: Open Directly

1. Navigate to the project directory:

   ```bash
   cd src/prototype/admin-portal/v0
   ```

2. Open `index.html` in your browser:

   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

#### Option 2: Use Local Server (Optional)

For a more realistic development experience, use a simple HTTP server:

```bash
# Using Python 3
cd src/prototype/admin-portal/v0
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## Using the Admin Portal

### Initial State

When you first open the portal, you'll see sample data pre-loaded with a loan calculator example:

- **3 Input Mappings**: LoanAmount, InterestRate, LoanTerm
- **2 Output Mappings**: MonthlyPayment, TotalInterest

This sample data helps you understand what a configured state looks like.

### Adding an Input Mapping

1. Click the **"Add Input"** button in the Inputs section
2. Fill in the required fields:
   - **Cell Name**: The named cell reference from your Excel file (e.g., `PrincipalAmount`)
   - **Label**: A human-readable name (e.g., `Principal Amount`)
3. Select a **Data Type** from the dropdown:
   - Number
   - Text
   - Percentage
   - Currency
   - Date
4. (Optional) Click to expand the mapping and add constraints:
   - **Discrete Values**: Enter comma-separated values (e.g., `Low, Medium, High`)
   - **Range**: Enter minimum and maximum numeric values

### Adding an Output Mapping

1. Click the **"Add Output"** button in the Outputs section
2. Fill in the required fields:
   - **Cell Name**: The named cell reference (e.g., `TotalCost`)
   - **Label**: A human-readable name (e.g., `Total Cost`)

Note: Outputs do not have data types or constraints.

### Editing Mappings

- Click on any mapping to expand it and see/edit its details
- Click again to collapse
- Each mapping shows a badge indicating its type (Input/Output)
- Required fields are marked with an asterisk (\*)

### Removing Mappings

- Click the **"Remove"** button next to any mapping to delete it
- The mapping is immediately removed from the configuration

### Saving Your Work

Your configuration is automatically saved to your browser's local storage as you make changes (with a 300ms delay to batch updates). You don't need to manually save.

### Clearing the Draft

1. Click the **"Clear Draft"** button in the header
2. Confirm the action in the popup dialog
3. The configuration resets to the sample data

### Generating JSON Configuration

1. Click the **"Generate JSON"** button (large button at bottom)
2. The system validates your configuration:
   - At least one input mapping must exist
   - At least one output mapping must exist
   - All inputs must have a data type selected
   - All constraints must be valid
3. If validation passes:
   - A modal appears with the JSON output
   - You can **Copy to Clipboard** or **Download** as a file
4. If validation fails:
   - Errors are displayed at the top of the page
   - Invalid fields are highlighted in red
   - Fix the errors and try again

## Configuration Format

The exported JSON follows this structure:

```json
{
  "version": "1.0",
  "inputs": [
    {
      "cellName": "LoanAmount",
      "label": "Loan Amount",
      "type": "input",
      "dataType": "currency",
      "constraints": {
        "type": "range",
        "min": 1000,
        "max": 1000000
      }
    }
  ],
  "outputs": [
    {
      "cellName": "MonthlyPayment",
      "label": "Monthly Payment",
      "type": "output",
      "dataType": null,
      "constraints": null
    }
  ],
  "metadata": {
    "createdAt": "2025-10-23T14:30:00Z",
    "version": "v0"
  }
}
```

## Tips & Best Practices

### Naming Conventions

- **Cell Names**: Use Excel naming conventions (start with letter, no spaces, underscores OK)

  - Good: `LoanAmount`, `Interest_Rate`, `totalCost`
  - Bad: `Loan Amount`, `123Amount`, `total-cost`

- **Labels**: Use clear, descriptive labels that end users will understand
  - Good: `"Annual Interest Rate"`, `"Monthly Payment"`
  - Bad: `"AIR"`, `"MP"`

### Constraints Best Practices

- **Discrete Values**:

  - Keep the list short (3-7 options is ideal)
  - Use when there are specific, named options (e.g., `"Low, Medium, High"`)

- **Ranges**:
  - Use for numeric inputs with sensible bounds
  - Always set realistic min/max values
  - Remember: min must be ≤ max

### Data Type Selection

Choose data types based on how the Calculation Engine will process the values:

- **Number**: Plain numeric calculations (e.g., quantity, years)
- **Currency**: Monetary values (e.g., loan amount, price)
- **Percentage**: Rates and percentages (e.g., interest rate, tax rate)
- **Text**: Non-numeric data (e.g., customer name, category)
- **Date**: Date/time values (e.g., start date, maturity date)

## Troubleshooting

### Configuration Won't Generate JSON

**Problem**: You click "Generate JSON" but see error messages.

**Solutions**:

- Ensure you have at least one input AND one output
- Check that all inputs have a data type selected
- If using range constraints, verify min ≤ max
- If using discrete constraints, ensure at least one value is entered

### Lost My Configuration

**Problem**: Refreshed the page and my work is gone.

**Solutions**:

- Check if you're using the same browser (localStorage is browser-specific)
- Check if you're in Incognito/Private mode (localStorage not persisted)
- Look in Downloads folder if you previously downloaded the JSON

### Browser Says "Out of Storage"

**Problem**: Error message about localStorage quota.

**Solutions**:

- Clear browser data for this site
- Reduce the number of mappings
- Export JSON and save externally
- Use a different browser

### Layout Looks Broken

**Problem**: Interface doesn't look right or elements overlap.

**Solutions**:

- Ensure browser window is at least 1024px wide
- Try zooming to 100% (Cmd/Ctrl + 0)
- Use a supported browser (Chrome, Firefox, Safari, Edge)
- Disable browser extensions that might interfere with CSS

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit forms (when in text input)
- **Space**: Toggle expanded/collapsed state (when details element focused)
- **Escape**: Close validation error banner

## Browser Compatibility

| Browser | Version | Status             |
| ------- | ------- | ------------------ |
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |

## Known Limitations

This is a **proof-of-concept prototype** for UX validation. It has intentional limitations:

1. **No Backend**: All data is stored locally in the browser
2. **No User Authentication**: Anyone with access to the browser can edit
3. **No Multi-User Support**: No collaboration or concurrent editing
4. **No Excel Integration**: Cell names must be manually entered
5. **No Import**: Cannot import existing configurations (besides sample data)
6. **No Validation Against Actual Spreadsheet**: Cell names are not checked against real Excel files
7. **Basic Error Handling**: Production version would have more sophisticated error recovery

## Next Steps

After validating the UX with this prototype:

1. **Gather Feedback**: Show to stakeholders and collect usability feedback
2. **Iterate**: Make UX improvements based on feedback
3. **Plan Production Version**: Design backend architecture
4. **Add Features**: Import/export, validation against real Excel, multi-user support

## Support & Feedback

For questions or feedback about this prototype, contact the development team or file an issue in the project repository.

## File Location

The prototype source code is located at:

```
src/prototype/admin-portal/v0/index.html
```

This is a single HTML file containing all HTML, CSS, and JavaScript. Open it in a text editor to view or modify the code.
