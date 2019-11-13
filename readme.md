# Image Resizer
Resizes single/multiple uploaded images and downloads into a zip file.

![Preview](https://raw.githubusercontent.com/brockwei/image-resizer/master/preview.png)

## Instructions
### Server
1. Change `server_port` in `server/config.json` to which the server will listen on
2. run `npm install`
3. run `npm run start`

### Client
1. Change `server_url` in `client/src/config.json` to the port at which server is running
2. run `npm install`
3. run `npm run start`

## Built with
- ant-design (upload UI component)
- sharp
- adm-zip