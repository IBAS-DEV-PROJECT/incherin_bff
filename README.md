# 🚀 Incherin BFF (Backend For Frontend)

Express.js 기반의 TypeScript BFF 서버로, 프론트엔드와 백엔드 사이의 중간 계층 역할을 담당합니다.

## 📋 목차

- [🏗️ 프로젝트 구조](#️-프로젝트-구조)
- [🚀 시작하기](#-시작하기)
- [🏛️ 아키텍처](#️-아키텍처)
- [🔧 배포](#-배포)
- [🛠️ 개발 가이드](#️-개발-가이드)

## 🏗️ 프로젝트 구조

```
incherin-bff/
├── src/
│   ├── app/                   # Express 앱 설정
│   ├── config/                # 환경 설정
│   ├── middleware/            # Express 미들웨어
│   ├── modules/               # 도메인별 모듈 (system, user, ...)
│   ├── services/              # 외부/내부 서비스
│   │   ├── external/          # 백엔드 API 호출
│   │   └── internal/          # 데이터 변환 로직
│   ├── shared/                # 공통 리소스
│   │   └── types/             # 공통 타입 정의
│   ├── types/                 # BFF 전용 타입
│   │   ├── client/            # 프론트엔드용 타입
│   │   └── server/            # 백엔드용 타입
│   └── index.ts               # 앱 진입점
├── netlify/                   # Netlify Functions
├── dist/                      # 빌드 결과물
└── netlify.toml              # Netlify 배포 설정
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd incherin-bff

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 환경 변수 설정
```

### 환경 변수

`.env` 파일에 다음 변수들을 설정하세요:

```env
# 서버 설정
PORT=8080
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# 백엔드 API 설정
BACKEND_API_URL=http://localhost:8000

# 빌드 정보 (선택사항)
BUILD_TIME=2024-01-01T00:00:00.000Z
GIT_SHA=abc1234
DEPLOYED_AT=2024-01-01T00:00:00.000Z
```

### 개발 서버 실행

```bash
# 개발 모드 (nodemon + ts-node)
npm run dev

# 빌드
npm run build

# 프로덕션 모드
npm start
```

서버가 `http://localhost:8080`에서 실행됩니다.

## 🏛️ 아키텍처

### BFF 데이터 흐름

```
Frontend → BFF → Backend
    ↑        ↓
    └── 변환된 데이터
```

1. **Frontend → BFF**: 프론트엔드 친화적인 요청
2. **BFF → Backend**: 백엔드 API 호출 (복수 가능)
3. **Backend → BFF**: 원본 데이터 수신
4. **BFF → Frontend**: 변환된 데이터 응답

### 주요 컴포넌트

- **Controller**: HTTP 요청/응답 처리
- **Service**: 비즈니스 로직 및 외부 서비스 조합
- **External Services**: 백엔드 API 호출
- **Internal Services**: 데이터 변환 및 가공
- **Types**: 타입 안전성 보장

### 타입 시스템

```
shared/types/     # 전역 공통 타입
modules/*/types/  # 도메인별 타입
types/client/     # 프론트엔드용 타입
types/server/     # 백엔드용 타입
```

## 🔧 배포

### Netlify Functions

이 프로젝트는 Netlify Functions로 배포되도록 설정되어 있습니다.

```bash
# 빌드
npm run build

# Netlify에 배포
# 1. Netlify 계정에 저장소 연결
# 2. Build command: npm run build
# 3. Functions directory: netlify/functions
# 4. Publish directory: dist
```

### 환경 변수 설정 (Netlify)

Netlify 대시보드에서 다음 환경 변수를 설정하세요:

- `CORS_ORIGIN`: 프론트엔드 도메인
- `BACKEND_API_URL`: 백엔드 API URL
- `NODE_ENV`: production

## 🛠️ 개발 가이드

### 새로운 모듈 추가

1. `src/modules/[모듈명]/` 폴더 생성
2. controller, service, routes, types 파일 생성
3. `src/app/routes.ts`에 라우터 등록

### 타입 시스템

- `shared/types/`: 전역 공통 타입
- `modules/*/types.ts`: 도메인별 타입
- `types/client/`: 프론트엔드용 타입
- `types/server/`: 백엔드용 타입

### 서비스 패턴

**External Service** → 백엔드 API 호출  
**Internal Service** → 데이터 변환  
**Module Service** → 비즈니스 로직 조합

## 📚 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Deployment**: Netlify Functions
- **Development**: Nodemon, ts-node

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 ISC 라이센스 하에 있습니다.

---

**Happy Coding!** 🎉
