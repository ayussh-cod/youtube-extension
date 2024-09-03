
let buttons = new Set();
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  let delay = 0;
  async function setdelay(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, delay);
      return;
    });
  }
  async function scrollToTop() {
    return new Promise((resolve, reject) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      resolve();
    });
  }
  console.log("message");

  let m = new Set();
  if (message.command === "executeScript") {
    console.log("execute script");
    
    let initdelay, totaldelay;
    initdelay = 1000;
    totaldelay = 11000;

    function scrollPage() {
      window.scrollBy(0, 1000);
    }

    for (let i = 0; i < 10; i++) {
      setTimeout(scrollPage, i * initdelay);
    }
    setTimeout(() => {
      const detailsDivs = document.querySelectorAll("#details");
      let title;
      let button;
      let c = 0;
      console.log(detailsDivs);
      detailsDivs.forEach((dD) => {
        console.log(dD);
        const metaDiv = dD.querySelector("#meta");
        c++;
        if (metaDiv) {
          const h3Tag = metaDiv.querySelector("h3");
          if (h3Tag) {
            const videoLink = h3Tag.querySelector("#video-title-link");
            if (videoLink) {
              title = videoLink.getAttribute("title");
            }
          }
        }

        const menuDiv = dD.querySelector("div#menu");
        if (menuDiv) {
          const ytdMenuRenderer = menuDiv.querySelector(
            "ytd-menu-renderer.style-scope.ytd-rich-grid-media"
          );
          if (ytdMenuRenderer) {
            const ytIconButton = ytdMenuRenderer.querySelector(
              "yt-icon-button#button"
            );
            if (ytIconButton) {
              button = ytIconButton.querySelector("button#button");
            }
          }
        }
        if (title && button) {
          console.log(title)
          m.add({ title: title, c });
          buttons.add({ c, button });
        }
      });
    }, totaldelay);

    setTimeout(() => {
      chrome.runtime.sendMessage({
        message: "fetch_data",
        API_KEY: message.API_KEY,
        m: Array.from(m),
        tabs: message.tabs,
        current_tab: message.current_tab,
      });
    }, totaldelay + 3000);
  }

  if (message.command === "Help") {
    let neg = Array.from(message.neg);

    async function clickNotInterested() {
      return new Promise((resolve, reject) => {
        const elements = document.querySelectorAll(
          "yt-formatted-string.style-scope.ytd-menu-service-item-renderer"
        );

        for (const element of elements) {
          if (element.textContent.trim() === "Not interested") {
            console.log("Element found:", element);
            element.click();

            resolve();
            return;
          }
        }
        reject(new Error("Element not found"));
      });
    }
    async function buttonclic(b) {
      return new Promise((resolve, reject) => {
        b.button.click();
        resolve();
      });
    }
    async function processButtons() {
      for (const b of buttons) {
        for (const n of neg) {
          if (b.c === n) {
            try {
              console.log(b);
              await buttonclic(b);

              await clickNotInterested();
            } catch (error) {
              await buttonclic(b);

              console.error("Error clicking 'Not interested':");
            }
          }
        }
      }
      await setdelay(3000);
      await scrollToTop();
    }
    processButtons();
  }
});
