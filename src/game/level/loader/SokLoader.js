import Loader from './Loader';

const commentRegExp = /^::/;
const rowRegExp = /^[@+#.$* ]+$/;

export default class LoaderSok extends Loader {
  async loadFromFile(file) {
    const text = await super.loadFromFile(file);
    try {
      return parseFromText(text);
    }
    catch (e) {
      return Promise.resolve(`Unable to parse SOK from file "${file.name}".`);
    }
  }

  async loadFromUrl(url, options = {}) {
    const response = await super.loadFromUrl(url, options);
    if (response.headers.get('Content-Type').indexOf('text/plain') !== 0) {
      return Promise.reject(`Response from "${url}" is not of text content type.`);
    }
    const text = await response.text();
    return parseFromText(text);
  }
}

function parseFromText(text) {
  const lines = text.split('\n');

  // TODO: implement reading metadata (titles, descriptions, etc.)

  const levels = [];
  let level = null;

  lines.forEach(line => {
    line = line.replace(/\r$/, '');

    if (commentRegExp.test(line)) {
      return;
    }

    if (rowRegExp.test(line)) {
      if (level === null) {
        level = { name: '', description: '', items: [] };
      }
      level.items.push(line);
    }
    else {
      if (level !== null) {
        levels.push(level);
      }
      level = null;
    }
  });

  return {
    levels
  };
}
