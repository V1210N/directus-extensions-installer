import { https } from "follow-redirects"
import fs from "fs"
import crypto from "crypto"

export const DOWNLOAD_PATH = "tmp/downloads"

const SUPPORTED_EXTENSIONS = ["zip"]

interface QueuedDownload {
	url: string
	name: string
}

export const downloadFile = async (queued: QueuedDownload): Promise<string> => {
	console.log(`downloading extension: ${queued.name}`)

	return new Promise((resolve, reject) => https.get(queued.url, (response) => {
		let fileExtension = ""
		if (response.headers["content-type"]) {
			const split = response.headers["content-type"].split("/")
			if (split.length <= 1) {
				reject(
					`invalid content-type header received for extension : ${queued.name}. It should be of a format like 'application/zip' or other supported types`
				)
				return
			}

			if (!SUPPORTED_EXTENSIONS.includes(split[1])) {
				reject(
					`invalid content-type recived for extension: ${queued.name}. It should be of one of the supported types: ${SUPPORTED_EXTENSIONS.join(",")}`
				)
				return
			}

			fileExtension = split[1]
		} else {
			reject(`no content-type found in response for extension: ${queued.name}`)
			return
		}

		const filename = `${queued.name}-${crypto.randomBytes(20).toString("hex")}.${fileExtension}`
		const file = fs.createWriteStream(`${DOWNLOAD_PATH}/${filename}`, { mode: 777 })

		response.pipe(file)

		file.on("finish", () => resolve(filename))
	}))
}