function openWarningPage(tab) {
  chrome.tabs.create({
    url: "chrome-extension://" + chrome.runtime.id + "/" + chrome.runtime.getManifest()["options_page"]
  })
}

chrome.browserAction.onClicked.addListener(openWarningPage);
