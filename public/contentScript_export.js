// This file is injected into a page by chrome's content script. See:
// https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
//
// The page this will run on is specified in the manifest.json file
// under content_scripts.matches[]
//
// In our case, this will run on graphdev.app
//
// On page load we send a message which will be received by the
// running chrome extension. The extension will then send back
// a message with the current draft payload.
//
// We then insert the payload into the page dom so that the
// webpage can read it out.

// Inject the payload into the page dom. The page can poll this
// element to get the payload.
const insertDraftPayload = (payload) => {
  const div = document.createElement("div")
  div.id = "graphDev__draftPayload"
  div.style.display = "none"
  div.textContent = payload
  const elem = document.body || document.documentElement
  elem.appendChild(div)
}

// Pick up the sessionId from the url.
const params = new URLSearchParams(window.location.search)
const sessionId = params.get("sessionId")

// Send ready status and receive draft payload from the extension.
chrome.runtime.sendMessage(
  { message: "ready", sessionId },
  function (response) {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
      return
    }

    if (response.message === "draft") {
      insertDraftPayload(response.payload)
    }
  }
)
