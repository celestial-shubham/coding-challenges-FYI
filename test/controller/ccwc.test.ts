import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import { ccwc } from '../../src/1/ccwc';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ccwc', function () {
  let readFileSyncStub: sinon.SinonStub;
  let existsSyncStub: sinon.SinonStub;
  // let readStreamStub: sinon.SinonStub;

  beforeEach(function () {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    existsSyncStub = sinon.stub(fs, 'existsSync');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should return correct line count for given file', async function () {
    // Set up stub behavior
    existsSyncStub.returns(true);
    readFileSyncStub.returns('Line 1\nLine 2\nLine 3');

    // Call the function with mocked arguments
    const result = await ccwc(['-l', 'test.txt']);

    // Check if the result is as expected
    expect(result).to.equal('3 test.txt');
  });

  it('should throw an error for a non-existing file', async function () {
    existsSyncStub.returns(false);

    // We expect a promise rejection, so we use async/await with try/catch
    try {
      await ccwc(['-l', 'non-existent.txt']);
      // If the function does not throw, we make the test fail
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).to.contains('Invalid file');
    }
  });
});
