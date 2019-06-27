import { FileLocatorService } from './FileLocatorService';
import { ConfigService } from './ConfigService';

export module TemplateService {
  export function newFile(relativeFilePath: string) {
    return scaffoldHeaders(relativeFilePath);
  }

  function scaffoldHeaders(relativeFilePath: string) {
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

    return `${header}
${suiteOpening}

${suiteClosing}
`;
  }
}
