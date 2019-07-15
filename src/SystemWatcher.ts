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

  var linesChanged = {
    from: -1,
    to: -1,
  };

  const updateLinesChanged = (line: number) => {
    if (linesChanged.from < 0 || line < linesChanged.from) {
      linesChanged.from = line;
    }
    if (linesChanged.to < 0 || line > linesChanged.to) {
      linesChanged.to = line;
    }
  };

  // TODO: Better change tracking. Doesn't properly track deleted lines
  vscode.workspace.onDidChangeTextDocument(
    ({ contentChanges }: vscode.TextDocumentChangeEvent) => {
      contentChanges.forEach(change => {
        if (!change.text) {
          return;
        }

        if (change.range.isSingleLine) {
          updateLinesChanged(change.range.start.line);
        } else {
          updateLinesChanged(change.range.start.line);
          updateLinesChanged(change.range.end.line);
        }
      });
    },
  );

  vscode.workspace.onDidSaveTextDocument(event => {
    if (linesChanged.from < 0 || linesChanged.to < 0) {
      return;
    }

    const edits = event.getText(
      new vscode.Range(linesChanged.from, 0, linesChanged.to, Number.MAX_VALUE),
    );
    const regexp = new RegExp(
      'def $?'.replace('$?', '(?<FUNCTION_NAME>.+)'),
      'gmi',
    );
    const testFile = FileLocatorService.getTestFile(event.uri).path;
    // testFileUri.

    var m: any;
    while ((m = regexp.exec(edits))) {
      const newFunctionTemplate = TemplateService.newFunction(m[1]);

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
          testFileChunks[2] === null ||
          testFileChunks[3] === null ||
          testFileChunks[4] === null
        ) {
          return;
        }

        fs.writeFile(
          testFile,
          `${testFileChunks[1]}
${testFileChunks[2]}
${testFileChunks[3]}

${newFunctionTemplate}
${testFileChunks[4]}
`,
          () => {},
        );
      });
    }

    linesChanged.from = -1;
    linesChanged.to = -1;
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
