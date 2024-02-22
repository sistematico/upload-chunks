// https://accreditly.io/articles/uploading-large-files-with-chunking-in-javascript
// https://api.video/blog/tutorials/uploading-large-files-with-javascript/
// https://bun.sh/guides/write-file/filesink
// https://bun.sh/docs/api/file-io#incremental-writing-with-filesink
// https://github.com/oven-sh/bun/issues/1940
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range

let bytesAmount = 0, socketIoClientId = null

const API_URL = 'http://localhost:3000/upload'
const ON_UPLOAD_EVENT = 'file-uploaded'

const form = document.querySelector('form')
form.action = API_URL

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
};

const updateStatus = (size) => {
  const text = `Pending Bytes to Upload: <strong>${formatBytes(size)}</strong>`;
  document.getElementById('size').innerHTML = text;
};

const showSize = () => {
  const { files: fileElements } = document.getElementById('file');
  if (!fileElements.length) return;

  const files = Array.from(fileElements);
  const { size } = files.reduce(
    (prev, next) => ({ size: prev.size + next.size }),
    { size: 0 }
  );

  bytesAmount = size;
  updateStatus(size);
};

const updateMessage = (message) => {
  const msg = document.getElementById('msg');
  msg.innerText = message;

  msg.classList.add('alert', 'alert-success');
  setTimeout(() => (msg.hidden = true), 3000);
};

const showMessage = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const serverMessage = urlParams.get('msg')
  if (!serverMessage) return
  updateMessage(serverMessage)
}

const onload = () => {
  showMessage()

  const ioClient = io.connect(API_URL, { withCredentials: false })
  ioClient.on('connect', (msg) => {
    socketIoClientId = ioClient.id
    console.log('connected!', ioClient.id)
    form.action = API_URL + `/?socketId=${ioClient.id}`
  });

  ioClient.on(ON_UPLOAD_EVENT, (bytesReceived) => {
    console.log('received', bytesReceived);
    bytesAmount = bytesAmount - bytesReceived;
    updateStatus(bytesAmount);
  });

  updateStatus(0)
}

const handleFileUpload = event => {
  event.preventDefault()
  const fileInputElement = document.getElementById('file')
  const chunkSize = 1024 * 1024 
  let file, start = 0

  for (let index = 0; index < fileInputElement.files.length; index++) {
    file = fileInputElement.files[index]
    while (start < file.size) {
      uploadChunk(file.slice(start, start + chunkSize), file.name)
      start += chunkSize
    }
  }
}

function uploadChunk(chunk, filename) {
  const formData = new FormData()
  formData.append('file', chunk)
  
  fetch(API_URL, {
    method: 'POST',
    headers: { 'filename': filename },
    body: formData
  })
}

form.onsubmit = handleFileUpload;
window.onload = onload;
window.showSize = showSize;
