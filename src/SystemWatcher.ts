import * as vscode from 'vscode';
import { FileLocatorService, TemplateService, ConfigService } from './services';
import * as fs from 'fs';

enum OVERWRITE {
  APPROVE = 'Overwrite',
  REJECT = 'Keep original',
}

export function init() {
  var fileSystemWatcher = newFileSystemWatcher();

  registerListeners(fileSystemWatcher);

  ConfigService.FileToTestPattern.onChange(() => {
    fileSystemWatcher.dispose();
    fileSystemWatcher = newFileSystemWatcher();

    registerListeners(fileSystemWatcher);
  });
}

function newFileSystemWatcher() {
  return vscode.workspace.createFileSystemWatcher(
    FileLocatorService.getWatchDirectory(),
  );
}

function registerListeners(fileSystemWatcher: vscode.FileSystemWatcher) {
  fileSystemWatcher.onDidCreate(event => {
    const filePath = FileLocatorService.getTestFile(event).path;

    console.log(filePath);

    if (fs.existsSync(filePath)) {
      vscode.window
        .showWarningMessage(
          'Test file for "' +
            filePath +
            '" already exists. Do you wish to overwrite it?',
          OVERWRITE.APPROVE,
          OVERWRITE.REJECT,
        )
        .then(value => {
          switch (value) {
            case OVERWRITE.APPROVE:
              createTestFile(filePath);
              break;
          }
        });
      return;
    }

    createTestFile(filePath);
  });

  fileSystemWatcher.onDidDelete(event => {
    const filePath = FileLocatorService.getTestFile(event).path;

    fs.unlinkSync(filePath);
  });
}

function createTestFile(filePath: string) {
  var content = TemplateService.newFile(filePath);
  fs.writeFileSync(filePath, content, 'utf8');

  vscode.workspace.openTextDocument(filePath).then(doc => {
    vscode.window.showTextDocument(doc);
  });
}
