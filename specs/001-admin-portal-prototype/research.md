# Research: Admin Portal Prototype v0

**Date**: October 23, 2025
**Feature**: Admin Portal Prototype
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings for implementing the Admin Portal prototype v0. The research focuses on enterprise design patterns, single-page form layouts, and vanilla JavaScript best practices for creating an intuitive UX validation prototype.

## Research Tasks & Findings

### 1. Enterprise Design System Patterns (Material, Fluent, Carbon)

**Decision**: Use Material Design 3 visual principles adapted for vanilla HTML/CSS

**Rationale**:

- Material Design 3 has well-documented design tokens (color, spacing, typography) that can be easily replicated in vanilla CSS
- Provides clear guidance on form inputs, cards, buttons, and interactive elements
- Wide recognition among enterprise users increases intuitiveness
- CSS-only implementation available without JavaScript frameworks

**Alternatives Considered**:

- **Fluent UI**: Excellent but more Microsoft-centric; requires more custom CSS work
- **Carbon Design System**: IBM-focused, heavier weight for a simple prototype
- **Custom minimal design**: Rejected because it doesn't leverage familiar enterprise patterns

**Implementation Approach**:

- Use Material Design color palette (primary: #1976d2, surface: #ffffff, error: #d32f2f)
- Apply 8px baseline grid for spacing
- Use Roboto font family (fallback to system sans-serif)
- Implement elevation with box-shadows
- Round corners with 4px radius for cards, 20px for buttons

### 2. Single-Page Form Layout Best Practices

**Decision**: Vertical scrolling layout with sticky header and fixed action bar

**Rationale**:

- Allows all configuration options to be visible without navigation
- Sticky elements provide context and quick actions regardless of scroll position
- Natural for enterprise power users who prefer efficiency over wizard-style flows
- Reduces cognitive load by maintaining spatial consistency

**Alternatives Considered**:

- **Tab-based layout**: Would require more clicks and hide other sections
- **Accordion only**: Less scannable, requires too much expand/collapse
- **Grid layout**: Wastes horizontal space and harder to organize hierarchically

**Implementation Approach**:

- Header with title and save/clear actions (position: sticky)
- Main content area with distinct sections: Inputs, Outputs, Export
- Each section uses cards with subtle borders
- Fixed bottom action bar for "Generate JSON" primary action
- Smooth scrolling for better UX

### 3. Compact View with Expandable Details Pattern

**Decision**: Use details/summary HTML elements with custom styling

**Rationale**:

- Native HTML `<details>` provides built-in expand/collapse without JavaScript
- Accessible by default (keyboard navigation, screen readers)
- Can be styled to match Material Design with CSS
- Progressive disclosure reduces visual clutter

**Alternatives Considered**:

- **All expanded by default**: Too much information, hard to scan
- **Modal dialogs for details**: Disrupts workflow, requires more clicks
- **Custom JavaScript accordion**: Unnecessary complexity for prototype

**Implementation Approach**:

- Each cell mapping rendered as a `<details>` element
- Summary shows: cell name, label, type badge
- Expanded view shows: data type dropdown, constraints input
- CSS to style disclosure triangle and add transitions
- Visual indicators (icons, colors) for completion status

### 4. Form Validation on Submit Pattern

**Decision**: JavaScript validation triggered only when "Generate JSON" is clicked

**Rationale**:

- Simpler implementation for prototype
- Doesn't interrupt user flow with premature error messages
- Aligns with clarification decision to validate on export attempt
- Sufficient for UX validation purposes

**Alternatives Considered**:

- **Real-time validation**: Adds complexity, can be annoying
- **Field-level blur validation**: Not needed for prototype
- **No validation**: Would produce invalid JSON, poor UX

**Implementation Approach**:

- Validate on "Generate JSON" button click
- Check for: at least one input, at least one output, all required fields filled
- Display errors in a dismissible alert at top of form
- Highlight invalid fields with red borders
- Prevent JSON generation until all errors resolved

### 5. Browser LocalStorage for Draft Persistence

**Decision**: Auto-save to localStorage on any change with debouncing

**Rationale**:

- Simple key-value storage, no backend needed
- Persists across browser sessions
- Debouncing (300ms) prevents excessive writes
- Aligns with constitution's hardcoded data principle

**Alternatives Considered**:

- **SessionStorage**: Lost when browser closes, poor UX
- **IndexedDB**: Overkill for simple JSON structure
- **No persistence**: User loses work, bad experience

**Implementation Approach**:

- Store configuration as JSON string under key "adminPortalDraft"
- Debounce save function with 300ms delay
- Load on page initialization
- Clear storage when "Clear Draft" is clicked
- Handle storage quota exceeded gracefully (show warning)

### 6. JSON Schema for Configuration Export

**Decision**: Define JSON schema with nested structure for inputs/outputs

**Rationale**:

- Provides clear contract for Calculation Engine integration
- Self-documenting format
- Easy to validate and parse
- Extensible for future versions

**Schema Structure**:

```json
{
  "version": "1.0",
  "inputs": [
    {
      "sheetName": "string",
      "cellId": "string",
      "label": "string",
      "dataType": "number|text|percentage|currency|date",
      "constraints": {
        "type": "discrete|range",
        "values": ["string"], // for discrete
        "min": "number", // for range
        "max": "number" // for range
      }
    }
  ],
  "outputs": [
    {
      "sheetName": "string",
      "cellId": "string",
      "label": "string"
    }
  ],
  "metadata": {
    "createdAt": "ISO-8601 datetime",
    "version": "string"
  }
}
```

### 7. Hardcoded Sample Data for Demonstration

**Decision**: Include 2-3 sample mappings pre-populated for demo purposes

**Rationale**:

- Users can immediately see what a configured state looks like
- Reduces time to understand the interface
- Demonstrates all feature types (inputs with/without constraints, outputs)
- Can be cleared with "Clear Draft" action

**Sample Data**:

```javascript
const sampleConfiguration = {
  inputs: [
    {
      sheetName: "Loan Calculator",
      cellId: "B2",
      label: "Loan Amount",
      dataType: "currency",
      constraints: {
        type: "range",
        min: 1000,
        max: 1000000,
      },
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B3",
      label: "Annual Interest Rate",
      dataType: "percentage",
      constraints: {
        type: "range",
        min: 0,
        max: 20,
      },
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B4",
      label: "Loan Term",
      dataType: "number",
      constraints: {
        type: "discrete",
        values: ["15", "20", "30"],
      },
    },
  ],
  outputs: [
    {
      sheetName: "Loan Calculator",
      cellId: "B6",
      label: "Monthly Payment",
    },
    {
      sheetName: "Loan Calculator",
      cellId: "B7",
      label: "Total Interest Paid",
    },
  ],
};
```

## Technical Decisions Summary

| Decision Area | Choice                         | Key Benefit                                    |
| ------------- | ------------------------------ | ---------------------------------------------- |
| Design System | Material Design 3 principles   | Enterprise familiarity, well-documented        |
| Layout        | Vertical scroll, sticky header | All options visible, natural for power users   |
| Expandable UI | HTML details/summary           | Native accessibility, simple implementation    |
| Validation    | On submit only                 | Simpler, non-intrusive for prototype           |
| Storage       | LocalStorage with debounce     | Persists drafts, no backend needed             |
| Data Format   | JSON with schema               | Clear contract, extensible                     |
| Sample Data   | Pre-populated loan example     | Immediate comprehension, demonstrates features |

## Implementation Notes

1. **Single HTML File**: Entire prototype in one file with `<style>` and `<script>` tags
2. **No Build Process**: Open directly in browser, no compilation needed
3. **Progressive Enhancement**: Works without JavaScript for basic viewing
4. **Responsive**: Flexible layout adapts to window width (>1024px requirement)
5. **Performance**: Lightweight (<100KB total), instant load time

## Next Steps

Proceed to Phase 1:

- Create data-model.md defining configuration structure
- Create contracts/configuration-schema.json with formal schema
- Create quickstart.md with usage instructions
- Update agent context with vanilla JS + Material Design patterns
