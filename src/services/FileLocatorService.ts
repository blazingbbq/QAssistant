import * as vscode from 'vscode';

export module FileLocatorService {
  export function getWatchDirectory() {
    // Else watch entire workspace
    const root = rootDirectory();

    // TODO: Setup custom watch directory
    // TODO: Setup file types to watch...
    return new vscode.RelativePattern(root, '**/*.*');
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
