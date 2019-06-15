import * as vscode from 'vscode';

export module ConfigService {
  var config = vscode.workspace.getConfiguration('qassistant');

  // export function fileToTestPattern(): string {
  //   return getConfigSetting('fileToTestPattern');
  // }
  export class FileToTestPattern {
    static CONFIG_NAME = 'fileToTestPattern';

    static get value() {
      return getConfigSetting(this.CONFIG_NAME);
    }

    static onChange(callback: () => void) {
      registerConfigChangeListener(this.CONFIG_NAME, callback);
    }
  }

  function getConfigSetting(name: string) {
    const setting = config.get('fileToTestPattern');
    if (!setting) {
      throw new Error('Could not find "' + name + '" config.');
    }

    return <string>setting;
  }

  function registerConfigChangeListener(name: string, callback: () => void) {
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('qassistant.' + name)) {
        config = vscode.workspace.getConfiguration('qassistant');
        callback();
      }
    });
  }
}
