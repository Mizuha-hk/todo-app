.PHONY: swa client api

swa:
	swa start http://localhost:5173 --api-devserver-url http://localhost:7071

client:
	cd client && pnpm run dev

api:
	cd api && func start 
