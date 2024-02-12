let bytesAmount = 0, socketIoClientId = null

const API_URL = 'http://127.0.0.1:3000';
const ON_UPLOAD_EVENT = 'file-uploaded';

const form = document.querySelector('form')
form.action = API_URL;

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

  // const interval = setInterval(() => {
  //     console.count()
  //     const result = bytesAmount - 5e6
  //     bytesAmount = result < 0 ? 0 : result
  //     updateStatus(bytesAmount)
  //     if(bytesAmount === 0 ) clearInterval(interval)
  // }, 50)
};

const updateMessage = (message) => {
  const msg = document.getElementById('msg');
  msg.innerText = message;

  msg.classList.add('alert', 'alert-success');
  setTimeout(() => (msg.hidden = true), 3000);
};

const showMessage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serverMessage = urlParams.get('msg');
  if (!serverMessage) return;

  updateMessage(serverMessage);
};

const onload = () => {
  showMessage();

  const ioClient = io.connect(API_URL, { withCredentials: false });
  ioClient.on('connect', (msg) => {
    socketIoClientId = ioClient.id
    console.log('connected!', ioClient.id);
    form.action = API_URL + `/?socketId=${ioClient.id}`;
  });

  ioClient.on(ON_UPLOAD_EVENT, (bytesReceived) => {
    console.log('received', bytesReceived);
    bytesAmount = bytesAmount - bytesReceived;
    updateStatus(bytesAmount);
  });

  updateStatus(0);
};

const submit = (event) => {
  event.preventDefault();
  const fileInputElement = document.getElementById('file');

  const formData = new FormData()
  for (let index = 0; index < fileInputElement.files.length; index++) {
    formData.append('file', fileInputElement.files[index])
  }
  //const uploadURL = socketIoClientId ? API_URL + `?socketId=${socketIoClientId}` : API_URL

  fetch(form.action, {
    method: 'POST',
    body: formData
  }).then((response) => {
    console.log('Successfully uploaded', response)
    showMessage()
    resetForm()
  }).catch((error) => {
    console.error('Something went wrong', error)
  })
}

form.onsubmit = submit;
window.onload = onload;
window.showSize = showSize;
