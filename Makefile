.PHONY: swa client api azurite tree

swa:
	swa start http://localhost:5173 --api-devserver-url http://localhost:7071

client:
	cd client && pnpm run dev

api:
	cd api && func start 

azurite:
	azurite --silent --location c:\azurite --debug c:\azurite\debug.log

tree:
	tree -I "node_modules|dist|bin|obj"