# Back end of Hexago
ide : Webstorm

# Prerequisites

run:
```
npm install
```

to launch the server, use :
```
DEBUG=backend:* npm start
```

#Apidoc

install api doc, run:
```
npm install apidoc -g
```
to run api doc and generate documentation on every files:
```
apidoc -i routes/ -o apidoc/
```
#Jest

to run tests, run:
```
npm run tests
```

# Log rotate

Log types:

DBB / JEST / CLOUDINARY / HTTP