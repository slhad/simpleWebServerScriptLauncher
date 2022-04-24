import { createServer } from "http"
import { promisify } from "util"
import { exec as execCallback } from "child_process"

const exec = promisify(execCallback)

const script = process.env.SCRIPT || "script.sh"
const method = (process.env.METHOD || "post").toLocaleLowerCase()
const path = process.env.URL_PATH || "runScript"
const port = process.env.PORT || "8888"
const address = process.env.ADDRESS || "0.0.0.0"
const responseType = "text/plain"

export type SimpleWebConfig = {
    [methodAndPath: string]: {
        method: string,
        path: string,
        script: string
    }
}
const configGenerator = () => {
    const swc: SimpleWebConfig = {}
    swc[`${method}${path}`] = {
        method,
        path,
        script
    }

    let lookingIndex = 0
    do {
        const aMethod = process.env[`METHOD_${lookingIndex}`]
        const aPath = process.env[`URL_PATH_${lookingIndex}`]
        const aScript = process.env[`SCRIPT_${lookingIndex}`]

        if (!(aMethod && aPath && aScript)) {
            if (aMethod || aPath || aScript) {
                throw new Error(`A variable is not set for METHOD_${lookingIndex}=${aMethod} URL_PATH_${lookingIndex}=${aPath} SCRIPT_${lookingIndex}=${aScript}`)
            } else {
                lookingIndex = -1
                continue
            }
        }

        const key = `${aMethod}${aPath}`
        if (swc[key]) {
            throw new Error(`Duplicated configuration for method : path -> ${aMethod} - ${path}`)
        } else {
            swc[key] = {
                method: aMethod,
                path: aPath,
                script: aScript
            }
        }
        lookingIndex++

    } while (lookingIndex >= 0)
    return swc
}

const listen = () => {
    const simpleConfig = configGenerator()
    createServer(async (req, res) => {

        const qMethod = (req.method || "post").toLocaleLowerCase()
        const qPath = req.url || "/"

        console.log(`Query ${req.method} ${req.url}`)

        let ran = false
        for (const routeKey in simpleConfig) {
            const route = simpleConfig[routeKey]

            if (qMethod === route.method && qPath === `/${route.path}`) {
                ran = true
                let resMsg
                try {
                    const execution = await exec(route.script)
                    res.writeHead(200, { "Content-Type": responseType })
                    resMsg = `Script ${route.script} executed :\nstdout :\n${execution.stdout}\nstderr:\n${execution.stderr}`
                } catch ({ message, stack }) {
                    res.writeHead(500, { "Content-Type": responseType })
                    resMsg = `Script ${route.script} executed and failed : ${message}\n${stack}`
                }
                res.write(resMsg)
                console.log(resMsg)
                break
            }
        }

        if (!ran) {
            res.writeHead(404, { "Content-Type": responseType })
            res.write(`Rejected query ${req.method} ${req.url}`)
        }

        res.end()
    }).listen(parseInt(port), address, undefined, () => {
        for (const routeKey in simpleConfig) {
            const route = simpleConfig[routeKey]
            console.log(`Listening for ${route.method} ${port} /${route.path} -> ${route.script}`)
        }
    })
}

export default listen