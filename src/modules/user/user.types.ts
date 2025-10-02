// User 도메인 전용 타입 정의
// 사용자 정보, 프로필, 팔로우 관계 관련 타입들

import { BaseApiResponse } from '../../shared/types/api';
import { User } from '../../shared/types/user';

// 사용자 프로필 응답
export interface UserProfileResponse extends BaseApiResponse {
  user?: User;
  error?: {
    message: string;
    code: string;
  };
}

// 팔로우 응답
export interface FollowResponse extends BaseApiResponse {
  message?: string;
  error?: {
    message: string;
    code: string;
  };
}

// 팔로워 조회 응답
export interface FollowersResponse extends BaseApiResponse {
  followers?: User[];
  total?: number;
  error?: {
    message: string;
    code: string;
  };
}

// 팔로잉 조회 응답
export interface FollowingResponse extends BaseApiResponse {
  following?: User[];
  total?: number;
  error?: {
    message: string;
    code: string;
  };
}

// 사용자 정보 수정 요청
export interface UpdateUserRequest {
  name?: string;
  picture?: string;
}
