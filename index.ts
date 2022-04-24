import { createServer } from "http";
import { promisify } from "util";
import { exec as execCallback } from "child_process";

const exec = promisify(execCallback)

const script = process.env.script || "script.sh"
const method = process.env.method || "post"
const path = process.env.urlpath || "runScript"
const port = process.env.port || "8888"
const address = process.env.address || "0.0.0.0"
const responseType = "text/plain"

const listen = () => {
    createServer(async (req, res) => {
        console.log(`Query ${req.method} ${req.url}`)
        if (
            ((req.method || "post").toLocaleLowerCase() === method?.toLocaleLowerCase())
            && ((req.url || "/") === `/${path}`)
        ) {

            try {
                const execution = await exec(script)
                res.writeHead(200, { 'Content-Type': responseType });
                res.write(`Script ${script} executed :\nstdout :\n${execution.stdout}\nstderr:\n${execution.stderr}`)
            } catch ({ message, stack }) {
                res.writeHead(500, { 'Content-Type': responseType });
                res.write(`Script ${script} executed and failed : ${message}\n${stack}`)
            }
        } else {
            res.writeHead(404, { 'Content-Type': responseType });
            res.write(`Rejected query ${req.method} ${req.url}`);
        }
        res.end();
    }).listen(parseInt(port), address, undefined, () => {
        console.log(`Listening for ${method} ${port} ${path} -> ${script}`)
    });
}

export default listen