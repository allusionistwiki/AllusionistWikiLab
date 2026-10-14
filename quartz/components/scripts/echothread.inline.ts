let loaded = false

function loadEchoThread(): void {
  if (loaded) return
  const el = document.getElementById("echothread")
  if (!el) return
  const key = el.getAttribute("data-api-key")
  // 未設定（プレースホルダ）なら読み込まない
  if (!key || key === "REPLACE_WITH_API_KEY") {
    const note = document.createElement("p")
    note.textContent =
      "（EchoThread API key 未設定: quartz.layout.ts の Component.EchoThread({ apiKey }) に、echothread.io で登録した API key を設定してください）"
    note.style.color = "var(--secondary)"
    el.parentElement?.appendChild(note)
    return
  }
  const script = document.createElement("script")
  script.src = "https://cdn.echothread.io/widget.js"
  script.async = true
  document.body.appendChild(script)
  loaded = true
}

document.addEventListener("DOMContentLoaded", () => {
  loadEchoThread()
})

export {}
