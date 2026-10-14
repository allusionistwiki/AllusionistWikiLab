// @ts-ignore
import script from "./scripts/cusdis.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

type Options = {
  appId: string
  host?: string
  lang?: string
  dark?: string
}

export default ((opts: Options) => {
  const Cusdis: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    const disableComment: boolean =
      typeof fileData.frontmatter?.comments !== "undefined" &&
      (!fileData.frontmatter?.comments || fileData.frontmatter?.comments === "false")
    if (disableComment) {
      return <></>
    }
    const threadId = fileData.slug ?? "home"
    const title = (fileData.frontmatter?.title as string) ?? threadId
    return (
      <div class={classNames(displayClass, "cusdis")}>
        <h3>コメント（実験: Cusdis）</h3>
        <div
          id="cusdis_thread"
          data-app-id={opts.appId}
          data-host={opts.host ?? "https://cusdis.com"}
          data-lang={opts.lang ?? "ja"}
          data-theme={opts.dark ?? "auto"}
          data-thread-id={threadId}
          data-title={title}
        ></div>
      </div>
    )
  }
  Cusdis.afterDOMLoaded = script
  return Cusdis
}) satisfies QuartzComponentConstructor
