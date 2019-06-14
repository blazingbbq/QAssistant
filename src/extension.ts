import * as vscode from 'vscode';
import * as commands from './commands';
import * as fs from 'fs';
import { FileLocatorService, TemplateService } from './services';

export function activate(context: vscode.ExtensionContext) {
  commands.registerAll(context);

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(<
    vscode.GlobPattern
  >FileLocatorService.getWatchDirectory());

  fileSystemWatcher.onDidCreate(event => {
    const testFile = FileLocatorService.getTestFile(event);

    var filePath = testFile.path;
    var content = TemplateService.newFile(filePath);

    // TODO: Check if file exists before writing...
    fs.writeFileSync(filePath, content, 'utf8');

    vscode.workspace.openTextDocument(filePath).then(doc => {
      vscode.window.showTextDocument(doc);
    });
  });
}

export function deactivate() {}
