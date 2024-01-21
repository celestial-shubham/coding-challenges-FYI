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
// ccwc
export async function ccwc(
  argv: string[],
  stream?: NodeJS.ReadStream | fs.ReadStream
): Promise<string> {
  if (argv.length === 2) {
    const option = argv[0];
    const filename = argv[1];
    if (fs.existsSync(filename)) {
      const fileContents: string = fs.readFileSync(filename, 'utf8').toString();
      switch (option) {
        case '-c':
          return byteCount(filename).toString() + ' ' + filename;
        case '-l':
          return lineCount(fileContents).toString() + ' ' + filename;
        case '-w':
          return wordCount(fileContents).toString() + ' ' + filename;
        case '-m':
          return charCount(fileContents) + ' ' + filename;
        default:
          throw new Error('Invalid option');
      }
    }
    if (_LH.isUndefined(stream)) {
      throw new Error('Invalid file');
    }
  }

  if (argv.length === 1) {
    const filename = argv[0];
    if (fs.existsSync(filename)) {
      const fileContents = fs.readFileSync(filename, 'utf8');
      const line = lineCount(fileContents).toString();
      const word = wordCount(fileContents).toString();
      const bytes = byteCount(filename).toString();
      return line + ' ' + word + ' ' + bytes + ' ' + filename;
    }
    if (_LH.isUndefined(stream)) {
      throw new Error('Invalid file');
    }
  }

  // Checking for stream
  if (!_LH.isUndefined(stream)) {
    try {
      // If option is given
      const buffer: Buffer = await readStream(stream);
      const fileContents: string = buffer.toString();
      if (argv.length === 1) {
        const option = argv[0];
        switch (option) {
          case '-c':
            return buffer.length.toString();
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
      // If no option is given
      if (argv.length == 0) {
        const line = lineCount(fileContents).toString();
        const word = wordCount(fileContents).toString();
        const bytes = buffer.length.toString();
        return line + ' ' + word + ' ' + bytes;
      }
    } catch (err) {
      if (!(err instanceof TypeError)) {
        throw err;
      }
    }
  }
  throw new Error('Invalid input or file');
}
