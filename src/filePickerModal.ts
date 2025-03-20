// src/filePickerModal.ts
import type { App, TFile } from "obsidian";
import { FuzzySuggestModal } from "obsidian";

export class FilePickerModal extends FuzzySuggestModal<TFile> {
	onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder("Select a file to compare with");
	}

	getItems(): TFile[] {
		return this.app.vault.getFiles();
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}
