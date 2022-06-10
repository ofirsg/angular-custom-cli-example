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

    const className = options.name.endsWith('Component') ? options.name : `${options.name}Component`;

    const pathParts: string[] = options.path.split('/');
    const newFolderPath: string = pathParts.slice(0, pathParts.length - 1).join('/');

    function updateComponentFile(tree: Tree): void {
      const compFilePath = options.path.replace('html', 'ts');
      const compContent: string = tree.get(compFilePath)?.content.toString() ?? '';

      // can be done better with ast helpers such ts-morph
      const start = compContent.indexOf('{', compContent.indexOf('class') + 1);
      const newCompContent = `${compContent.substring(0, start + 1)}
   public pageContext = 'pageContext'; // TODO: fix
  ${compContent.substring(start + 1)}`;

      tree.overwrite(compFilePath, newCompContent);
    }

    function updateHtmlFile(tree: Tree): void {
      const htmlContent: string = tree.get(options.path)?.content.toString() ?? '';
      const componentSelector = `app-pl-${strings.dasherize(options.name)}`;

      const newHtmlContent = `
<${componentSelector} [pageContext]="pageContext">
  ${htmlContent}
</${componentSelector}>
`;
      tree.overwrite(options.path, newHtmlContent);
    }

    function updateModuleFile(tree: Tree): void {
      const pathParts = options.path.split('/');
      pathParts.pop();
      let modulePath: string | null = null;
      const importPathParts = [strings.dasherize(options.name)];

      while (pathParts.length > 0 && !modulePath) {
        const subFiles = tree.getDir(pathParts.join('/')).subfiles;
        const moduleFilePath = subFiles.find(f => f.includes('.module'));

        if (moduleFilePath) {
          modulePath = `${pathParts.join('/')}/${moduleFilePath}`;
        } else {
          importPathParts.unshift(pathParts.pop() as string);
        }
      }

      if (modulePath) {
        const moduleFileContent = tree.get(modulePath)?.content.toString() ?? '';
        const moduleStart = moduleFileContent.indexOf('[', moduleFileContent.indexOf('declarations') + 1);
        const classNameClassified = strings.classify(className);
        const newModuleContent = `
import { ${classNameClassified} } from './${importPathParts.join('/')}/${strings.dasherize(options.name)}.component';
${moduleFileContent.substring(0, moduleStart + 1)}
   ${classNameClassified},
  ${moduleFileContent.substring(moduleStart + 1)}`;
        tree.overwrite(modulePath, newModuleContent);
      }
    }

    const templateSource = apply(
      url('./files'), [
        applyTemplates({
          classify: strings.classify,
          dasherize: strings.dasherize,
          name: options.name,
          className
        }),
        move(normalize(`/${newFolderPath}/${strings.dasherize(options.name)}`))
      ]
    );

    return chain([
      mergeWith(templateSource, MergeStrategy.Overwrite),
      (tree: Tree, _context: SchematicContext) => {
        updateHtmlFile(tree);
        updateComponentFile(tree);
        updateModuleFile(tree);

        return tree;
      },
    ]);
  }
}
