/**
 * Utilitários de performance para otimização de funções
 */

/**
 * Debounce: Atrasa a execução de uma função até que um tempo específico tenha passado
 * sem que ela seja chamada novamente. Útil para inputs de busca, validações, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle: Garante que uma função seja executada no máximo uma vez em um intervalo de tempo.
 * Útil para scroll events, resize events, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoização simples para funções puras
 * Armazena resultados de chamadas anteriores
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy loading de componentes com retry
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    componentImport()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          lazyWithRetry(componentImport, retries - 1, interval)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
}

/**
 * Batch de operações assíncronas
 * Executa operações em lotes para evitar sobrecarga
 */
export async function batchAsync<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayBetweenBatches: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
    
    // Delay entre lotes (exceto no último)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

/**
 * Cache simples com expiração
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    // Limpar itens expirados antes de contar
    this.cache.forEach((_, key) => this.get(key));
    return this.cache.size;
  }
}

/**
 * Request deduplication
 * Evita múltiplas requisições idênticas simultâneas
 */
export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async deduplicate<T>(
    key: string,
    request: () => Promise<T>
  ): Promise<T> {
    // Se já existe uma requisição pendente, retorna ela
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Cria nova requisição
    const promise = request()
      .finally(() => {
        // Remove da lista de pendentes quando completar
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pending.clear();
  }
}

/**
 * Intersection Observer helper para lazy loading
 */
export function createIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, options);
}

/**
 * Prefetch de recursos
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preload de recursos críticos
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'image' = 'script'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

// Made with Bob
