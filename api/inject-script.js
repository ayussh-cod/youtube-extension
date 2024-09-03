console.log("<----- Injected script started running ----->");

function parseEssentialDetails() {
  window.updateState(localStorage.getItem("key"));
  window.updatedone(true);
}
setTimeout(() => {
  console.log("fdsafasfadsfas");
  parseEssentialDetails();
}, 2000);
