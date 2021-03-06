import nodeSass, { SyncOptions } from "node-sass";
import { StyleNode, CompilerResult } from "../core/transform";
import { mergeDeep } from "../utils/replace.lodash";
import { nodeToResult } from "../utils/format";
import autoImport from "../core/auto.import";
import { red } from "../core/plugin.message";

export default async function(
    node: StyleNode,
    sassOpts: SyncOptions
): Promise<CompilerResult> {
    /**
     * 编译结果变量
     */
    const finalResult = nodeToResult(node);

    const installation = autoImport("node-sass");

    if (installation.installed) {
        const userSass = installation.module as typeof nodeSass;
        const defaultOpts: SyncOptions = {
            sourceMap: node.id + ".map",
            sourceMapContents: true,
            outFile: node.id,
            sourceMapEmbed: false,
            omitSourceMapUrl: false,
            file: node.id,
            includePaths: node.options.includePaths,
            outputStyle: "expanded",
            sourceMapRoot: node.id
        };

        try {
            const sassResult: nodeSass.Result = userSass.renderSync(
                mergeDeep(defaultOpts, sassOpts)
            );
            finalResult.content.code = sassResult.css.toString("UTF-8");
            finalResult.content.sourceMap = JSON.parse(
                sassResult.map.toString("UTF-8")
            );
            finalResult.content.compileToCss = true;
        } catch (error) {
            console.log("\n" + red(error));
            finalResult.status = "ERROR";
            finalResult.message = error;
        }
    }

    return finalResult;
}
