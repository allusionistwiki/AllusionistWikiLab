// EchoThread 埋め込み（Cusdis 後継・ホスティング型・ゲスト(無アカウント)投稿対応）
// @ts-ignore
import script from "./scripts/echothread.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

type Options = {
  apiKey: string
  lang?: string
}

export default ((opts: Options) => {
  const EchoThread: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    const disableComment: boolean =
      typeof fileData.frontmatter?.comments !== "undefined" &&
      (!fileData.frontmatter?.comments || fileData.frontmatter?.comments === "false")
    if (disableComment) {
      return <></>
    }
    const threadId = fileData.slug ?? "home"
    const title = (fileData.frontmatter?.title as string) ?? threadId
    return (
      <div class={classNames(displayClass, "echothread")}>
        <h3>コメント（実験: EchoThread / 匿名ゲスト投稿可）</h3>
        <div
          id="echothread"
          data-api-key={opts.apiKey}
          data-title={title}
        ></div>
      </div>
    )
  }
  EchoThread.afterDOMLoaded = script
  return EchoThread
}) satisfies QuartzComponentConstructor
