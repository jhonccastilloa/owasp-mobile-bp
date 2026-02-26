import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArguments } from '../cli/parser';

describe('CLI Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse verify command', () => {
    const result = parseArguments(['node', 'test', 'verify']);
    expect(result.command).toBe('verify');
  });

  it('should parse automate command', () => {
    const result = parseArguments(['node', 'test', 'automate']);
    expect(result.command).toBe('automate');
  });

  it('should parse documentation command', () => {
    const result = parseArguments(['node', 'test', 'documentation']);
    expect(result.command).toBe('documentation');
  });

  it('should use default path when not specified', () => {
    const result = parseArguments(['node', 'test', 'verify']);
    expect(result.path).toBeDefined();
  });

  it('should parse custom path', () => {
    const result = parseArguments(['node', 'test', 'verify', '--path', '/custom/path']);
    expect(result.path).toBe('/custom/path');
  });

  it('should parse -p short option', () => {
    const result = parseArguments(['node', 'test', 'verify', '-p', '/short/path']);
    expect(result.path).toBe('/short/path');
  });
});
