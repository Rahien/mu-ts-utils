import httpContext from "express-http-context";
import express from "express";
import bodyParser from "body-parser";

var app = express();

var port = parseInt(process.env.PORT || "80") || 80;
var hostname = process.env.HOST || "0.0.0.0";
var bodySizeLimit = process.env.MAX_BODY_SIZE || "100kb";

// parse JSONAPI content type
app.use(
  bodyParser.json({
    type: function (req) {
      const expressReq = req as express.Request;
      return /^application\/vnd\.api\+json/.test(
        expressReq.get("content-type") || ""
      );
    },
    limit: bodySizeLimit,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

// set JSONAPI content type
app.use("/", function (req, res, next) {
  res.type("application/vnd.api+json");
  next();
});

app.use(httpContext.middleware);

app.use(function (req, res, next) {
  httpContext.set("request", req);
  httpContext.set("response", res);
  next();
});

const errorHandler: express.ErrorRequestHandler = function (
  err,
  req,
  res,
  next
) {
  res.status(err.status || 400);
  res.json({
    errors: [{ title: err.message }],
  });
};

// start server
app.listen(port, hostname, function () {
  console.log(
    `Starting server on ${hostname}:${port} in ${app.get("env")} mode`
  );
});

export default app;

export { app, errorHandler };
