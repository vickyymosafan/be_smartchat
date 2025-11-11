import axios, { AxiosError } from 'axios';
import {
  HttpClient,
  HttpClientResponse,
  HttpClientConfig,
} from '../../core/http/HttpClient';

export class AxiosHttpClient implements HttpClient {
  async post<T = any>(
    url: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }

        const response = await axios.post(url, data, {
          timeout: config?.timeout,
          headers: config?.headers,
        });

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (error) {
        lastError = error as Error;

        if (!this.shouldRetry(error as AxiosError, attempt, maxRetries)) {
          throw this.wrapError(error as AxiosError);
        }
      }
    }

    throw this.wrapError(lastError as AxiosError);
  }

  private shouldRetry(
    error: AxiosError,
    attempt: number,
    maxRetries: number
  ): boolean {
    if (attempt >= maxRetries) return false;
    if (!error.response) return true;
    return error.response.status >= 500 && error.response.status < 600;
  }

  private wrapError(error: AxiosError): Error {
    if (error.response) {
      const wrappedError = new Error(
        `HTTP ${error.response.status}: ${error.response.statusText}`
      );
      (wrappedError as any).status = error.response.status;
      (wrappedError as any).statusText = error.response.statusText;
      (wrappedError as any).data = error.response.data;
      return wrappedError;
    } else if (error.request) {
      const wrappedError = new Error(`Network error: ${error.message}`);
      (wrappedError as any).code = error.code;
      return wrappedError;
    } else {
      return new Error(`Request error: ${error.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
