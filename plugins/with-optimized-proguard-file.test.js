const { useOptimizedProguardFile } = require('./with-optimized-proguard-file');

/**
 * Play Console "R8 optimizasyonu" önerisindeki "Optimizasyon etkin değil" maddesi,
 * React Native şablonunun `-dontoptimize` içeren varsayılan ProGuard dosyasını
 * seçmesinden kaynaklanıyordu. Bu dönüşüm bozulursa uyarı sessizce geri döner.
 */
describe('useOptimizedProguardFile', () => {
  const templateLine =
    '            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"';

  it('switches the release build to the optimizing default ProGuard file', () => {
    const result = useOptimizedProguardFile(templateLine);

    expect(result).toContain('getDefaultProguardFile("proguard-android-optimize.txt")');
    expect(result).not.toContain('getDefaultProguardFile("proguard-android.txt")');
  });

  it('keeps the project ProGuard file in the list', () => {
    expect(useOptimizedProguardFile(templateLine)).toContain('"proguard-rules.pro"');
  });

  it('is idempotent so repeated prebuilds do not corrupt the file', () => {
    const once = useOptimizedProguardFile(templateLine);

    expect(useOptimizedProguardFile(once)).toBe(once);
  });

  // Sessiz başarısızlık, Play uyarısının fark edilmeden geri dönmesi demek olurdu.
  it('throws instead of silently doing nothing when the template line is missing', () => {
    expect(() => useOptimizedProguardFile('android { buildTypes { release {} } }')).toThrow(
      /proguard-android\.txt/,
    );
  });
});
