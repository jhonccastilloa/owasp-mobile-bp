export const cleanComentaries = (data: string) => {
  let match: RegExpExecArray | null;
  const regex = /<!--([\s\S]*?)-->/g;

  while ((match = regex.exec(data)) !== null) {
    data = data.replace(match[0], match[0].split('\n').map((_, i) => i).join('\n'))
  }

  return data
}

export const linesUpToMatch = (data: string, matchPosition: number) => data.substring(0, matchPosition).split('\n').length