import open from 'open';

export const openUrl = async (url: string): Promise<void> => {
  try {
    await open(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to open URL: ${url}. Error: ${message}`);
  }
};
