// 세션 관리 서비스
// 세션 저장소, 발급, 회전, 폐기 등 세션 생명주기 관리

import { AuthSession, User } from '../../shared/types/user';

// 세션 저장소 인터페이스
export interface SessionStore {
  createSession(userId: string, expiresAt: Date): Promise<AuthSession>;
  getSession(sessionId: string): Promise<AuthSession | null>;
  updateSession(sessionId: string, updates: Partial<AuthSession>): Promise<AuthSession | null>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteUserSessions(userId: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<number>;
}

// In-Memory 세션 저장소 (개발용)
export class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, AuthSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  async createSession(userId: string, expiresAt: Date): Promise<AuthSession> {
    const sessionId = this.generateSessionId();
    const session: AuthSession = {
      userId,
      sessionId,
      expiresAt,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    // 사용자별 세션 추적
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    return session;
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // 만료된 세션 체크
    if (session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<AuthSession>
  ): Promise<AuthSession | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);

    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    // 사용자별 세션에서도 제거
    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    return this.sessions.delete(sessionId);
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    const userSessions = this.userSessions.get(userId);

    if (!userSessions) {
      return false;
    }

    // 모든 사용자 세션 삭제
    for (const sessionId of userSessions) {
      this.sessions.delete(sessionId);
    }

    this.userSessions.delete(userId);
    return true;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        await this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Redis 세션 저장소 (프로덕션용)
export class RedisSessionStore implements SessionStore {
  // TODO: Redis 클라이언트 구현
  // Redis 연결 및 세션 CRUD 작업

  async createSession(userId: string, expiresAt: Date): Promise<AuthSession> {
    throw new Error('Redis session store not implemented yet');
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    throw new Error('Redis session store not implemented yet');
  }

  async updateSession(
    sessionId: string,
    updates: Partial<AuthSession>
  ): Promise<AuthSession | null> {
    throw new Error('Redis session store not implemented yet');
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    throw new Error('Redis session store not implemented yet');
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    throw new Error('Redis session store not implemented yet');
  }

  async cleanupExpiredSessions(): Promise<number> {
    throw new Error('Redis session store not implemented yet');
  }
}

// 세션 발급 옵션
export interface SessionIssueOptions {
  userId: string;
  expiresIn?: number; // 밀리초
  extendExisting?: boolean; // 기존 세션 연장 여부
}

// 세션 발급 서비스
export class SessionService {
  private sessionStore: SessionStore;
  private defaultExpiresIn: number;

  constructor(defaultExpiresIn: number = 24 * 60 * 60 * 1000) {
    // 24시간
    this.defaultExpiresIn = defaultExpiresIn;
    this.sessionStore = this.createSessionStore();
  }

  private createSessionStore(): SessionStore {
    const storeType = process.env.SESSION_STORE_TYPE || 'memory';

    switch (storeType) {
      case 'redis':
        return new RedisSessionStore();
      case 'memory':
      default:
        return new InMemorySessionStore();
    }
  }

  /**
   * 새 세션 발급
   */
  async issueSession(options: SessionIssueOptions): Promise<AuthSession> {
    const { userId, expiresIn = this.defaultExpiresIn, extendExisting = false } = options;

    const expiresAt = new Date(Date.now() + expiresIn);

    // 기존 세션 연장 옵션이 활성화된 경우
    if (extendExisting) {
      const existingSessions = await this.getUserSessions(userId);
      if (existingSessions.length > 0) {
        // 가장 최근 세션을 연장
        const latestSession = existingSessions[0];
        const updatedSession = await this.sessionStore.updateSession(latestSession.sessionId, {
          expiresAt,
        });
        return updatedSession || (await this.sessionStore.createSession(userId, expiresAt));
      }
    }

    // 새 세션 생성
    return await this.sessionStore.createSession(userId, expiresAt);
  }

  /**
   * 세션 갱신 (회전)
   */
  async rotateSession(sessionId: string, userId: string): Promise<AuthSession | null> {
    // 기존 세션 삭제
    await this.sessionStore.deleteSession(sessionId);

    // 새 세션 발급
    const newSession = await this.issueSession({ userId });
    return newSession;
  }

  /**
   * 세션 연장
   */
  async extendSession(sessionId: string, expiresIn?: number): Promise<AuthSession | null> {
    const session = await this.sessionStore.getSession(sessionId);

    if (!session) {
      return null;
    }

    const newExpiresAt = new Date(Date.now() + (expiresIn || this.defaultExpiresIn));
    return await this.sessionStore.updateSession(sessionId, { expiresAt: newExpiresAt });
  }

  /**
   * 세션 폐기
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    return await this.sessionStore.deleteSession(sessionId);
  }

  /**
   * 사용자 모든 세션 폐기
   */
  async revokeUserSessions(userId: string): Promise<boolean> {
    return await this.sessionStore.deleteUserSessions(userId);
  }

  /**
   * 세션 유효성 검증
   */
  async validateSession(sessionId: string): Promise<AuthSession | null> {
    return await this.sessionStore.getSession(sessionId);
  }

  /**
   * 사용자 세션 목록 조회
   */
  async getUserSessions(userId: string): Promise<AuthSession[]> {
    // TODO: 사용자별 세션 조회 구현
    // 현재는 세션 저장소에서 직접 조회하는 방법이 필요
    return [];
  }

  /**
   * 만료된 세션 정리
   */
  async cleanupExpiredSessions(): Promise<number> {
    return await this.sessionStore.cleanupExpiredSessions();
  }

  /**
   * 세션 통계 조회
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    // TODO: 세션 통계 구현
    return {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0,
    };
  }
}

// 기본 세션 서비스 인스턴스
export const sessionService = new SessionService();
