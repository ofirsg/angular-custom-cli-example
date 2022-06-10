import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule, Tree,
  url
} from "@angular-devkit/schematics";
import { normalize, strings } from "@angular-devkit/core";
import { PageLayoutComponentSchema } from "./page-layout.interfaces";

export function pageLayoutComponentGenerator(options: PageLayoutComponentSchema): Rule {
  return (tree: Tree) => {
    if(!options.path || !options.name){
      console.log('---------------------------------------------------');
      console.log('Missing options!');
      console.log('---------------------------------------------------');
      return;
    }

    // const bla = tree.exists(options.path) ? tree.get(options.path) : null;
    const bla = tree.exists(options.path);
    console.log('################################################################');
    console.debug(tree.getDir('projects')?.subdirs);
    // console.log(bla?.content?.toString());
    console.log(bla)
    console.log('################################################################');

    const templateSource = apply(
      url('./files'), [
        applyTemplates({
          classify: strings.classify,
          dasherize: strings.dasherize,
          name: options.name
        }),
        move(normalize(`/${options.path}/page-layout/${strings.dasherize(options.name)}`))
      ]
    );

    // TODO: add the new component by path

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);
  }
}
