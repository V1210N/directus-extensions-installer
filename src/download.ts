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
					"accept": "application/octet-stream",
					"user-agent": "directus extensions installer"
				}
			}).then(file => {
				if (!file.headers["content-disposition"]) return reject(`failed to read content-disposition in release for extension ${ext.name}`)

				const contentDisposition = file.headers["content-disposition"].toString().split(";")
				let fileExtension = contentDisposition.find(fragment => {
					if (fragment.includes("filename=")) {
						return path.extname(fragment.split("=")[1].trim())
					}
				})

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
			})
		})
	)
}