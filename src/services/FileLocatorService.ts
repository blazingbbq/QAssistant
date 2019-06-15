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
    const testFilePath = root + '/test' + path.replace(root, '');

    return vscode.Uri.file(testFilePath);
  }

  export function rootDirectory() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders === undefined) {
      throw new Error('No workspace root defined.');
    }
    return workspaceFolders[0];
  }
}
