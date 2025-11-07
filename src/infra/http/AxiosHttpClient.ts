/**
 * Axios HTTP Client Implementation
 * Implementasi HttpClient menggunakan axios dengan retry logic
 */

import axios, { AxiosError } from 'axios';
import {
  HttpClient,
  HttpClientResponse,
  HttpClientConfig,
} from '../../core/http/HttpClient';

/**
 * Implementasi HttpClient menggunakan axios
 * Dengan retry mechanism untuk network errors dan 5xx responses
 */
export class AxiosHttpClient implements HttpClient {
  /**
   * Melakukan HTTP POST request dengan retry logic
   * 
   * Retry Strategy:
   * - Attempt 1: Immediate
   * - Attempt 2: Wait 2s (2^1 * 1000ms)
   * - Attempt 3: Wait 4s (2^2 * 1000ms)
   * 
   * Retry Conditions:
   * - Network errors (ECONNREFUSED, ETIMEDOUT, dll)
   * - HTTP status 500-599
   * 
   * No Retry:
   * - HTTP status 400-499 (client errors)
   */
  async post<T = any>(
    url: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Jika bukan attempt pertama, tunggu dengan exponential backoff
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
          await this.sleep(delay);
        }

        // Lakukan HTTP request
        const response = await axios.post(url, data, {
          timeout: config?.timeout,
          headers: config?.headers,
        });

        // Return response jika sukses
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        lastError = error as Error;

        // Cek apakah error bisa di-retry
        if (!this.shouldRetry(error as AxiosError, attempt, maxRetries)) {
          // Jika tidak bisa retry, throw error
          throw this.wrapError(error as AxiosError);
        }

        // Jika masih ada retry attempts, lanjutkan loop
        // Log retry attempt (optional, bisa diaktifkan untuk debugging)
        // console.log(`Retry attempt ${attempt + 1}/${maxRetries} for ${url}`);
      }
    }

    // Jika semua retry gagal, throw last error
    throw this.wrapError(lastError as AxiosError);
  }

  /**
   * Cek apakah error bisa di-retry
   * @param error - Axios error
   * @param attempt - Current attempt number
   * @param maxRetries - Maximum retry attempts
   * @returns true jika bisa retry, false jika tidak
   */
  private shouldRetry(
    error: AxiosError,
    attempt: number,
    maxRetries: number
  ): boolean {
    // Jika sudah mencapai max retries, tidak retry lagi
    if (attempt >= maxRetries) {
      return false;
    }

    // Network errors (no response) - retry
    if (!error.response) {
      return true;
    }

    // 5xx errors - retry
    if (error.response.status >= 500 && error.response.status < 600) {
      return true;
    }

    // 4xx errors - tidak retry
    return false;
  }

  /**
   * Wrap axios error ke format standar
   * @param error - Axios error
   * @returns Error dengan message yang jelas
   */
  private wrapError(error: AxiosError): Error {
    if (error.response) {
      // Server merespons dengan status error
      const wrappedError = new Error(
        `HTTP ${error.response.status}: ${error.response.statusText}`
      );
      (wrappedError as any).status = error.response.status;
      (wrappedError as any).statusText = error.response.statusText;
      (wrappedError as any).data = error.response.data;
      return wrappedError;
    } else if (error.request) {
      // Request dibuat tapi tidak ada response (network error)
      const wrappedError = new Error(
        `Network error: ${error.message}`
      );
      (wrappedError as any).code = error.code;
      return wrappedError;
    } else {
      // Error lain saat setup request
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Helper function untuk delay
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
