// src/diffExecutor.ts
import { App, Editor, MarkdownView, Notice, TFile } from "obsidian";
import { highlightDiff } from "./diffHighlighter";

/**
 * DiffExecutor は、ファイルの内容読み込み、エディタの取得、新規Leafの生成（必要な場合）、
 * および diff ハイライトの実行を担当します。
 */
export class DiffExecutor {
	constructor(private app: App) {}

	/**
	 * 指定された2つのファイルの内容を読み込み、必要に応じて既存のエディタを利用して
	 * diffハイライトを実行します。
	 */
	async executeDiff(origFile: TFile, compFile: TFile): Promise<void> {
		const origContent = await this.app.vault.read(origFile);
		const compContent = await this.app.vault.read(compFile);

		// 既に比較対象のファイルが開かれているかチェック
		let compEditor = this.getEditorFromFile(compFile);
		if (!compEditor) {
			// 開かれていなければ、新たな分割Leafで開く
			this.app.workspace.splitActiveLeaf("vertical");
			await this.app.workspace.openLinkText(compFile.basename, "", true);
		}

		// 少し待ってからエディタを取得し、diffハイライトを実行
		setTimeout(() => {
			const origEditor = this.getEditorFromFile(origFile);
			const compEditorNow = this.getEditorFromFile(compFile);
			if (!origEditor || !compEditorNow) {
				new Notice("Editor not found.");
				return;
			}
			highlightDiff(origEditor, compEditorNow, origContent, compContent);
		}, 500);
	}

	/**
	 * 指定ファイルに対応するエディタを取得します。
	 */
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
