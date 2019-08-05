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

  var existingFunctions: string[] = [];

  vscode.workspace.onWillSaveTextDocument(({ document }) => {
    fs.readFile(document.uri.fsPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      existingFunctions = findFunctions(data);
    });
  });

  vscode.workspace.onDidSaveTextDocument(event => {
    if (event.uri.fsPath.includes('/test/')) {
      return;
    }

    const fileContent = event.getText(
      new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE),
    );
    const testFile = FileLocatorService.getTestFile(event.uri).path;

    fs.readFile(testFile, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const matcher = TemplateService.newFileMatcher(
        getRelativeFilePath(testFile),
      );

      if (matcher === undefined) {
        return;
      }

      const testFileChunks = matcher.exec(data);

      if (
        testFileChunks === null ||
        testFileChunks[1] === null ||
        testFileChunks[2] === null
      ) {
        return;
      }

      const allFunctions = findFunctions(fileContent);
      const newFunctions = allFunctions.filter(
        functionName => existingFunctions.indexOf(functionName) < 0,
      );
      const deletedFunctions = existingFunctions.filter(
        functionName => allFunctions.indexOf(functionName) < 0,
      );

      if (newFunctions.length <= 0) {
        return;
      }

      var newTestFileContent = '';

      newFunctions.forEach(functionName => {
        newTestFileContent += TemplateService.newFunction(functionName);
      });

      if (testFileChunks[1].split('\n').length > 4) {
        newTestFileContent = '\n'.concat(newTestFileContent);
      }

      fs.writeFile(
        testFile,
        `${testFileChunks[1].trimRight()}${newTestFileContent.trimRight()}\n${
          testFileChunks[2]
        }`,
        () => {},
      );
    });
  });
}

function createTestFile(filePath: string) {
  const relativeFilePath = getRelativeFilePath(filePath);
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

function getRelativeFilePath(filePath: string) {
  return filePath.replace(FileLocatorService.rootDirectory().uri.path, '');
}

// TODO: Needs to match functions with parameters
function findFunctions(fileContent: string) {
  const functionNames = [];
  const regexp = new RegExp(
    ConfigService.NewFunctionMatcher.value.replace(
      '$?',
      '(?<FUNCTION_NAME>.+)',
    ),
    'gmi',
  );
  var m: any;

  while ((m = regexp.exec(fileContent))) {
    functionNames.push(m[1]);
  }

  return functionNames;
}
