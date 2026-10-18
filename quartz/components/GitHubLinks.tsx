import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// GitHub トラック（Lab 実験用）: 編集→PR・履歴・Issue 報告への導線。
// 本家 Quartz の Actions 相当（この fork には Actions が無い）を最小実装。
const REPO = "allusionistwiki/AllusionistWikiLab"
const SITE = "https://allusionistwiki.github.io/AllusionistWikiLab"

export default (() => {
  const component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    if (fileData.slug === "index") return null
    const fp = fileData.filePath // e.g. content/claims/sample-claim.md
    const enc = fp.split("/").map(encodeURIComponent).join("/")
    const title = (fileData.frontmatter?.title as string) || fileData.slug
    const issueBody = encodeURIComponent(
      `対象ページ: ${title}\nURL: ${SITE}/${fileData.slug}\n\n`,
    )
    const base = `https://github.com/${REPO}`
    const pageUrl = `${SITE}/${fileData.slug}`
    // 主張 ID 自動入力: claims/ 配下のページは slug 末尾が主張 ID
    const claimId = fileData.slug.startsWith("claims/")
      ? fileData.slug.slice("claims/".length)
      : ""
    const claimQ = claimId ? `&claim=${encodeURIComponent(claimId)}` : ""
    return (
      <div class="github-links">
        <h4>報告・依頼 — 誤り / reject / 編集依頼 / 情報提供</h4>
        <ul>
          <li>
            <a
              href={`https://tally.so/r/EqzzbX?url=${encodeURIComponent(pageUrl)}${claimQ}`}
            >
              匿名フォーム（ログイン不要・URL・主張 ID 自動入力）
            </a>
          </li>
          <li class="gh">
            <a
              href={`${base}/issues/new?template=reject.yml&title=${encodeURIComponent(`[${title}] `)}&page=${encodeURIComponent(pageUrl)}${claimQ}`}
            >
              GitHub Issue（要ログイン・同じ 4 種別）
            </a>
          </li>
        </ul>
        <h4>編集・ソース（GitHub）</h4>
        <ul>
          <li class="gh">
            <a href={`${base}/edit/main/${enc}`}>このページを編集（PR 作成）</a>
          </li>
          <li class="gh">
            <a href={`${base}/blob/main/${enc}`}>ソース閲覧</a>
          </li>
          <li class="gh">
            <a href={`${base}/commits/main/${enc}`}>編集履歴</a>
          </li>
        </ul>
      </div>
    )
  }

  component.css = `
.github-links {
  margin-top: 1rem;
  font-size: 0.9rem;
}
.github-links h4 {
  margin: 0 0 0.4rem 0;
  font-weight: 600;
}
.github-links h4 + h4,
.github-links ul + h4 {
  margin-top: 0.8rem;
}
.github-links ul {
  margin: 0;
  padding-left: 1.2rem;
  list-style: none;
}
.github-links li::before {
  content: "✉ ";
  color: var(--secondary);
}
.github-links li.gh::before {
  content: "⎇ ";
  color: var(--secondary);
}
`

  return component
}) satisfies QuartzComponentConstructor
