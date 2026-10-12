// Utilitas penyimpanan dokumen lokal berbasis IndexedDB untuk mode offline/demo browser.
// Mencegah QuotaExceededError pada LocalStorage saat menyimpan berkas PDF bermeterai (2 - 10 MB).

const DB_NAME = "sepakatin_offline_db";
const STORE_NAME = "stamped_documents";
const DB_VERSION = 1;

// Fallback in-memory jika IndexedDB tidak tersedia di lingkungan tertentu
const memoryFallback = new Map<string, Blob | string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak tersedia di lingkungan ini."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Gagal membuka IndexedDB."));
  });
}

/**
 * Simpan data berkas PDF ke IndexedDB lokal peramban.
 */
export async function saveLocalDocument(key: string, data: Blob | string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ key, data, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback simpan di memori
    memoryFallback.set(key, data);
  }
}

/**
 * Ambil URL berkas PDF dari IndexedDB lokal peramban.
 * Mengembalikan Object URL (URL.createObjectURL) atau string data URL.
 */
export async function getLocalDocument(key: string): Promise<string | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        if (!req.result || !req.result.data) {
          resolve(null);
          return;
        }
        const data = req.result.data;
        if (typeof data === "string") {
          resolve(data);
        } else if (data instanceof Blob) {
          resolve(URL.createObjectURL(data));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const fallback = memoryFallback.get(key);
    if (!fallback) return null;
    if (typeof fallback === "string") return fallback;
    if (fallback instanceof Blob && typeof URL !== "undefined") return URL.createObjectURL(fallback);
    return null;
  }
}

/**
 * Hapus berkas PDF dari IndexedDB lokal peramban.
 */
export async function removeLocalDocument(key: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    memoryFallback.delete(key);
  }
}
