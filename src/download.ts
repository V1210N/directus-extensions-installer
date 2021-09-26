import { https } from "follow-redirects"
import fs from "fs"
import crypto from "crypto"
import { ExtensionItem } from "./read"

// Use repository folder for development and root /tmp/ folder for production.
export const DOWNLOAD_PATH = process.env.NODE_ENV === "production" ? "/tmp/downloads" : "tmp/downloads" 

const SUPPORTED_EXTENSIONS = ["zip"]

export const downloadFile = async (ext: ExtensionItem): Promise<string> => {
	console.log(`downloading extension: ${ext.name}`)

	return new Promise((resolve, reject) => https.get(ext.url, (response) => {
		let fileExtension = ""
		if (response.headers["content-type"]) {
			const split = response.headers["content-type"].split("/")
			if (split.length <= 1) {
				reject(
					`invalid content-type header received for extension : ${ext.name}. It should be of a format like 'application/zip' or other supported types`
				)
				return
			}

			if (!SUPPORTED_EXTENSIONS.includes(split[1])) {
				reject(
					`invalid content-type recived for extension: ${ext.name}. It should be of one of the supported types: ${SUPPORTED_EXTENSIONS.join(",")}`
				)
				return
			}

			fileExtension = split[1]
		} else {
			reject(`no content-type found in response for extension: ${ext.name}`)
			return
		}

		const filename = `${ext.name}-${crypto.randomBytes(20).toString("hex")}.${fileExtension}`
		const file = fs.createWriteStream(`${DOWNLOAD_PATH}/${filename}`, { mode: 777 })

		response.pipe(file)

		file.on("finish", () => resolve(filename))
	}))
}