import { FileLocatorService } from './FileLocatorService';
import { ConfigService } from './ConfigService';

export module TemplateService {
  export function newFile(relativeFilePath: string) {
    return scaffoldNewFile(relativeFilePath);
  }

  export function newFileMatcher(relativeFilePath: string) {
    const fileName = relativeFilePath.split('/').pop();

    if (fileName === undefined) {
      return;
    }

    const suiteClosing = ConfigService.TestFileSuiteClosing.value;

    return new RegExp(
      `(?<CONTENT>.*)(?<SUITE_CLOSING>${suiteClosing}\n)`,
      'gmis',
    );
  }

  export function newFunction(functionName: string) {
    return scaffoldNewFunction(functionName);
  }

  function scaffoldNewFile(relativeFilePath: string) {
    const fileName = relativeFilePath.split('/').pop();

    if (fileName === undefined) {
      return;
    }

    const className = fileName
      .replace(FileLocatorService.extensionPattern(), '')
      .replace(/(^.|_.)/g, function(word) {
        return word.replace('_', '').toUpperCase();
      });

    const header = ConfigService.TestFileHeader.value;
    const suiteOpening = ConfigService.TestFileSuiteOpening.value.replace(
      '$?',
      className,
    );
    const suiteClosing = ConfigService.TestFileSuiteClosing.value;

    return `${header}\n${suiteOpening}\n\n${suiteClosing}\n`;
  }

  function scaffoldNewFunction(functionName: string) {
    const newFunctionTestOpening = "\ttest('::$? <TEST DESCRIPTION>') do".replace(
      '$?',
      functionName,
    );
    const newFunctionTestContent = '\t\t# auto generated test stub';
    const newFunctionTestClosing = '\tend';

    return `\n${newFunctionTestOpening}\n${newFunctionTestContent}\n${newFunctionTestClosing}\n`;
  }
}
