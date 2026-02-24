export const createImagePreviewUrl = (file: File): string => {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to create object URL:', error);
    return '';
  }
};

export const revokeImagePreviewUrl = (url: string): void => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to revoke object URL:', error);
  }
};
