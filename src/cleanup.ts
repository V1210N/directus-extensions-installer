import fs from "fs"
import path from "path"

export const cleanFolder = (folderpath: string) => {
	console.log(`cleaning up files at ${folderpath}`)

	fs.readdir(folderpath, (err, records) => {
		if (err) throw new Error(`failed to read directory during cleanup: ${folderpath}. ` + err)

		records.forEach(record =>
			fs.rmSync(path.join(folderpath, record), { recursive: true, force: true })
		)
	})
}