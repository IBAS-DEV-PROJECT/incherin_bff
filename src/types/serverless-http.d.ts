declare module 'serverless-http' {
  import { Application } from 'express';

  function serverless(app: Application): any;
  export = serverless;
}
