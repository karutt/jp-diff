// src/diffHighlighter.ts
import { RangeSetBuilder, StateEffect } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import { diffWords } from "diff";
import type { Editor } from "obsidian";
import { diffDecorationsField, setDiffDecorations } from "./diffDecorations";

/**
 * Calculate differences and apply highlighting to both editors
 * using theme accent color (--color-blue) as the base.
 */
export function highlightDiff(
	origEditor: Editor,
	compEditor: Editor,
	originalText: string,
	newText: string,
	accentVar: string = "var(--color-blue)"
): void {
	const diff = diffWords(originalText, newText);
	let origPos = 0;
	let compPos = 0;
	const origBuilder = new RangeSetBuilder<Decoration>();
	const compBuilder = new RangeSetBuilder<Decoration>();

	diff.forEach((part) => {
		const partLength = part.value.length;
		if (part.removed) {
			origBuilder.add(
				origPos,
				origPos + partLength,
				Decoration.mark({
					attributes: {
						style: `background-color: color-mix(in srgb, ${accentVar} 60%, transparent);border-radius: 4px;`,
					},
				})
			);
			origPos += partLength;
		} else if (part.added) {
			compBuilder.add(
				compPos,
				compPos + partLength,
				Decoration.mark({
					attributes: {
						style: `background-color: color-mix(in srgb, ${accentVar} 60%, transparent);border-radius: 4px;`,
					},
				})
			);
			compPos += partLength;
		} else {
			origPos += partLength;
			compPos += partLength;
		}
	});

	const origDecoSet = origBuilder.finish();
	const compDecoSet = compBuilder.finish();

	// Get the CodeMirror 6 EditorView using (editor as any).cm
	const origView = (origEditor as any).cm as EditorView;
	const compView = (compEditor as any).cm as EditorView;
	if (!origView || !compView) {
		throw new Error("Failed to get CodeMirror EditorView.");
	}

	// Add necessary extensions if they don't exist
	origView.dispatch({
		effects: StateEffect.appendConfig.of(diffDecorationsField),
	});
	compView.dispatch({
		effects: StateEffect.appendConfig.of(diffDecorationsField),
	});
	// Apply decorations
	origView.dispatch({ effects: setDiffDecorations.of(origDecoSet) });
	compView.dispatch({ effects: setDiffDecorations.of(compDecoSet) });
}
