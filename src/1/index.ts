import { ccwc } from './ccwc';

/**
 * Initializes the function, processes command line arguments, and logs the result.
 *
 * @param {string[]} args - the command line arguments
 * @return {Promise<void>} a Promise that resolves when the function completes
 */
const init = async (): Promise<void> => {
  const args: string[] = process.argv.slice(2);
  const result = await ccwc(args, process.stdin);
  console.log(result);
};

init();
