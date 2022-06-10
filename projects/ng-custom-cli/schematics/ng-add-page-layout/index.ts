import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule, SchematicContext, Tree,
  url
} from "@angular-devkit/schematics";
import { normalize, strings } from "@angular-devkit/core";
import { PageLayoutComponentSchema } from "./page-layout.interfaces";

export function pageLayoutComponentGenerator(options: PageLayoutComponentSchema): Rule {
  return (tree: Tree) => {
    if(!options.name){
      console.log('---------------------------------------------------');
      console.log('Missing name!');
      console.log('---------------------------------------------------');
      return;
    }

    if(!options.path || !tree.exists(options.path)){
      console.log('---------------------------------------------------');
      console.log('Invalid path!');
      console.log('---------------------------------------------------');
      return;
    }

    const pathParts: string[] = options.path.split('/');
    const newFolderPath: string = pathParts.slice(0, pathParts.length - 1).join('/');

    const templateSource = apply(
      url('./files'), [
        applyTemplates({
          classify: strings.classify,
          dasherize: strings.dasherize,
          name: options.name
        }),
        move(normalize(`/${newFolderPath}/${strings.dasherize(options.name)}`))
      ]
    );

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite),
      updateHtmlFile,
    ]);
  }

  function updateHtmlFile(): Rule {
    return (tree: Tree, _context: SchematicContext) => {
      const htmlContent: string = tree.get(options.path)?.content.toString() ?? '';
      const componentSelector = `app-pl-${strings.dasherize(options.name)}`;

      const newHtmlContent = `
<${componentSelector} [pageContext]="pageContext">
  ${htmlContent}
</${componentSelector}>
`;

      const compFilePath = options.path.replace('html', 'ts');
      const compContent: string = tree.get(compFilePath)?.content.toString() ?? '';

      // can be done better with ast helpers such ts-morph
      const start = compContent.indexOf('{', compContent.indexOf('class'));
      const newCompContent = `${compContent.substring(0, start + 1)}
   public pageContext = 'pageContext'; // TODO: fix
  ${compContent.substring(start + 1)}`;

      tree.overwrite(compFilePath, newCompContent);
      tree.overwrite(options.path, newHtmlContent);

      return tree;
    };
  }
}
