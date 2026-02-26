import open from 'open';

export const openUrl = async (url: string): Promise<void> => {
  try {
    await open(url);
  } catch (error) {
    throw new Error(`Failed to open URL: ${url}. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
