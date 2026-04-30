export function parseFeedbackImageUrls(imagesJson?: string): string[] {
  if (!imagesJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(imagesJson);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((imageUrl): imageUrl is string => (
      typeof imageUrl === 'string' && imageUrl.trim().length > 0
    ));
  } catch {
    return [];
  }
}
