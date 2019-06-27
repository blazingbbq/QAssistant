import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { FileLocatorService, TemplateService, ConfigService } from './services';

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
    if (
      fs.lstatSync(event.path).isDirectory() ||
      event.fsPath.includes('/test/')
    ) {
      return;
    }

    const filePath = FileLocatorService.getTestFile(event).path;

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
  const relativeFilePath = filePath.replace(
    FileLocatorService.rootDirectory().uri.path,
    '',
  );
  const content = TemplateService.newFile(relativeFilePath);
  const dirName = path.dirname(filePath);

  mkdirp(dirName, err => {
    if (err) {
      throw err;
    }

    fs.promises.writeFile(filePath, content).then(() => {
      if (ConfigService.OpenTestFileOnCreation.value) {
        vscode.workspace.openTextDocument(filePath).then(doc => {
          vscode.window.showTextDocument(doc);
        });
      }
    });
  });
}
