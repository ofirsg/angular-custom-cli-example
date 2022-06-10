"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageLayoutComponentGenerator = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
function pageLayoutComponentGenerator(options) {
    return (tree) => {
        var _a;
        if (!options.path || !options.name) {
            console.log('---------------------------------------------------');
            console.log('Missing options!');
            console.log('---------------------------------------------------');
            return;
        }
        // const bla = tree.exists(options.path) ? tree.get(options.path) : null;
        const bla = tree.exists(options.path);
        console.log('################################################################');
        console.debug((_a = tree.getDir('projects')) === null || _a === void 0 ? void 0 : _a.subdirs);
        // console.log(bla?.content?.toString());
        console.log(bla);
        console.log('################################################################');
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.applyTemplates)({
                classify: core_1.strings.classify,
                dasherize: core_1.strings.dasherize,
                name: options.name
            }),
            (0, schematics_1.move)((0, core_1.normalize)(`/${options.path}/page-layout/${core_1.strings.dasherize(options.name)}`))
        ]);
        // TODO: add the new component by path
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.Overwrite)
        ]);
    };
}
exports.pageLayoutComponentGenerator = pageLayoutComponentGenerator;
//# sourceMappingURL=index.js.map