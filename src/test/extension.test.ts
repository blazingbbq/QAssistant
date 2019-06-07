//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../extension';

suite('Extension Tests', function() {
  test('extension registers commands', function() {
    var extensionContext: any = {
      subscriptions: [],
    };
    extension.activate(extensionContext);

    assert.notEqual(extensionContext.subscriptions.length, 0);
  });
});
