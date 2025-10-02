// Google API 서비스
// Google OAuth 2.0 토큰 교환 및 사용자 정보 조회

import { HttpClient } from '../../../shared/http';

// Google API 관련 타입 정의
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleApiError {
  error: string;
  error_description: string;
  error_uri?: string;
}

export interface GoogleApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: GoogleApiError;
}

export class GoogleApiService {
  private httpClient: HttpClient;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;

    this.httpClient = new HttpClient({
      baseURL: 'https://oauth2.googleapis.com',
      timeout: 10000,
    });
  }

  /**
   * 인증 코드를 액세스 토큰으로 교환
   */
  async exchangeCodeForToken(code: string): Promise<GoogleApiResponse<GoogleTokenResponse>> {
    try {
      const tokenData = await this.httpClient.post<GoogleTokenResponse>(
        '/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        data: tokenData,
      };
    } catch (error: any) {
      console.error('Google token exchange error:', error);
      return {
        success: false,
        error: {
          error: 'token_exchange_failed',
          error_description: error.message || 'Failed to exchange code for token',
        },
      };
    }
  }

  /**
   * 액세스 토큰으로 사용자 정보 조회
   */
  async getUserInfo(accessToken: string): Promise<GoogleApiResponse<GoogleUserInfo>> {
    try {
      const userInfo = await this.httpClient.get<GoogleUserInfo>(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      return {
        success: true,
        data: userInfo,
      };
    } catch (error: any) {
      console.error('Google user info fetch error:', error);
      return {
        success: false,
        error: {
          error: 'user_info_fetch_failed',
          error_description: error.message || 'Failed to fetch user information',
        },
      };
    }
  }

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleApiResponse<GoogleTokenResponse>> {
    try {
      const tokenData = await this.httpClient.post<GoogleTokenResponse>(
        '/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        data: tokenData,
      };
    } catch (error: any) {
      console.error('Google token refresh error:', error);
      return {
        success: false,
        error: {
          error: 'token_refresh_failed',
          error_description: error.message || 'Failed to refresh access token',
        },
      };
    }
  }

  /**
   * 액세스 토큰 유효성 검증
   */
  async validateToken(accessToken: string): Promise<GoogleApiResponse<boolean>> {
    try {
      await this.httpClient.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );

      return {
        success: true,
        data: true,
      };
    } catch (error: any) {
      console.error('Google token validation error:', error);
      return {
        success: false,
        data: false,
        error: {
          error: 'token_validation_failed',
          error_description: error.message || 'Token validation failed',
        },
      };
    }
  }

  /**
   * Google OAuth 인증 URL 생성
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state }),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
