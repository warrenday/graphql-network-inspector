// export const parseRequestBody = (
//   requestBody: chrome.webRequest.WebRequestBodyDetails["requestBody"]
// ) => {
//   if (requestBody && requestBody.raw && !requestBody.formData) {
//     const requestString = requestBody.raw
//       .map((data) => {
//         if (!data.bytes) {
//           return data;
//         }
//         const arr = (new Uint8Array(data.bytes) as unknown) as number[];
//         return decodeURIComponent(String.fromCharCode.apply(null, arr));
//       })
//       .join("");

//     return requestString;
//   }
// };

export const onRequestFinished = (
  cb: (e: chrome.devtools.network.Request) => void
) => {
  chrome.devtools.network.onRequestFinished.addListener(cb);
  return () => {
    chrome.devtools.network.onRequestFinished.removeListener(cb);
  };
};
