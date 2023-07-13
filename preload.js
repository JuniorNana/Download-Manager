window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  const versions = ['chrome', 'node', 'electron'];
  for (const type of versions) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
