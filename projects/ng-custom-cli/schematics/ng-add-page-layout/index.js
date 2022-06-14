"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageLayoutComponentGenerator = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
function pageLayoutComponentGenerator(options) {
    return (tree) => {
        if (!options.name) {
            console.log('---------------------------------------------------');
            console.log('Missing name!');
            console.log('---------------------------------------------------');
            return;
        }
        if (!options.path || !tree.exists(options.path)) {
            console.log('---------------------------------------------------');
            console.log('Invalid path!');
            console.log('---------------------------------------------------');
            return;
        }
        const className = options.name.endsWith('Component') ? options.name : `${options.name}Component`;
        const pathParts = options.path.split('/');
        const newFolderPath = pathParts.slice(0, pathParts.length - 1).join('/');
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.applyTemplates)({
                classify: core_1.strings.classify,
                dasherize: core_1.strings.dasherize,
                name: options.name,
                className
            }),
            (0, schematics_1.move)((0, core_1.normalize)(`/${newFolderPath}/${core_1.strings.dasherize(options.name)}`))
        ]);
        return (0, schematics_1.chain)([
            // externalSchematic('@schematics/angular', 'component', options),
            (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.Overwrite),
            (tree, _context) => {
                updateHtmlFile(tree);
                updateComponentFile(tree);
                updateModuleFile(tree);
                return tree;
            },
        ]);
        function updateComponentFile(tree) {
            var _a, _b;
            const compFilePath = options.path.replace('html', 'ts');
            const compContent = (_b = (_a = tree.get(compFilePath)) === null || _a === void 0 ? void 0 : _a.content.toString()) !== null && _b !== void 0 ? _b : '';
            // can be done better with ast helpers such ts-morph
            const start = compContent.indexOf('{', compContent.indexOf('class') + 1);
            const newCompContent = `${compContent.substring(0, start + 1)}
   public pageContext = 'pageContext'; // TODO: fix
  ${compContent.substring(start + 1)}`;
            tree.overwrite(compFilePath, newCompContent);
        }
        function updateHtmlFile(tree) {
            var _a, _b;
            const htmlContent = (_b = (_a = tree.get(options.path)) === null || _a === void 0 ? void 0 : _a.content.toString()) !== null && _b !== void 0 ? _b : '';
            const componentSelector = `app-pl-${core_1.strings.dasherize(options.name)}`;
            const newHtmlContent = `
<${componentSelector} [pageContext]="pageContext">
  ${htmlContent}
</${componentSelector}>
`;
            tree.overwrite(options.path, newHtmlContent);
        }
        function updateModuleFile(tree) {
            var _a, _b;
            const pathParts = options.path.split('/');
            pathParts.pop();
            let modulePath = null;
            const importPathParts = [core_1.strings.dasherize(options.name)];
            while (pathParts.length > 0 && !modulePath) {
                const subFiles = tree.getDir(pathParts.join('/')).subfiles;
                const moduleFilePath = subFiles.find(f => f.includes('.module'));
                if (moduleFilePath) {
                    modulePath = `${pathParts.join('/')}/${moduleFilePath}`;
                }
                else {
                    importPathParts.unshift(pathParts.pop());
                }
            }
            if (modulePath) {
                const moduleFileContent = (_b = (_a = tree.get(modulePath)) === null || _a === void 0 ? void 0 : _a.content.toString()) !== null && _b !== void 0 ? _b : '';
                const moduleStart = moduleFileContent.indexOf('[', moduleFileContent.indexOf('declarations') + 1);
                const classNameClassified = core_1.strings.classify(className);
                const newModuleContent = `
import { ${classNameClassified} } from './${importPathParts.join('/')}/${core_1.strings.dasherize(options.name)}.component';
${moduleFileContent.substring(0, moduleStart + 1)}
   ${classNameClassified},
  ${moduleFileContent.substring(moduleStart + 1)}`;
                tree.overwrite(modulePath, newModuleContent);
            }
        }
    };
}
exports.pageLayoutComponentGenerator = pageLayoutComponentGenerator;
//# sourceMappingURL=index.js.map