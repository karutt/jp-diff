// src/diffDecorations.ts
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

export const setDiffDecorations = StateEffect.define<any>();

export const diffDecorationsField = StateField.define({
	create() {
		return Decoration.none;
	},
	update(deco, tr) {
		for (const e of tr.effects) {
			if (e.is(setDiffDecorations)) {
				return e.value;
			}
		}
		return deco.map(tr.changes);
	},
	provide: (f) => EditorView.decorations.from(f),
});
