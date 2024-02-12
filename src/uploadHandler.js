const busboy = require("busboy");
const { logger, pipelineAsync } = require("./util");
const { join } = require("path");
const { createWriteStream } = require("fs");
const ON_UPLOAD_EVENT = "file-uploaded";

class UploadHandler {
  #io;
  #socketId;

  constructor(io, socketId) {
    this.#io = io;
    this.#socketId = socketId;
  }

  registerEvents(headers, onFinish) {
    const bb = busboy({ headers });
    bb.on("file", this.#onFile.bind(this));
    bb.on("finish", onFinish);
    return bb;
  }

  #handleFileBytes(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length;
        // logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size);
        yield item;
      }
    }
    return handleData.bind(this);
  }

  async #onFile(fieldname, file, filename) {
    const saveFileTo = join(__dirname, "../", "public", "downloads", filename.filename);
    logger.info("Uploading: " + saveFileTo);

    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    );

    logger.info(`File [${filename}] finished!`);
  }
}

module.exports = UploadHandler;
