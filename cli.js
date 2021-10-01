#! /usr/bin/env node
const pjson = require("./package.json")
const args = process.argv.slice(2, process.argv.length);
const main = require("./dist/index")

const action = args[0]
const arguments = args.length > 1 ? args.slice(1, args.length) : undefined

const FLAGS = [
	{
		names: ["--keepConfig"],
		env: ["KEEP_CONFIG"]
	}
]
const OPTIONS = [
	{
		names: ["--directus-dir"],
		env: ["DIRECTUS_DIR"]
	},
	{
		names: ["--download-dir"],
		env: ["DOWNLOAD_DIR"]
	},
	{
		names: ["--config"],
		env: ["CONFIG_FILE"]
	},
	...FLAGS
]

const handleInstallArgs = () => {
	// Skip if no arguments and just use the default values
	if (arguments) {
		for (let i = 0; i < arguments.length; i++) {
			let arg = arguments[i]

			const match = OPTIONS.find(value => value.names.some(item => {
				if (item.startsWith(arg)) {
					// Remove the arg name from the string so we can check later whether this is a "--arg value" or a "--arg=value"
					arg = arg.replace(item, "")
					return true
				}
			}))
			if (!match) {
				console.error("unrecognized option: ", arg)
				process.exit(1)
			}

			if (arg.length === 0) {
				if (arguments.length > i + 1) {
					process.env[match.env] = arguments[i + 1]
					i++
				} else if (FLAGS.some(item => item.env === match.env)) {
					process.env[match.env] = "true"
				} else {
					console.error(`missing value for argument: ${match.names[0]}`)
					process.exit(1)
				}
			} else {
				process.env[match.env] === arg.slice(1, -1)
			}
		}
	}
}

const handleAction = async () => {
	switch (action) {
		case "install":
			handleInstallArgs()
			await main.default()
				.then(() => console.log("done!"))
				.catch(e => {
					console.log("failed to install:\n ", e)
					process.exit(1)
				})

			break

		case "version":
			if (arguments) {
				arguments.forEach((option, index) => {
					console.log(`${index} ${option}`)
				})
			}

			console.log(pjson.version)
			break

		default:
			console.log("invalid option")
			process.exit(1)
	}

	process.exit(0)
}

handleAction()