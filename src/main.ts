// src/main.ts
import { Editor, MarkdownView, Notice, Plugin, TFile } from "obsidian";

import { highlightDiff } from "./diffHighlighter";
import { FilePickerModal } from "./filePickerModal";

export default class DiffHighlighterPlugin extends Plugin {
	// Previously compared files record
	lastActiveFile: TFile | null = null;
	lastSelectedFile: TFile | null = null;

	async onload() {
		console.log("Diff Highlighter Plugin loaded");

		this.addCommand({
			id: "compare-with-file",
			name: "Compare with file",
			callback: () => this.compareFiles(),
		});

		this.addCommand({
			id: "update-diff",
			name: "Update Diff",
			callback: () => this.updateDiff(),
		});
	}

	async compareFiles() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file.");
			return;
		}
		const activeContent = await this.app.vault.read(activeFile);

		new FilePickerModal(this.app, async (selectedFile: TFile) => {
			if (!selectedFile) {
				new Notice("No comparison file was selected.");
				return;
			}
			const selectedContent = await this.app.vault.read(selectedFile);

			this.lastActiveFile = activeFile;
			this.lastSelectedFile = selectedFile;

			const compLeaf = this.app.workspace.splitActiveLeaf("vertical");
			await this.app.workspace.openLinkText(
				selectedFile.basename,
				"",
				true
			);

			setTimeout(() => {
				const origEditor = this.getEditorFromFile(activeFile);
				const compEditor = this.getEditorFromFile(selectedFile);
				if (!origEditor || !compEditor) {
					new Notice("Editor not found.");
					return;
				}
				highlightDiff(
					origEditor,
					compEditor,
					activeContent,
					selectedContent
				);
			}, 500);
		}).open();
	}

	updateDiff() {
		if (!this.lastActiveFile || !this.lastSelectedFile) {
			new Notice("No comparison has been performed yet.");
			return;
		}
		const origEditor = this.getEditorFromFile(this.lastActiveFile);
		const compEditor = this.getEditorFromFile(this.lastSelectedFile);
		if (!origEditor || !compEditor) {
			new Notice("Editor not found.");
			return;
		}
		const origContent = origEditor.getValue();
		const compContent = compEditor.getValue();
		highlightDiff(origEditor, compEditor, origContent, compContent);
		new Notice("Diff has been updated.");
	}

	getEditorFromFile(file: TFile): Editor | null {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		for (const leaf of leaves) {
			const view = leaf.view as MarkdownView;
			if (view.file && view.file.path === file.path) {
				return view.editor;
			}
		}
		return null;
	}
}
