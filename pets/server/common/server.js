import Express from 'express';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as os from 'os';
import l from './logger';
import * as OpenApiValidator from 'express-openapi-validator';
import errorHandler from '../api/middlewares/error.handler';
import { rateLimiter } from '../api/middlewares/rateLimiter';
import mongoose from 'mongoose';
import * as auth from '../api/auth/auth';

const app = new Express();
const env = process.env.NODE_ENV || 'development';
const mongoURI =
  env === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);

    const apiSpec = path.join(__dirname, 'api.yml');
    const validateResponses = !!(
      process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
      process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
    );

    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '100kb',
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));

    app.use(process.env.OPENAPI_SPEC || '/spec', Express.static(apiSpec));
    app.use(
      OpenApiValidator.middleware({
        apiSpec,
        validateResponses,
        ignorePaths: /.*\/spec(\/|$)/,
      })
    );
    app.use(rateLimiter);
  }

  router(routes) {
    routes(app);
    app.use(errorHandler);
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = (p) => () =>
      l.info(
        `up and running in ${
          process.env.NODE_ENV || 'development'
        } @: ${os.hostname()} on port: ${p}}`
      );

    http.createServer(app).listen(port, welcome(port));

    mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('MongoDB connected!');
      })
      .catch((err) => console.log(err));

    mongoose.set('useCreateIndex', true);

    return app;
  }
}
