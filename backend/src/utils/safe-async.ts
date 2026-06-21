export async function safeAsync<T>(callback: () => Promise<T>) {
  try {
    return await callback();
  } catch (error) {
    console.error(error);
    return null;
  }
}

