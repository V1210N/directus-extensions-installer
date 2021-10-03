import yamljs from "yamljs"
import { CONFIG_FILE } from "./index"

export const EXTENSIONS_ARRAY = ["module", "interface", "display", "layout"] as const
export type ExtensionType = typeof EXTENSIONS_ARRAY[number]

export interface ExtensionItem {
	name: string
	type: ExtensionType
	repo: string
	owner: string
	token?: string
}

export const ReadConfig = (): Promise<ExtensionItem[]> => {
	return new Promise((resolve, reject) => {
		yamljs.load(CONFIG_FILE(), (result) => {
			if (!result) {
				reject(`no extensions yaml file at ${CONFIG_FILE()}`)
				return
			}

			resolve(result as ExtensionItem[])
		})
	})
}