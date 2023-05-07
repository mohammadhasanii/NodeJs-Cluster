
# NodeJs-Cluster

Clusters of Node.js processes can be used to run multiple instances of Node.js that can distribute workloads among their application threads. When process isolation is not needed, use the worker_threads module instead, which allows running multiple application threads within a single Node.js instance.


![Logo]([[https://wallpaperaccess.com/download/nodejs-3909224](https://miro.medium.com/v2/resize:fit:1200/1*m5RYM_Wkj4LsZewpigV5tg.jpeg](https://miro.medium.com/v2/resize:fit:720/format:webp/1*m5RYM_Wkj4LsZewpigV5tg.jpeg)))


## Source Code 


```

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


```



## Run the application


```bash
node index.js

```
    
## How it works

The worker processes are spawned using the child_process.fork() method, so that they can communicate with the parent via IPC and pass server handles back and forth.

The cluster module supports two methods of distributing incoming connections.

The first one (and the default one on all platforms except Windows) is the round-robin approach, where the primary process listens on a port, accepts new connections and distributes them across the workers in a round-robin fashion, with some built-in smarts to avoid overloading a worker process.

The second approach is where the primary process creates the listen socket and sends it to interested workers. The workers then accept incoming connections directly.

The second approach should, in theory, give the best performance. In practice however, distribution tends to be very unbalanced due to operating system scheduler vagaries. Loads have been observed where over 70% of all connections ended up in just two processes, out of a total of eight.

Because server.listen() hands off most of the work to the primary process, there are three cases where the behavior between a normal Node.js process and a cluster worker differs:

    server.listen({fd: 7}) Because the message is passed to the primary, file descriptor 7 in the parent will be listened on, and the handle passed to the worker, rather than listening to the worker's idea of what the number 7 file descriptor references.
    server.listen(handle) Listening on handles explicitly will cause the worker to use the supplied handle, rather than talk to the primary process.
    server.listen(0) Normally, this will cause servers to listen on a random port. However, in a cluster, each worker will receive the same "random" port each time they do listen(0). In essence, the port is random the first time, but predictable thereafter. To listen on a unique port, generate a port number based on the cluster worker ID.

Node.js does not provide routing logic. It is therefore important to design an application such that it does not rely too heavily on in-memory data objects for things like sessions and login.

Because workers are all separate processes, they can be killed or re-spawned depending on a program's needs, without affecting other workers. As long as there are some workers still alive, the server will continue to accept connections. If no workers are alive, existing connections will be dropped and new connections will be refused. Node.js does not automatically manage the number of workers, however. It is the application's responsibility to manage the worker pool based on its own needs.

Although a primary use case for the node:cluster module is networking, it can also be used for other use cases requiring worker processes


## Support

For support, email m789219@gmail.com

