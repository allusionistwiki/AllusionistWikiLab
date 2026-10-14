let loaded = false

function loadCusdis(): void {
  if (loaded) return
  const el = document.getElementById("cusdis_thread")
  if (!el) return
  const appId = el.getAttribute("data-app-id")
  // 未設定（プレースホルダ）なら読み込まない
  if (!appId || appId === "REPLACE_WITH_APP_ID") {
    const note = document.createElement("p")
    note.textContent =
      "（Cusdis app_id 未設定: quartz.config.ts の Component.Cusdis({ appId }) に登録済み app_id を設定してください）"
    note.style.color = "var(--secondary)"
    el.parentElement?.appendChild(note)
    return
  }
  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/cusdis/dist/cusdis.min.js"
  script.async = true
  document.body.appendChild(script)
  loaded = true
}

document.addEventListener("DOMContentLoaded", () => {
  loadCusdis()
})

// SPA 遷移（popstate 等）では Quartz が afterDOMLoaded を再実行するため追加処理は不要

export {}
