let loaded = false

// EchoThread は翻訳同梱の英語専用ウィジェット → 表示層で日本語化を施す
const TEXT_MAP: Record<string, string> = {
  "Your name": "お名前",
  "Email (optional, never shown)": "メール（任意・表示されません）",
  "Write a comment...": "コメント内容",
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
  "Powered by": "提供:",
  "Powered by EchoThread": "提供: EchoThread",
  "Be the first to comment": "最初のコメントを書こう",
  "Start the conversation — your thoughts will appear here.": "会話を始めよう — あなたの思考がここに表示されます。",
  "Optional. Sign in to react to comments, get notified of replies, and post under a name that's yours.": "任意。サインインするとリアクション・返信通知・自分の名前での投稿ができます。",
  "Sign in to add images": "画像を追加するにはサインイン",
}

const PLACEHOLDER_MAP: Record<string, string> = {
  "Your name": "お名前",
  "Email (optional, never shown)": "メール（任意・表示されません）",
  "Write a comment...": "コメント内容",
  "Write a comment…": "コメント内容",
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
    if (m) {
      node.textContent = `${m[1]}件のコメント`
      continue
    }
    // 相対時刻 "1h ago" / "5m ago" / "2d ago" → 日本語
    const rel = t.match(/^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks|mo|month|months|y|year|years)\s+ago$/)
    if (rel) {
      const unitJa: Record<string, string> = {
        s: "秒", sec: "秒", secs: "秒", second: "秒", seconds: "秒",
        m: "分", min: "分", mins: "分", minute: "分", minutes: "分",
        h: "時間", hr: "時間", hrs: "時間", hour: "時間", hours: "時間",
        d: "日", day: "日", days: "日",
        w: "週", week: "週", weeks: "週",
        mo: "ヶ月", month: "ヶ月", months: "ヶ月",
        y: "年", year: "年", years: "年",
      }
      const u = unitJa[rel[2]] ?? rel[2]
      node.textContent = `${rel[1]}${u}前`
    }
  }
  const inputs = (root as ParentNode).querySelectorAll?.("input, textarea") ?? []
  inputs.forEach((el) => {
    const ph = (el as HTMLElement).getAttribute("placeholder")
    if (ph && PLACEHOLDER_MAP[ph]) {
      ;(el as HTMLElement).setAttribute("placeholder", PLACEHOLDER_MAP[ph])
    }
  })
  // contenteditable 本体は data-placeholder 形式
  const ce = (root as ParentNode).querySelectorAll?.("[data-placeholder]") ?? []
  ce.forEach((el) => {
    const ph = (el as HTMLElement).getAttribute("data-placeholder")
    if (ph && PLACEHOLDER_MAP[ph]) {
      ;(el as HTMLElement).setAttribute("data-placeholder", PLACEHOLDER_MAP[ph])
    }
  })
}

function relocate(): void {
  const container = document.querySelector(".echothread")
  const host = document.getElementById("echothread")
  const h3 = container?.querySelector("h3")
  if (!container || !host || !h3) return
  // 提供: EchoThread を見出し行の右端へ移動
  const footer = host.querySelector(".et-footer")
  if (footer && footer.parentElement !== h3) {
    h3.appendChild(footer)
  }
}

function watchWidget(): void {
  const apply = () => {
    const w = document.querySelector(".et-widget")
    if (w) {
      translate(w)
      relocate()
    }
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
// 初回アクセス時は postscript の実行が DOMContentLoaded より後になることがある
// （その場合 listener は二度と発火せずウィジェットが永遠に出ない）→ 既に ready なら即実行
if (document.readyState !== "loading") {
  loadEchoThread()
}

export {}
