const pino = require("pino");
const pretty = require("pino-pretty");
const logger = pino(
  pretty({
    ignore: 'pid'
  })
);

// const logger = require('pino')({
//   prettyPrint: {
//       ignore: 'pid,hostname'
//   }
// })

const { promisify } = require("util");
const { pipeline } = require("stream");
const pipelineAsync = promisify(pipeline);

module.exports = {
  logger,
  pipelineAsync,
  promisify,
};
