import * as vscode from 'vscode';

export module ConfigService {
  var config = vscode.workspace.getConfiguration('qassistant');

  abstract class ConfigSetting {
    protected static CONFIG_NAME: string;

    static get value() {
      const setting = config.get(this.CONFIG_NAME);
      if (!setting) {
        throw new Error('Could not find "' + this.CONFIG_NAME + '" config.');
      }

      return <string>setting;
    }

    static onChange(callback: () => void) {
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('qassistant.' + this.CONFIG_NAME)) {
          config = vscode.workspace.getConfiguration('qassistant');
          callback();
        }
      });
    }
  }

  export class FileToTestPattern extends ConfigSetting {
    static CONFIG_NAME = 'fileToTestPattern';
  }

  export class TestFileExtensionReplacement extends ConfigSetting {
    static CONFIG_NAME = 'testFileExtensionReplacement';
  }
}
