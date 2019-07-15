import * as vscode from 'vscode';

export module ConfigService {
  var config = vscode.workspace.getConfiguration('qassistant');
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('qassistant')) {
      config = vscode.workspace.getConfiguration('qassistant');
    }
  });

  abstract class ConfigSetting {
    protected static CONFIG_NAME: string;

    static get value() {
      const setting = config.get(this.CONFIG_NAME);
      if (setting === undefined) {
        throw new Error('Could not find "' + this.CONFIG_NAME + '" config.');
      }

      return <string>setting;
    }

    static onChange(callback: () => void) {
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('qassistant.' + this.CONFIG_NAME)) {
          callback();
        }
      });
    }
  }

  abstract class ExplorerConfigSetting extends ConfigSetting {
    protected static EXPLORER_VALUES: object;
  }

  export class FileToTestPattern extends ConfigSetting {
    static CONFIG_NAME = 'fileToTestPattern';
  }

  export class TestFileExtensionReplacement extends ConfigSetting {
    static CONFIG_NAME = 'testFileExtensionReplacement';
  }

  export class OpenTestFileOnCreation extends ConfigSetting {
    static CONFIG_NAME = 'openTestFileOnCreation';
  }

  export class TestFileLocation extends ExplorerConfigSetting {
    static CONFIG_NAME = 'testFileLocation';

    static EXPLORER_VALUES = {
      PARALLEL: 'parallel',
      ADJACENT: 'adjacent',
    };
  }

  export class TestFileHeader extends ConfigSetting {
    static CONFIG_NAME = 'testFileHeader';
  }

  export class TestFileSuiteOpening extends ConfigSetting {
    static CONFIG_NAME = 'testFileSuiteOpening';
  }

  export class TestFileSuiteClosing extends ConfigSetting {
    static CONFIG_NAME = 'testFileSuiteClosing';
  }

  export class NewFunctionMatcher extends ConfigSetting {
    static CONFIG_NAME = 'newFunctionMatcher';
  }
}
