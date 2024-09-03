// contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "saveData") {
    localStorage.setItem("key", JSON.stringify(message.data));

    function injectScript(file_path, tag) {
      var node = document.getElementsByTagName(tag)[0];
      var script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", file_path);
      node.appendChild(script);
    }

    injectScript(chrome.runtime.getURL("api/inject-script.js"), "head");

    console.log("script injected");
  }
});
