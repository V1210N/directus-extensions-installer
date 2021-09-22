import yauzl from "yauzl"
import fs from "fs"
import { DOWNLOAD_PATH } from "download"

export const EXTRACT_PATH = "tmp/extracted"

export const extractZip = (filename: string): Promise<void> => {
	console.log("starting extraction")

	return new Promise((resolve, reject) => {
		yauzl.open(`${DOWNLOAD_PATH}/${filename}`, { lazyEntries: true }, (err, zipfile) => {
			if (err) {
				reject(`an error occurred while opening file ${filename}. ` + err)
				return
			}
			if (!zipfile) {
				reject(`zipfile is undefined for file: ${filename}`)
				return
			}

			zipfile.readEntry()
			zipfile.on("end", () => resolve())
			zipfile.on("entry", (entry) => {
				// Create a directory to host the extraction
				fs.mkdirSync(filename)

				// If it's a directory, create it and queue its files.
				// Else, it's a file, so extract it.
				if (/\/$/.test(entry.fileName)) {
					// Create the directory so we don't try to create its files without it existing.
					fs.mkdirSync(`${EXTRACT_PATH}/${entry.fileName}`)

					// Directory file names end with '/'.
					// Note that entries for directories themselves are optional.
					// An entry's fileName implicitly requires its parent directories to exist.
					zipfile.readEntry();
				} else {
					zipfile.openReadStream(entry, (err, readStream) => {
						if (err) {
							reject(`an error occurred while opening the read stream for file ${filename}. ` + err)
							return
						}
						if (!readStream) {
							reject(`readstream is undefined for file ${filename}. ` + err)
							return
						}

						readStream.on("end", () => {
							zipfile.readEntry();
						});

						const file = fs.createWriteStream(`${EXTRACT_PATH}/${entry.fileName}`, { mode: 777 })

						readStream.pipe(file)
					})
				}
			})
		})
	})
}