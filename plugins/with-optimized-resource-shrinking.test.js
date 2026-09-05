const {
  enableOptimizedResourceShrinking,
  PROPERTY_KEY,
} = require('./with-optimized-resource-shrinking');

/**
 * Play Console "R8 optimizasyonu" önerisindeki "Optimize edilmiş, kullanılmayan
 * kaynakları kaldırma etkin değil" maddesi. `shrinkResources` açık olsa bile AGP
 * 8.12'de bu bayrak kapalı geldiği için madde kalıyordu.
 */
describe('enableOptimizedResourceShrinking', () => {
  const templateProperties = [
    { type: 'comment', value: 'Project-wide Gradle settings.' },
    { type: 'property', key: 'android.useAndroidX', value: 'true' },
    { type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
  ];

  it('appends the optimized resource shrinking flag when it is missing', () => {
    const result = enableOptimizedResourceShrinking(templateProperties);

    expect(result).toContainEqual({ type: 'property', key: PROPERTY_KEY, value: 'true' });
  });

  it('uses the exact gradle property name Play Console checks', () => {
    expect(PROPERTY_KEY).toBe('android.r8.optimizedResourceShrinking');
  });

  it('keeps every unrelated property and comment untouched', () => {
    const result = enableOptimizedResourceShrinking(templateProperties);

    templateProperties.forEach((item) => expect(result).toContainEqual(item));
  });

  it('does not duplicate the property across repeated prebuilds', () => {
    const once = enableOptimizedResourceShrinking(templateProperties);
    const twice = enableOptimizedResourceShrinking(once);

    expect(twice.filter((item) => item.type === 'property' && item.key === PROPERTY_KEY)).toHaveLength(1);
  });

  // Bir sürüm bayrağı `false` bırakırsa Play uyarısı sessizce geri döner.
  it('overwrites an existing false value instead of leaving it disabled', () => {
    const disabled = [...templateProperties, { type: 'property', key: PROPERTY_KEY, value: 'false' }];

    const result = enableOptimizedResourceShrinking(disabled);

    expect(result).toContainEqual({ type: 'property', key: PROPERTY_KEY, value: 'true' });
    expect(result).not.toContainEqual({ type: 'property', key: PROPERTY_KEY, value: 'false' });
  });

  it('does not mutate the input list', () => {
    const input = [...templateProperties];

    enableOptimizedResourceShrinking(input);

    expect(input).toEqual(templateProperties);
  });
});
