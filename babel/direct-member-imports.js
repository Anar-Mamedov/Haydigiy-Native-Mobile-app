/**
 * Bir "barrel" paketinden yapılan isimli içe aktarımları, her üyenin kendi dosyasına
 * giden içe aktarımlara çevirir:
 *
 *   import { Search, X as Close } from '@tamagui/lucide-icons-2';
 *   // ->
 *   import { Search } from '@tamagui/lucide-icons-2/icons/Search';
 *   import { X as Close } from '@tamagui/lucide-icons-2/icons/X';
 *
 * Metro ağaç sallaması (tree shaking) yapmıyor; barrel'dan tek bir üye almak bile
 * barrel'ın yeniden dışa aktardığı her modülü uygulama açılışında çalıştırıyor.
 * `@tamagui/lucide-icons-2` ~1.760 ikonu yeniden dışa aktarıyor ve bu, ilk kareden
 * önce çalışan JS'in büyük kısmıydı (Android vitals: yavaş sıcak başlatma).
 *
 * Kaynak kod barrel'dan içe aktarmaya devam eder: paketin üye başına `exports`
 * girdilerinde `types` koşulu olmadığı için TypeScript tipleri yalnızca kök
 * girişten okuyabiliyor. Dönüşüm hem Metro'da hem Jest'te (babel-jest) uygulanır.
 *
 * Seçenekler: `{ source: string, target: string }`; `target` içindeki `[name]`
 * içe aktarılan üyenin adıyla değiştirilir.
 */
function directMemberImports({ types: t }, { source, target }) {
  if (typeof source !== 'string' || typeof target !== 'string' || !target.includes('[name]')) {
    throw new Error('[direct-member-imports] `source` ve `[name]` içeren `target` seçenekleri gerekli.');
  }

  return {
    name: 'direct-member-imports',
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;
        if (node.source.value !== source || node.importKind === 'type') return;

        const unsupported = node.specifiers.find((specifier) => !t.isImportSpecifier(specifier));
        if (unsupported) {
          throw path.buildCodeFrameError(
            `[direct-member-imports] '${source}' yalnızca isimli içe aktarılabilir; ` +
              'varsayılan veya `* as` içe aktarımı paketin tüm modüllerini yükler.',
          );
        }

        // Tip içe aktarımları çalışma zamanında silinir; kök girişte kalmaları
        // TypeScript tiplerini korur.
        const typeOnly = node.specifiers.filter((specifier) => specifier.importKind === 'type');
        const values = node.specifiers.filter((specifier) => specifier.importKind !== 'type');
        if (values.length === 0) return;

        const replacements = values.map((specifier) => {
          const name = t.isIdentifier(specifier.imported) ? specifier.imported.name : specifier.imported.value;
          return t.importDeclaration([specifier], t.stringLiteral(target.replace('[name]', name)));
        });
        if (typeOnly.length > 0) {
          replacements.unshift(t.importDeclaration(typeOnly, t.stringLiteral(source)));
        }
        const { scope } = path;
        path.replaceWithMultiple(replacements);
        // Bağlamalar (binding) hâlâ silinen bildirimi gösteriyor; sonraki eklentiler
        // (ör. React Compiler) içe aktarımın kaynağını oradan okuyor.
        scope.crawl();
      },
    },
  };
}

module.exports = directMemberImports;
