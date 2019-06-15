import * as vscode from 'vscode';
import * as commands from './commands';
import * as systemWatcher from './SystemWatcher';

export function activate(context: vscode.ExtensionContext) {
  commands.registerAll(context);
  systemWatcher.init();
}

export function deactivate() {}
