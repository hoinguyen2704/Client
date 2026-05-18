export const setDocumentTitle = (title: string) => {
  document.title = `${title} | Htech`;
};

export const getPaginatedRowNumber = (page: number, size: number, index: number) =>
  Math.max(page - 1, 0) * size + index + 1;
