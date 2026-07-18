"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
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
        if (!pick)
            return;
        const selection = editor.selection;
        const hasSelection = !selection.isEmpty;
        const document = editor.document;
        const fullText = document.getText();
        const lines = fullText.split('\n');
        let startLine;
        let endLine;
        if (hasSelection) {
            startLine = selection.start.line;
            endLine = selection.end.line;
            if (selection.end.character === 0 && endLine > startLine) {
                endLine--;
            }
        }
        else {
            startLine = 0;
            endLine = lines.length - 1;
        }
        const selectedLines = lines.slice(startLine, endLine + 1);
        let processedLines;
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
                const joinedText = selectedLines.join(',');
                const range = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine, lines[endLine].length));
                await editor.edit(editBuilder => {
                    editBuilder.replace(range, joinedText);
                });
                return;
            case 'split':
                const allText = selectedLines.join('\n');
                const splitLines = allText.split(',').map(s => s.trim());
                const splitText = splitLines.join('\n');
                const splitRange = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine, lines[endLine].length));
                await editor.edit(editBuilder => {
                    editBuilder.replace(splitRange, splitText);
                });
                return;
            default:
                return;
        }
        const newText = processedLines.join('\n');
        await editor.edit(editBuilder => {
            const range = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine, lines[endLine].length));
            editBuilder.replace(range, newText);
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map