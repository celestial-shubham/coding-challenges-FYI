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
  let statSyncStub: sinon.SinonStub;
  let readStreamStub: sinon.SinonStub;

  beforeEach(function () {
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    existsSyncStub = sinon.stub(fs, 'existsSync');
    statSyncStub = sinon.stub(fs, 'statSync');
    readStreamStub = sinon.stub(fs, 'ReadStream');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should return correct line count for given file', async function () {
    existsSyncStub.returns(true);
    readFileSyncStub.returns('Line 1\nLine 2\nLine 3');

    const result = await ccwc(['-l', 'test.txt']);

    expect(result).to.equal('2 test.txt');
  });

  it('should throw an error for a non-existing file', async function () {
    existsSyncStub.returns(false);
    try {
      await ccwc(['-l', 'non-existent.txt']);
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).to.contain('Invalid file');
    }
  });

  it('should return correct byte count for given file', async function () {
    existsSyncStub.returns(true);
    readFileSyncStub.returns('File contents');
    statSyncStub.withArgs('test1.txt').returns({ size: 13 });

    const result = await ccwc(['-c', 'test1.txt']);

    expect(result).to.equal('13 test1.txt');
  });

  it('should return correct word count for given file', async function () {
    existsSyncStub.returns(true);
    readFileSyncStub.returns('This is a test');

    const result = await ccwc(['-w', 'test1.txt']);

    expect(result).to.equal('4 test1.txt');
  });

  it('should return correct character count for given file', async function () {
    existsSyncStub.returns(true);
    readFileSyncStub.returns('File contents');

    const result = await ccwc(['-m', 'test1.txt']);

    expect(result).to.equal('13 test1.txt');
  });

  it('should throw an error for an invalid option', async function () {
    existsSyncStub.returns(true);
    readFileSyncStub.returns('File contents');

    try {
      await ccwc(['-x', 'test1.txt']);
      // If the function does not throw, we make the test fail
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).to.contain('Invalid option');
    }
  });

  it('should return correct line count for stdin', async function () {
    const mockStream = require('stream').Readable();
    mockStream.push('Line 1\nLine 2\nLine 3');
    mockStream.push(null);

    readStreamStub.resolves(Buffer.from(''));

    const result = await ccwc(['-l'], mockStream);

    expect(result).to.equal('2');
  });

  it('should return correct word count for stdin', async function () {
    const mockStream = require('stream').Readable();
    mockStream.push('This is a test');
    mockStream.push(null);

    readStreamStub.resolves(Buffer.from(''));

    const result = await ccwc(['-w'], mockStream);

    expect(result).to.equal('4');
  });
});
