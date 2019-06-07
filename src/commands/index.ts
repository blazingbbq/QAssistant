import * as vscode from 'vscode';
import * as scaffoldTestsCommand from './scaffoldTestsCommand';

export function registerAll(context: vscode.ExtensionContext) {
  scaffoldTestsCommand.register(context);
}
