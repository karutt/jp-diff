// src/fileSelector.ts
import { App, MarkdownView, Notice, TFile } from "obsidian";

/**
 * FileSelector は、ファイル選択モードにおける各Leafのホバーおよびクリックイベントの登録を担当します。
 * ユーザーがLeafをクリックした際、選択されたファイルを onFileSelected コールバックを通して通知します。
 */
export class FileSelector {
	private cleanupFunc: (() => void) | null = null;

	constructor(
		private app: App,
		private onFileSelected: (file: TFile) => void
	) {}

	/**
	 * ファイル選択モードを開始します。対象のMarkdown Leafに対してイベントを登録します。
	 */
	startSelectionMode(): void {
		new Notice(
			"ファイル選択モードになりました。比較対象のファイルがあるLeafをクリックしてください。"
		);

		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const listeners: {
			leaf: any;
			mouseEnter: (ev: MouseEvent) => void;
			mouseLeave: (ev: MouseEvent) => void;
			click: (ev: MouseEvent) => void;
		}[] = [];

		for (const leaf of leaves) {
			const container = (leaf.view as MarkdownView).containerEl;
			const mouseEnter = (_ev: MouseEvent) => {
				container.classList.add("file-selection-hover");
			};
			const mouseLeave = (_ev: MouseEvent) => {
				container.classList.remove("file-selection-hover");
			};
			const clickHandler = (ev: MouseEvent) => {
				ev.preventDefault();
				ev.stopPropagation();
				const view = leaf.view as MarkdownView;
				if (view && view.file) {
					this.onFileSelected(view.file);
					this.cleanup();
				} else {
					new Notice(
						"選択したLeafにファイルが見つかりませんでした。"
					);
				}
			};

			container.addEventListener("mouseenter", mouseEnter);
			container.addEventListener("mouseleave", mouseLeave);
			container.addEventListener("click", clickHandler);

			listeners.push({
				leaf,
				mouseEnter,
				mouseLeave,
				click: clickHandler,
			});
		}

		// 後で登録されたすべてのイベントリスナーを解除するためのクリーンアップ関数を作成
		this.cleanupFunc = () => {
			for (const { leaf, mouseEnter, mouseLeave, click } of listeners) {
				(leaf.view as MarkdownView).containerEl.removeEventListener(
					"mouseenter",
					mouseEnter
				);
				(leaf.view as MarkdownView).containerEl.removeEventListener(
					"mouseleave",
					mouseLeave
				);
				(leaf.view as MarkdownView).containerEl.removeEventListener(
					"click",
					click
				);
				(leaf.view as MarkdownView).containerEl.classList.remove(
					"file-selection-hover"
				);
			}
		};
	}

	/**
	 * 登録されたすべてのイベントリスナーを解除します。
	 */
	cleanup(): void {
		if (this.cleanupFunc) {
			this.cleanupFunc();
			this.cleanupFunc = null;
		}
	}
}
