/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Play Console'daki `ReactScrollView.onTouchEvent` IllegalArgumentException
 * ("pointerIndex out of range") kilitlenmesi için react-native-gesture-handler'a
 * `patches/` altından uygulanan yamanın koruması.
 *
 * Ürün detayındaki aşağı çekip kapatma kaydırıcısı ScrollView'u `Gesture.Native()` ile
 * sarıyor. Navigasyon geçişinde ekrandan çıkan görünüm `parent`'ını korurken üst
 * görünümün çocuk listesinden düşüyor; gesture-handler 2.x onu hâlâ bağlı sayıp
 * dokunmaları geçersiz pointer id'leriyle ScrollView'a iletiyordu. Düzeltme upstream'de
 * 3.0.0'a girdi (software-mansion/react-native-gesture-handler#4177); 2.x'e geri
 * taşındı. gesture-handler güncellenince yama yeni sürüme taşınmazsa kilitlenme
 * sessizce geri döner.
 */

// Projede @types/node yok; testin kullandığı Node API'leri kadar tip tanımı yeterli.
declare const __dirname: string;
const fs: {
  existsSync(filePath: string): boolean;
  readFileSync(filePath: string, encoding: 'utf8'): string;
} = require('fs');
const path: { join(...segments: string[]): string } = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const GESTURE_HANDLER_ROOT = path.join(PROJECT_ROOT, 'node_modules', 'react-native-gesture-handler');
const ORCHESTRATOR = path.join(
  GESTURE_HANDLER_ROOT,
  'android/src/main/java/com/swmansion/gesturehandler/core/GestureHandlerOrchestrator.kt',
);

describe('react-native-gesture-handler disappearing view patch', () => {
  it('is named after the installed react-native-gesture-handler version', () => {
    const { version } = require(path.join(GESTURE_HANDLER_ROOT, 'package.json'));

    expect(
      fs.existsSync(path.join(PROJECT_ROOT, 'patches', `react-native-gesture-handler+${version}.patch`)),
    ).toBe(true);
  });

  it('treats views removed from their parent during a transition as detached', () => {
    const orchestrator = fs.readFileSync(ORCHESTRATOR, 'utf8');

    expect(orchestrator).toContain('parent.indexOfChild(current) < 0 -> return false');
  });
});
