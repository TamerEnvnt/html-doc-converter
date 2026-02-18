/**
 * Shared promisified exec utilities.
 */
import { promisify } from 'util';
import { execFile } from 'child_process';

export const execFileAsync = promisify(execFile);
