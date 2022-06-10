import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  url
} from "@angular-devkit/schematics";
import { normalize, strings } from "@angular-devkit/core";
import { PageLayoutComponentSchema } from "./page-layout.interfaces";

export function pageLayoutComponentGenerator(options: PageLayoutComponentSchema): Rule {
  return () => {
    if(!options.path || !options.name){
      console.log('---------------------------------------------------');
      console.log('Missing options!');
      console.log('---------------------------------------------------');
      return;
    }

    const templateSource = apply(
      url('./templates'), [
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
      externalSchematic(
        '@schematics/angular', 'component',
        { ...options, path: `${options.path}/page-layout` }
      ),
      mergeWith(templateSource, MergeStrategy.Overwrite)
    ]);
  }
}
