import * as vscode from 'vscode';
import { ConfigService } from '../services';

export module FileLocatorService {
  export function getWatchDirectory() {
    const root = rootDirectory();

    return new vscode.RelativePattern(
      root,
      ConfigService.FileToTestPattern.value,
    );
  }

  export function getTestFile(uri: vscode.Uri) {
    const { path } = uri;
    const root = rootDirectory().uri.path;

    var testFilePath =
      root +
      replaceOrInsertAt<string>(
        path
          .replace(root, '')
          .replace(
            extensionPattern(),
            ConfigService.TestFileExtensionReplacement.value,
          )
          .split('/'),
        ConfigService.TestFileLocation.value ===
          ConfigService.TestFileLocation.EXPLORER_VALUES.PARALLEL
          ? 1
          : -1,
        'test',
      ).join('/');

    return vscode.Uri.file(testFilePath);
  }

  export function rootDirectory() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders === undefined) {
      throw new Error('No workspace root defined.');
    }
    return workspaceFolders[0];
  }

  export function extensionPattern() {
    return /\.([^\.]+)$/;
  }
}

function replaceOrInsertAt<T>(arr: T[], index: number, value: T) {
  var temp = arr;

  if (index >= 0) {
    temp[index] = value;
  } else {
    temp.splice(index, 0, value);
  }

  return temp;
}
