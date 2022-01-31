const sharp = require("sharp");
const AdmZip = require("adm-zip");

module.exports = (express) => {
  const router = express.Router();

  router.post("/resize", (req, res) => {
    console.log("Received request");
    const { fileList, resizeValue, resizeType } = req.body;
    console.log(`Resizing ${fileList.length} files...`);
    const zip = new AdmZip();
    let count = 0;
    fileList.forEach((item, index) => {
      const uri = item.fileData.split(";base64,").pop();
      const imgBuffer = Buffer.from(uri, "base64");
      const image = sharp(imgBuffer);
      image
        .metadata()
        .then(function (metadata) {
          return image
            .resize(
              resizeType === "percentage"
                ? Math.round((metadata.width * resizeValue) / 100)
                : resizeValue
            )
            .webp()
            .toBuffer();
        })
        .then(function (data) {
          console.log(`Resized file ${index + 1}/${fileList.length}`);
          zip.addFile(item.fileName, data);
          count += 1;
          if (count === fileList.length) {
            console.log(`Finished resizing ${fileList.length} files.`);
            zip.toBuffer((data) => {
              res.json(data);
            });
          }
        });
    });
  });
  // Test route
  router.post("/test", (req, res) => {
    const image = sharp("test.jpg");
    const images = [image, image];
    const zip = new AdmZip();
    let count = 0;
    images.forEach((item) => {
      item
        .metadata()
        .then(function (metadata) {
          return item
            .resize(Math.round(metadata.width / 2))
            .webp()
            .toBuffer();
        })
        .then(function (data) {
          zip.addFile("test.jpg", data);
          count += 1;
          if (count === images.length) {
            console.log(item);
            zip.writeZip("test.zip");
          }
        });
    });
  });

  return router;
};
