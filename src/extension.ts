import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('lineProcessor.process', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const pick = await vscode.window.showQuickPick([
            { label: vscode.l10n.t('label.addSingleQuotes'), description: vscode.l10n.t('desc.wrapSingle'), value: 'single' },
            { label: vscode.l10n.t('label.addDoubleQuotes'), description: vscode.l10n.t('desc.wrapDouble'), value: 'double' },
            { label: vscode.l10n.t('label.addTrailingComma'), description: vscode.l10n.t('desc.addComma'), value: 'comma' },
            { label: vscode.l10n.t('label.joinWithCommas'), description: vscode.l10n.t('desc.join'), value: 'join' },
            { label: vscode.l10n.t('label.splitByCommas'), description: vscode.l10n.t('desc.split'), value: 'split' }
        ], {
            placeHolder: vscode.l10n.t('placeholder.selectOperation')
        });

        if (!pick) return;

        const selection = editor.selection;
        const hasSelection = !selection.isEmpty;

        const document = editor.document;
        const fullText = document.getText();
        const lines = fullText.split('\n');

        let startLine: number;
        let endLine: number;

        if (hasSelection) {
            startLine = selection.start.line;
            endLine = selection.end.line;
            if (selection.end.character === 0 && endLine > startLine) {
                endLine--;
            }
        } else {
            startLine = 0;
            endLine = lines.length - 1;
        }

        const selectedLines = lines.slice(startLine, endLine + 1);

        let processedLines: string[];

        switch (pick.value) {
            case 'single':
                processedLines = selectedLines.map(line => `'${line}'`);
                break;
            case 'double':
                processedLines = selectedLines.map(line => `"${line}"`);
                break;
            case 'comma':
                processedLines = selectedLines.map((line, idx) => {
                    if (idx === selectedLines.length - 1) {
                        return line;
                    }
                    if (line.trim() === '') {
                        return line;
                    }
                    return `${line},`;
                });
                break;
            case 'join':
                const joinedText = selectedLines.join(', ');
                const range = new vscode.Range(
                    new vscode.Position(startLine, 0),
                    new vscode.Position(endLine, lines[endLine].length)
                );
                await editor.edit(editBuilder => {
                    editBuilder.replace(range, joinedText);
                });
                return;
            case 'split':
                const allText = selectedLines.join('\n');
                const splitLines = allText.split(',').map(s => s.trim());
                const splitText = splitLines.join('\n');
                const splitRange = new vscode.Range(
                    new vscode.Position(startLine, 0),
                    new vscode.Position(endLine, lines[endLine].length)
                );
                await editor.edit(editBuilder => {
                    editBuilder.replace(splitRange, splitText);
                });
                return;
            default:
                return;
        }

        const newText = processedLines.join('\n');

        await editor.edit(editBuilder => {
            const range = new vscode.Range(
                new vscode.Position(startLine, 0),
                new vscode.Position(endLine, lines[endLine].length)
            );
            editBuilder.replace(range, newText);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
