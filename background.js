let neg = new Set();
const CONFIG = {
  API_KEY: "",
  Host_Name: "",
  URL: "",
};

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  let current_tab;

  function handleTabQuery(tabs) {
    tabs.forEach((tab) => {
      if (tab.url === "http://localhost:3000/") {
        current_tab = tab.id;
      }
    });
  }

  chrome.tabs.query({ url: "http://localhost:3000/" }, handleTabQuery);
  if (request.message === "fetch_data") {
    let watchids = Array.from(request.m);
    let di = 0;
    let ti = 0;
    let completedRequests = 0;
    chrome.tabs.update(request.current_tab, { active: true });
    console.log("watchids");
    console.log(watchids);
    if (watchids && Array.isArray(watchids) && watchids.length > 0) {
      Array.from(watchids).forEach(async ({ title, c }) => {
        const url = CONFIG.URL;
        const options = {
          method: "POST",
          headers: {
            "x-rapidapi-key": CONFIG.API_KEY,
            "x-rapidapi-host": CONFIG.Host_Name,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify([
            {
              id: c,
              language: "en",
              text: title,
            },
          ]),
        };

        try {
          //console.log(CONFIG.API_KEY);
          const response = await fetch(url, options);

          const jsonData = await response.json();
          const result = await response.text();

          console.log(result);

          ti += 1;
          if (result === "negative") {
            di += 1;
            console.log(title);
            neg.add(c);
          }
        } catch (error) {
          console.log(error);
        } finally {
          completedRequests++;

          if (completedRequests === watchids.length) {
            let data = parseFloat((di * 100) / ti);
            try {
              setTimeout(() => {
                console.log(current_tab);
                chrome.tabs.sendMessage(current_tab, {
                  action: "saveData",
                  data: data,
                  tabs: request.tabs,
                  current_tab: current_tab,
                });
              }, 4000);
            } catch (error) {
              chrome.tabs.reload(current_tab);
            }
            return true;
          }
        }
      });
    }
    return true;
  }
  if (request.command === "create tab") {
    chrome.tabs.create({ url: "https://www.youtube.com/" }, function (tabs) {
      setTimeout(() => {
        console.log(tabs);
        chrome.tabs.sendMessage(tabs.id, {
          command: "executeScript",
          url: tabs.url,
          tabs: tabs,
          current_tab: current_tab,
        });
      }, 3000);
    });
  }
});
chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  let current_tab;
  function handleTabQuery(tabs) {
    tabs.forEach((tab) => {
      if (tab.url === "http://localhost:3000/") {
        current_tab = tab.id;
      }
    });
  }
  chrome.tabs.query({ url: "http://localhost:3000/" }, handleTabQuery);
  if (request.command === "create tab") {
    chrome.tabs.create({ url: "https://www.youtube.com/" }, function (tabs) {
      setTimeout(() => {
        console.log(tabs.id);
        youtubetab = tabs;
        chrome.tabs.sendMessage(tabs.id, {
          command: "executeScript",
          API_KEY: request.API_KEY,
          url: tabs.url,
          tabs: tabs,
          current_tab: current_tab,
        });
      }, 3000);
    });
  }
  if (request.command === "Help") {
    chrome.tabs.update(youtubetab.id, { active: true });
    setTimeout(() => {
      chrome.tabs.sendMessage(youtubetab.id, {
        command: "Help",
        current_tab: current_tab,
        neg: Array.from(neg),
      });
    }, 3000);
  }
});
