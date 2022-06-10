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
            (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.Overwrite),
            updateHtmlFile,
        ]);
    };
    function updateHtmlFile() {
        return (tree, _context) => {
            var _a, _b, _c, _d, _e, _f;
            const htmlContent = (_b = (_a = tree.get(options.path)) === null || _a === void 0 ? void 0 : _a.content.toString()) !== null && _b !== void 0 ? _b : '';
            const componentSelector = `app-pl-${core_1.strings.dasherize(options.name)}`;
            const newHtmlContent = `
<${componentSelector} [pageContext]="pageContext">
  ${htmlContent}
</${componentSelector}>
`;
            const compFilePath = options.path.replace('html', 'ts');
            const compContent = (_d = (_c = tree.get(compFilePath)) === null || _c === void 0 ? void 0 : _c.content.toString()) !== null && _d !== void 0 ? _d : '';
            // can be done better with ast helpers such ts-morph
            const start = compContent.indexOf('{', compContent.indexOf('class') + 1);
            const newCompContent = `${compContent.substring(0, start + 1)}
   public pageContext = 'pageContext'; // TODO: fix
  ${compContent.substring(start + 1)}`;
            const pathParts = compFilePath.split('/');
            pathParts.pop();
            let modulePath = null;
            while (pathParts.length > 0 && !modulePath) {
                const subFiles = tree.getDir(pathParts.join('/')).subfiles;
                const moduleFilePath = subFiles.find(f => f.includes('.module'));
                if (moduleFilePath) {
                    modulePath = moduleFilePath;
                    console.log('########################################');
                    console.log(moduleFilePath);
                    console.log('########################################');
                }
            }
            if (modulePath) {
                const moduleFileContent = (_f = (_e = tree.get(modulePath)) === null || _e === void 0 ? void 0 : _e.content.toString()) !== null && _f !== void 0 ? _f : '';
                const moduleStart = moduleFileContent.indexOf('[', compContent.indexOf('declarations') + 1);
                const className = options.name.endsWith('Component') ? options.name : `${options.name}Component`;
                const newModuleContent = `${moduleFileContent.substring(0, moduleStart + 1)}
   ${className},
  ${moduleFileContent.substring(start + 1)}`;
                tree.overwrite(modulePath, newModuleContent);
            }
            tree.overwrite(compFilePath, newCompContent);
            tree.overwrite(options.path, newHtmlContent);
            return tree;
        };
    }
}
exports.pageLayoutComponentGenerator = pageLayoutComponentGenerator;
//# sourceMappingURL=index.js.map