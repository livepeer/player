declare module 'localstorage-memory' {
  const localStorageMemory: Storage & {
    getItem: <T>(key: string, defaultState?: T | null) => T | null
    setItem: <T>(key: string, value: T | null) => void
    removeItem: (key: string) => void
  }

  export = localStorageMemory
}

declare module 'mux-embed';
