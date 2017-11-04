import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";

// TODO: prepare SQLite
// TODO: prepare sender and receiver

enum ServiceStatus {
  Normally = 0,
  Degrading = 1,
}

const app = express();

app.set("view engine", "pug");
app.use(helmet());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  const status = { service: ServiceStatus.Normally };
  res.render("index", { status });
});

app.get("/stats", (req, res) => {
  const count = Number(req.query.count);
  // TODO: get stats data
  const stats = {
    sendReceive: [500, 400, 800, 1000, 200, 300, 450]
  };
  res.send(stats);
});

app.listen(3000, () => {
  console.log("service started on port 3000.");
})