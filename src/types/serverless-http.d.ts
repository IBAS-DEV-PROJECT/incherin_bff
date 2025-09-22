// 외부 라이브러리 타입 선언
// 타입 정의가 없는 npm 패키지의 타입 보강

declare module 'serverless-http' {
  import { Application } from 'express';

  function serverless(app: Application): any;
  export = serverless;
}
