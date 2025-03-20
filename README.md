# Jp Diff

**Jp Diff** is an Obsidian plugin that compares two Markdown files and highlights their differences using CodeMirror 6’s Decoration API. The plugin calculates the textual differences (using diffWords) and applies inline highlights based on your theme’s accent color. It also lets you update the diff after making edits.

## Features

-   **File Comparison:**  
    Compare the currently active file with another file selected from your vault.  
    The plugin opens the comparison file in a split view and highlights the differences:

    -   **Deletions:** Highlighted in the active file.
    -   **Additions:** Highlighted in the comparison file.

-   **Diff Update:**  
    After making edits in either file, use the "Update Diff" command to refresh the highlights based on the latest file content.

## File Structure

The plugin code is organized into several modules following SOLID principles:

-   **src/diffDecorations.ts**  
    Defines the CodeMirror 6 state effects and state field used to manage decorations (highlights) in the editor.

-   **src/diffHighlighter.ts**  
    Contains the diff calculation (using `diffWords`) and applies the corresponding decorations to both editors.  
    The highlight style is unified as:  
    `background-color: color-mix(in srgb, var(--color-blue) 60%, transparent); border-radius: 4px;`  
    (This uses your theme’s accent color variable `--color-blue`.)

-   **src/filePickerModal.ts**  
    Implements a file selection modal based on Obsidian’s FuzzySuggestModal. It allows you to choose a file from your vault to compare.

-   **src/main.ts**  
    The plugin’s entry point. It registers the following commands:
    -   **Compare with file:**  
        Opens the comparison file in a vertical split and applies diff highlighting.
    -   **Update Diff:**  
        Recalculates and updates the diff highlights using the current content of the two files.

## Installation

1. **Clone or Download the Repository:**

    ```bash
    git clone https://github.com/yourusername/jp-diff.git
    cd jp-diff
    ```
