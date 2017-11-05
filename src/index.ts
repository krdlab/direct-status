import * as express from "express";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { DirectObserver, DirectObserverOptions } from "./observer";

dotenv.config({ path: "/etc/status/.env" });

const options = new DirectObserverOptions(process.env);
if (!options.validate()) {
  console.error(`process.env is invalid: ${JSON.stringify(process.env)}`);
  process.exit(1);
}

// TODO: prepare SQLite

const observer = new DirectObserver(options);

const app = express();
app.set("view engine", "pug");
app.use(helmet());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  const status = observer.getServiceStatus();
  res.render("index", { status });
});

app.get("/stats", (req, res) => {
  const count = Number(req.query.count);
  const stats = observer.getServiceStats(count);
  res.send(stats);
});

async function start() {
  const [s, r] = await observer.start();
  console.log(`sender and receiver started: sender = ${s}, receiver = ${r}`);
  // TODO: observer.stop()

  app.listen(3000, () => {
    console.log("service started on port 3000.");
  });
}

start().then(() => {}).catch(console.error);