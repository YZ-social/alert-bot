import { createWriteStream } from 'fs';
import { Readable } from 'stream';

export async function saveUrlToFile(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);

    // Create a write stream to the destination file path
    const fileStream = createWriteStream(outputPath);

    // Node.js requires converting the web stream (Fetch) to a Node readable stream
    const nodeReadableStream = Readable.fromWeb(response.body);

    // Pipe the stream and wait for it to finish writing
    await new Promise((resolve, reject) => {
      nodeReadableStream.pipe(fileStream);
      nodeReadableStream.on('error', reject);
      fileStream.on('finish', resolve);
    });

    console.log('File successfully saved!');
  } catch (error) {
    console.error('Failed to save file:', error);
  }
}

export async function* readLines(response) { // Like NodeJS file.readLines, but for a fetch response.
  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();
  let previous = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      previous += value;
      let eolIndex;
      while ((eolIndex = previous.indexOf("\n")) >= 0) {
        yield previous.slice(0, eolIndex);
        previous = previous.slice(eolIndex + 1);
      }
    }
    if (previous.length > 0) {
      yield previous;
    }
  } finally {
    reader.releaseLock();
  }
}
