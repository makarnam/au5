// Basic Word export: wrap HTML in a .doc-compatible MIME and return as Blob

export function exportHtmlToWordBlob(html: string, title = "report"): Blob {
	const header = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(
		title
	)}</title></head><body>`;
	const footer = `</body></html>`;
	const content = `${header}${html}${footer}`;
	return new Blob([content], { type: "application/msword" });
}

export function downloadWord(html: string, filename = "report.doc") {
	const blob = exportHtmlToWordBlob(html, filename.replace(/\.docx?$/i, ""));
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename.endsWith(".doc") || filename.endsWith(".docx") ? filename : `${filename}.doc`;
	a.click();
	URL.revokeObjectURL(url);
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


