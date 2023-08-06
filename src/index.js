const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const nocache = require("nocache");
const { messageRouter } = require("./messages/messages.router");
const {expressjwt: jwt} = require('express-jwt')
const jwks = require('jwks-rsa')

dotenv.config()
if (!(process.env.PORT && process.env.CLIENT_ORIGIN_URL)) {
  throw new Error(
    "Missing required environment variables. Check docs for more info."
  );
}

const PORT = parseInt(process.env.PORT, 10);
const CLIENT_ORIGIN_URL = process.env.CLIENT_ORIGIN_URL;

const app = express();
const apiRouter = express.Router();

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
    },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        "default-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    frameguard: {
      action: "deny",
    },
  })
);

app.use((req, res, next) => {
  res.contentType("application/json; charset=utf-8");
  next();
});
app.use(nocache());

app.use(
  cors({
    origin: CLIENT_ORIGIN_URL,
    methods: ["GET"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400,
  })
);

const verifyJWT = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_DOMAIN,
  algorithms: ["RS256"]
}).unless({path: ["/api/messages/public"]})

app.use(verifyJWT)
app.use("/api", apiRouter);
apiRouter.use("/messages", messageRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});