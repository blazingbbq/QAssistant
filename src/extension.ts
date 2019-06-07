import * as vscode from 'vscode';
import * as commands from './commands';

export function activate(context: vscode.ExtensionContext) {
  commands.registerAll(context);
}

export function deactivate() {}
