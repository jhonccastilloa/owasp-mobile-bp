import { PermissionData } from '@/types/global';

export const stringifyPermissionMessage = (
  message: PermissionData['message']
): string => {
  if (typeof message === 'string') return message;
  return message
    .map(item => (typeof item === 'string' ? item : (item.text ?? '').toString()))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};
