import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const command = 'extension.helloWorld';

  const commandHandler = (name: string = 'world') => {
    console.log(`Hello ${name}!!!`);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(command, commandHandler),
  );
}

export function deactivate() {}
