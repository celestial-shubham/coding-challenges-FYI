import * as fs from 'fs';
import * as _LH from 'lodash';
/**
 * Reads data from a NodeJS.ReadStream or fs.ReadStream and returns the concatenated buffer.
 *
 * @param {NodeJS.ReadStream | fs.ReadStream} stream - the stream to read data from
 * @return {Promise<Buffer>} a promise that resolves with the concatenated buffer
 */
async function readStream(
  stream: NodeJS.ReadStream | fs.ReadStream
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let data: Buffer = Buffer.alloc(0);
    stream.on('data', (chunk: Buffer) => {
      data = Buffer.concat([data, chunk]);
    });
    stream.on('end', () => {
      return resolve(data);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Returns the number of characters in the given file contents.
 *
 * @param {string} fileContents - the contents of the file
 * @return {number} the number of characters in the file contents
 */
function charCount(fileContents: string): number {
  return fileContents.length;
}

/**
 * Calculates the size of the given file in bytes.
 *
 * @param {string} filename - the name of the file
 * @return {number} the size of the file in bytes
 */
function byteCount(filename: string): number {
  return fs.statSync(filename).size;
}

/**
 * Counts the number of lines in the given file contents.
 *
 * @param {string} fileContents - the contents of the file
 * @return {number} the number of lines in the file
 */
function lineCount(fileContents: string): number {
  return fileContents.split(/\r\n|\r|\n/).length - 1;
}

/**
 * Calculates the number of words in the given file contents.
 *
 * @param {string} fileContents - the contents of the file
 * @return {number} the count of words in the file contents
 */
function wordCount(fileContents: string): number {
  if (fileContents.length <= 0) {
    return 0;
  }
  return fileContents.trim().split(/\s+/).length;
}

/**
 * Executes a command-line style word count operation on a given file or stream.
 *
 * @param {string[]} argv - The array of command-line arguments where the first
 * element can be an option ('-c', '-l', '-w', '-m'), and the second element is
 * the filename. If only one argument is provided, it is the filename.
 * @param {NodeJS.ReadStream | fs.ReadStream} [stream] - An optional stream to read
 * from if a filename is not provided.
 * @return {Promise<string>} A promise that resolves to a string containing the
 * count(s) and the filename or an error message.
 */
export async function ccwc(
  argv: string[],
  stream?: NodeJS.ReadStream | fs.ReadStream
): Promise<string> {
  const filename = argv[argv.length - 1];
  let fileContents: string;
  if (!_LH.isUndefined(stream)) {
    const buffer: Buffer = await readStream(stream);
    fileContents = buffer.toString();
  } else {
    fileContents = fs.readFileSync(filename).toString();
  }

  if (stream && argv.length === 1) {
    return getStreamCounts(argv[0], fileContents, stream);
  }
  if (fs.existsSync(filename)) {
    return getFileCounts(argv[0], fileContents, filename);
  }
  throw new Error('Invalid input or file');
}

async function getStreamCounts(
  option: string,
  fileContents: string,
  stream: NodeJS.ReadStream | fs.ReadStream
): Promise<string> {
  switch (option) {
    case '-c':
      return (
        stream instanceof fs.ReadStream
          ? (await fs.promises.stat(stream.path)).size
          : 0
      ).toString();
    case '-l':
      return lineCount(fileContents).toString();
    case '-w':
      return wordCount(fileContents).toString();
    case '-m':
      return charCount(fileContents).toString();
    default:
      throw new Error('Invalid option');
  }
}

function getFileCounts(
  option: string,
  fileContents: string,
  filename: string
): string {
  switch (option) {
    case '-c':
      return byteCount(filename).toString() + ' ' + filename;
    case '-l':
      return lineCount(fileContents).toString() + ' ' + filename;
    case '-w':
      return wordCount(fileContents).toString() + ' ' + filename;
    case '-m':
      return charCount(fileContents).toString() + ' ' + filename;
    default:
      throw new Error('Invalid option');
  }
}
