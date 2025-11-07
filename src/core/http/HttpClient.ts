/**
 * Core HTTP Client Interface
 * Interface untuk HTTP operations mengikuti ISP dan DIP
 */

/**
 * Response dari HTTP request
 * Generic type T untuk type safety pada response data
 */
export interface HttpClientResponse<T = any> {
  /** Data response dari server */
  data: T;
  /** HTTP status code (200, 404, 500, dll) */
  status: number;
  /** HTTP status text (OK, Not Found, Internal Server Error, dll) */
  statusText: string;
}

/**
 * Konfigurasi untuk HTTP request
 */
export interface HttpClientConfig {
  /** Timeout dalam milliseconds */
  timeout?: number;
  /** Custom headers untuk request */
  headers?: Record<string, string>;
}

/**
 * Interface untuk HTTP Client
 * Hanya expose method yang dibutuhkan (Interface Segregation Principle)
 * Memungkinkan berbagai implementasi tanpa mengubah consumer (Dependency Inversion Principle)
 */
export interface HttpClient {
  /**
   * Melakukan HTTP POST request
   * @param url - URL tujuan
   * @param data - Data yang akan dikirim dalam request body
   * @param config - Konfigurasi opsional (timeout, headers)
   * @returns Promise dengan response data
   */
  post<T = any>(
    url: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
}
