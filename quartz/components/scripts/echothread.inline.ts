let loaded = false

// EchoThread は翻訳同梱の英語専用ウィジェット → 表示層で日本語化を施す
const TEXT_MAP: Record<string, string> = {
  "Your name": "お名前",
  "Email (optional, never shown)": "メール（任意・表示されません）",
  "Write a comment...": "コメントを書く…",
  "Post": "投稿",
  "or sign in": "またはサインイン",
  "Like": "いいね",
  "Reply": "返信",
  "Best": "人気順",
  "Newest": "新着順",
  "Oldest": "古い順",
  "Most liked": "高評価順",
  "Most replied": "返信順",
  "Format:": "書式:",
  "Powered by EchoThread": "提供: EchoThread",
  "Be the first to comment": "最初のコメントを書こう",
  "Start the conversation — your thoughts will appear here.": "会話を始めよう — あなたの思考がここに表示されます。",
  "Optional. Sign in to react to comments, get notified of replies, and post under a name that's yours.": "任意。サインインするとリアクション・返信通知・自分の名前での投稿ができます。",
  "Sign in to add images": "画像を追加するにはサインイン",
}

const PLACEHOLDER_MAP: Record<string, string> = {
  "Your name": "お名前",
  "Email (optional, never shown)": "メール（任意・表示されません）",
  "Write a comment...": "コメントを書く…",
}

function translate(root: ParentNode): void {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const t = (node.textContent || "").trim()
    if (!t) continue
    const mapped = TEXT_MAP[t]
    if (mapped) {
      node.textContent = node.textContent!.replace(t, mapped)
      continue
    }
    // "N Comments" → "N件のコメント"
    const m = t.match(/^(\d+) Comments$/)
    if (m) node.textContent = `${m[1]}件のコメント`
  }
  const inputs = (root as ParentNode).querySelectorAll?.("input, textarea") ?? []
  inputs.forEach((el) => {
    const ph = (el as HTMLElement).getAttribute("placeholder")
    if (ph && PLACEHOLDER_MAP[ph]) {
      ;(el as HTMLElement).setAttribute("placeholder", PLACEHOLDER_MAP[ph])
    }
  })
}

function watchWidget(): void {
  const apply = () => {
    const w = document.querySelector(".et-widget")
    if (w) translate(w)
  }
  apply()
  const host = document.getElementById("echothread")
  if (host) {
    const obs = new MutationObserver(() => apply())
    obs.observe(host, { childList: true, subtree: true, characterData: true })
  }
}

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
  // ウィジェット描画は非同期 → 現れたら翻訳を適用し、以降は MutationObserver で追従
  const tryWatch = () => {
    if (document.querySelector(".et-widget")) {
      watchWidget()
    } else {
      setTimeout(tryWatch, 500)
    }
  }
  setTimeout(tryWatch, 300)
}

document.addEventListener("DOMContentLoaded", () => {
  loadEchoThread()
})

export {}
