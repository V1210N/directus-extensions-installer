import fs from "fs"
import path from "path"
import crypto from "crypto"
import { Octokit } from "@octokit/rest"
import { ExtensionItem } from "./read"

// Use repository folder for development and root /tmp/ folder for production.
export const DOWNLOAD_PATH = process.env.NODE_ENV === "production" ? "/tmp/downloads" : "tmp/downloads"

const SUPPORTED_EXTENSIONS = [".zip"]

export const downloadFile = async (ext: ExtensionItem): Promise<string> => {
	console.log(`downloading extension: ${ext.name}`)

	const octokit = new Octokit({
		auth: ext.token,
		baseUrl: 'https://api.github.com',
		userAgent: "directus-extensions-installer"
	})

	return new Promise((resolve, reject) =>
		octokit.repos.getReleaseByTag({
			owner: ext.owner,
			repo: ext.repo,
			tag: "latest",
		}).then(response => {
			const assetId = response.data.assets.find(item => item.id !== undefined && item.id > 0)?.id
			if (!assetId) return reject(`failed to find asset ID for extension ${ext.name}`)

			octokit.repos.getReleaseAsset({
				owner: ext.owner,
				repo: ext.repo,
				asset_id: assetId,
				headers: {
					"accept": "application/octet-stream"
				}
			}).then(file => {
				if (!file.headers["content-disposition"]) return reject(`failed to read content-disposition in release for extension ${ext.name}`)

				const contentDisposition = file.headers["content-disposition"].toString().split(";")
				let fileExtension: string | undefined = undefined

				for (let i = 0; i < contentDisposition.length; i++) {
					if (contentDisposition[i].includes("filename=")) {
						fileExtension = path.extname(contentDisposition[i].split("=")[1].trim())
						break
					}
				}

				if (!fileExtension) return reject(`invalid content-disposition received for extension ${ext.name}. Received ${fileExtension}, filename extension must be one of: ${SUPPORTED_EXTENSIONS.join(",")}`)

				const filename = `${ext.name}-${crypto.randomBytes(20).toString("hex")}.${fileExtension}`

				fs.appendFile(
					`${DOWNLOAD_PATH}/${filename}`,
					Buffer.from(file.data as unknown as ArrayBuffer),
					(err) => {
						if (err) return reject(`failed to save downloaded file for ${ext.name}: ` + err)
						resolve(filename)
					}
				)
			}).catch(e => reject(`failed to download asset file for ${ext.name}: ` + e))
		}).catch(e => reject(`failed to get release for ${ext.name} by tag: ` + e))
	)
}