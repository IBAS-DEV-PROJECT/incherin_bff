// HTTP 클라이언트 래퍼
// axios/fetch 래퍼로 timeout, 재시도, 로깅 기능 제공

import axios from 'axios';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private client: any;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config: any) => {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('[HTTP] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: any) => {
        console.log(`[HTTP] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: any) => {
        const config = error.config;

        // 재시도 로직
        if (config && !config._retry && this.config.retries! > 0) {
          config._retry = true;
          config._retryCount = (config._retryCount || 0) + 1;

          if (config._retryCount <= this.config.retries!) {
            console.log(`[HTTP] Retrying request (${config._retryCount}/${this.config.retries})`);

            await new Promise((resolve) =>
              setTimeout(resolve, this.config.retryDelay! * config._retryCount)
            );

            return this.client(config);
          }
        }

        console.error('[HTTP] Response Error:', {
          status: error.response?.status,
          message: error.message,
          url: config?.url,
        });

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

// 기본 HTTP 클라이언트 인스턴스
export const httpClient = new HttpClient();
