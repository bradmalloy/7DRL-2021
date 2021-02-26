build:
	npm install
	mkdir dist
	browserify src/index.ts -p [ tsify --noImplicitAny ] > dist/bundle.js
	cp src/index.html dist/index.html