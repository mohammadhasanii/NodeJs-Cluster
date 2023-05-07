import cluster from "node:cluster";
import http from "node:http";
import { availableParallelism } from "node:os";
import process from "node:process";

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  for (let index = 0; index < numCPUs; index++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http
    .createServer((req, res) => {
      res.writeHead(200);
      
      res.end("hello world");
    })
    .listen(3000);
    
  console.log(`woker ${process.pid}started`);
}
