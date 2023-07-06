// Insert payload into page dom, we can read this out
// in the host page.
const insertDraftPayload = (payload) => {
  const div = document.createElement("div")
  div.id = "graphDev__draftPayload"
  div.style.display = "none"
  div.textContent = payload
  const elem = document.body || document.documentElement
  elem.appendChild(div)
}

const params = new URLSearchParams(window.location.search)
const sessionId = params.get("sessionId")

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
