export type CompressionType = 'gzip' | 'deflate'

const rawToUint8Array = (raw: chrome.webRequest.UploadData[]): Uint8Array => {
  const arrays = raw
    .filter((data) => data.bytes)
    .map((data) => new Uint8Array(data.bytes!))

  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0)
  const result = new Uint8Array(totalLength)

  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }

  return result
}

const stringToUint8Array = (str: string): Uint8Array => {
  const array = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i)
  }
  return array
}

export const decompress = async (
  raw: chrome.webRequest.UploadData[] | string,
  compressionType: CompressionType
) => {
  const uint8Array =
    typeof raw === 'string' ? stringToUint8Array(raw) : rawToUint8Array(raw)

  const readableStream = new Response(uint8Array).body
  if (!readableStream) {
    throw new Error('Failed to create readable stream from Uint8Array.')
  }

  // Pipe through the decompression stream
  const decompressedStream = readableStream.pipeThrough(
    new (window as any).DecompressionStream(compressionType)
  )

  console.log({ raw, uint8Array })

  // Convert the decompressed stream back to a Uint8Array
  const decompressedArrayBuffer = await new Response(
    decompressedStream
  ).arrayBuffer()

  return new Uint8Array(decompressedArrayBuffer)
}
