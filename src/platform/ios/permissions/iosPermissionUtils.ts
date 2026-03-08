export const hasInfoPlistKey = (content: string, key: string) =>
  new RegExp(`<key>${key}</key>`).test(content);
