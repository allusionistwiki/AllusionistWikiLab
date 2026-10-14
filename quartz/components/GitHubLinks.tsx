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
    return (
      <div class="github-links">
        <h4>GitHub トラック（実験）</h4>
        <ul>
          <li>
            <a href="https://tally.so/r/EqzzbX">誤り・reject 報告（フォーム / 匿名可）</a>
          </li>
          <li>
            <a href={`${base}/blob/main/${enc}`}>ソース閲覧</a>
          </li>
          <li>
            <a href={`${base}/edit/main/${enc}`}>このページを編集（PR 作成）</a>
          </li>
          <li>
            <a href={`${base}/commits/main/${enc}`}>編集履歴</a>
          </li>
          <li>
            <a
              href={`${base}/issues/new?title=${encodeURIComponent(`[${title}] `)}&body=${issueBody}`}
            >
              誤り・reject 報告（Issue）
            </a>
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
.github-links ul {
  margin: 0;
  padding-left: 1.1rem;
  list-style: none;
}
.github-links li::before {
  content: "⎇ ";
  color: var(--secondary);
}
`

  return component
}) satisfies QuartzComponentConstructor
