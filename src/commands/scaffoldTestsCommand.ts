import * as vscode from 'vscode';

const commandName = 'qassistant.scaffoldTests';

function commandHandler(name: string = 'world') {
  console.log(`Hello ${name}!!!`);
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(commandName, commandHandler),
  );
}
