/** One local recovery draft. PDF data never leaves this browser. */
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pdf-editor-recovery", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readEditorDraft(key = "latest"): Promise<Blob | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("drafts").objectStore("drafts").get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function writeEditorDraft(blob: Blob | null, key = "latest") {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("drafts", "readwrite");
      const store = transaction.objectStore("drafts");
      if (blob) store.put(blob, key); else store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
