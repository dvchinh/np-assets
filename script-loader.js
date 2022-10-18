const NPScriptMap = {};
const NPScriptLoader = (url, scriptID = "", settings = {}) => {
  if (NPScriptMap[scriptID] !== undefined) {
    return NPScriptMap[scriptID];
  } else {
    const promise = new Promise((resolve, reject) => {
      let scriptTag = document.createElement("script");
      for (var key in settings) {
        scriptTag.setAttribute(key, settings[key]);
      }
      scriptTag.id = scriptID;
      scriptTag.type = "text/javascript";
      scriptTag.onerror = err => {
        reject(err);
      };
      scriptTag.onload = () => {
        resolve({ script: scriptID, ready: true, firstTime: true });
      };
      scriptTag.src = url;
      let headTag = document.head || document.getElementsByTagName("head")[0];
      headTag.appendChild(scriptTag);
    });
    NPScriptMap[scriptID] = promise;
    return promise;
  }
};