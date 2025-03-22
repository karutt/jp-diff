// src/main.ts
import { Notice, Plugin, TFile } from "obsidian";
import { DiffExecutor } from "./diffExecutor";
import { highlightDiff } from "./diffHighlighter";
import { FilePickerModal } from "./filePickerModal";
import { FileSelector } from "./fileSelector";

export default class DiffHighlighterPlugin extends Plugin {
	private lastActiveFile: TFile | null = null;
	private lastSelectedFile: TFile | null = null;
	private diffExecutor: DiffExecutor;

	async onload() {
		console.log("Diff Highlighter Plugin loaded");
		this.diffExecutor = new DiffExecutor(this.app);

		// コマンド登録（従来のファイル比較用）
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

		// 右クリックのファイルメニューに「比較ファイルを選択」を追加
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item.setTitle("比較ファイルを選択")
						.setIcon("swap-vertical")
						.onClick(async () => {
							this.lastActiveFile = file as TFile;
							// FileSelector を利用してファイル選択モードに入る
							const selector = new FileSelector(
								this.app,
								(selectedFile: TFile) => {
									// 無効なLeafの場合は処理を中止
									if (!selectedFile || !selectedFile.path) {
										new Notice(
											"無効なLeafが選択されました。"
										);
										return;
									}
									// 選択したファイルが自分自身の場合は処理を中止
									if (
										this.lastActiveFile &&
										selectedFile.path ===
											this.lastActiveFile.path
									) {
										new Notice(
											"自分自身は選択できません。"
										);
										return;
									}
									this.lastSelectedFile = selectedFile;
									this.diffExecutor.executeDiff(
										this.lastActiveFile!,
										selectedFile
									);
								}
							);
							selector.startSelectionMode();
						});
				});
			})
		);
	}

	/**
	 * FilePickerModal を利用した従来の比較処理
	 */
	async compareFiles(): Promise<void> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file.");
			return;
		}

		new FilePickerModal(this.app, async (selectedFile: TFile) => {
			if (!selectedFile) {
				new Notice("No comparison file was selected.");
				return;
			}
			// 自分自身が選択された場合はキャンセル
			if (activeFile.path === selectedFile.path) {
				new Notice("自分自身は選択できません。");
				return;
			}
			this.lastActiveFile = activeFile;
			this.lastSelectedFile = selectedFile;
			await this.diffExecutor.executeDiff(activeFile, selectedFile);
		}).open();
	}

	/**
	 * すでに比較された2つのファイルについて、diff の更新を実行します。
	 */
	updateDiff(): void {
		if (!this.lastActiveFile || !this.lastSelectedFile) {
			new Notice("No comparison has been performed yet.");
			return;
		}
		const origEditor = this.diffExecutor.getEditorFromFile(
			this.lastActiveFile
		);
		const compEditor = this.diffExecutor.getEditorFromFile(
			this.lastSelectedFile
		);
		if (!origEditor || !compEditor) {
			new Notice("Editor not found.");
			return;
		}
		const origContent = origEditor.getValue();
		const compContent = compEditor.getValue();
		highlightDiff(origEditor, compEditor, origContent, compContent);
		new Notice("Diff has been updated.");
	}
}
