const path = require('path');
const { transformFileSync, transformSync } = require('@babel/core');
const directMemberImports = require('./direct-member-imports');

const OPTIONS = { source: '@tamagui/lucide-icons-2', target: '@tamagui/lucide-icons-2/icons/[name]' };

function transform(code, { typescript = false } = {}) {
  return transformSync(code, {
    babelrc: false,
    configFile: false,
    filename: typescript ? 'icons.tsx' : 'icons.js',
    generatorOpts: { jsescOption: { quotes: 'single' } },
    plugins: [
      ...(typescript ? [['@babel/plugin-syntax-typescript', { isTSX: true }]] : []),
      [directMemberImports, OPTIONS],
    ],
  }).code;
}

describe('direct-member-imports', () => {
  it('splits named imports into one import per member file, keeping aliases', () => {
    const output = transform("import { Search, X as Close } from '@tamagui/lucide-icons-2';");

    expect(output).toBe(
      [
        "import { Search } from '@tamagui/lucide-icons-2/icons/Search';",
        "import { X as Close } from '@tamagui/lucide-icons-2/icons/X';",
      ].join('\n'),
    );
  });

  it('leaves other packages and member paths alone', () => {
    const code = [
      "import { Search } from '@tamagui/lucide-icons-2/icons/Search';",
      "import { YStack } from 'tamagui';",
    ].join('\n');

    expect(transform(code)).toBe(code);
  });

  it('keeps type-only imports on the package root', () => {
    const output = transform(
      [
        "import type { IconProps } from '@tamagui/lucide-icons-2';",
        "import { type IconProps as Props, Search } from '@tamagui/lucide-icons-2';",
      ].join('\n'),
      { typescript: true },
    );

    expect(output).toBe(
      [
        "import type { IconProps } from '@tamagui/lucide-icons-2';",
        "import { type IconProps as Props } from '@tamagui/lucide-icons-2';",
        "import { Search } from '@tamagui/lucide-icons-2/icons/Search';",
      ].join('\n'),
    );
  });

  it.each([
    ["import * as Icons from '@tamagui/lucide-icons-2';"],
    ["import Icons from '@tamagui/lucide-icons-2';"],
  ])('rejects imports that would load every member: %s', (code) => {
    expect(() => transform(code)).toThrow(/yalnızca isimli içe aktarılabilir/);
  });

  it('requires a target with a [name] placeholder', () => {
    expect(() =>
      transformSync('', {
        babelrc: false,
        configFile: false,
        plugins: [[directMemberImports, { source: 'x', target: 'x/icons' }]],
      }),
    ).toThrow(/\[name\]/);
  });

  it('is applied by the project Babel config so the app never imports the icon barrel', () => {
    const projectRoot = path.dirname(require.resolve('../package.json'));
    const { code } = transformFileSync(require.resolve('../src/components/ui/icons.tsx'), {
      caller: { name: 'metro', platform: 'android', supportsStaticESM: true },
      cwd: projectRoot,
    });

    expect(code).not.toMatch(/['"]@tamagui\/lucide-icons-2['"]/);
    expect(code).toMatch(/['"]@tamagui\/lucide-icons-2\/icons\/Search['"]/);
  });
});
