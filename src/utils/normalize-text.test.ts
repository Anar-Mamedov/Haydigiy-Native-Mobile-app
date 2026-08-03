import {
  normalizeUnicodeText,
  toAddressText,
  toPersonName,
  toPlainText,
} from '@/utils/normalize-text';

describe('normalize-text utils', () => {
  describe('normalizeUnicodeText', () => {
    it('folds mathematical monospace letters and recomposes split accents', () => {
      // Sahadan gelen gerçek vaka: HG3007261087304 numaralı siparişteki ad/soyad.
      expect(normalizeUnicodeText('𝙶𝚞̈𝚕')).toBe('Gül');
      expect(normalizeUnicodeText('𝙳𝚘̈𝚗𝚖𝚎𝚣')).toBe('Dönmez');
    });

    it('folds the other mathematical alphabet families', () => {
      expect(normalizeUnicodeText('𝐆𝐮𝐥')).toBe('Gul'); // kalın
      expect(normalizeUnicodeText('𝐺𝑢𝑙')).toBe('Gul'); // italik
      expect(normalizeUnicodeText('𝓖𝓾𝓵')).toBe('Gul'); // el yazısı
      expect(normalizeUnicodeText('𝔊𝔲𝔩')).toBe('Gul'); // fraktur
      expect(normalizeUnicodeText('𝔾𝕦𝕝')).toBe('Gul'); // çift çizgili
    });

    it('folds families NFKC does not handle on its own', () => {
      expect(normalizeUnicodeText('ɢᴜʟ')).toBe('gul'); // küçük kapiteller
      expect(normalizeUnicodeText('🅖🅤🅛')).toBe('GUL'); // negatif daire
      expect(normalizeUnicodeText('🅶🅄🅻')).toBe('GUL'); // negatif kare
    });

    it('folds fullwidth and circled letters', () => {
      expect(normalizeUnicodeText('Ｇüｌ')).toBe('Gül');
      expect(normalizeUnicodeText('ⒼⓊⓁ')).toBe('GUL');
    });

    it('strips zero-width and bidi control characters', () => {
      expect(normalizeUnicodeText('Ali​Veli')).toBe('AliVeli');
      expect(normalizeUnicodeText('Ali‮Veli')).toBe('AliVeli');
      expect(normalizeUnicodeText('﻿Gül')).toBe('Gül');
    });

    it('converts exotic whitespace to a plain space', () => {
      expect(normalizeUnicodeText('Ali Veli')).toBe('Ali Veli');
      expect(normalizeUnicodeText('Ali Veli')).toBe('Ali Veli');
    });

    it('leaves ordinary Turkish text untouched', () => {
      expect(normalizeUnicodeText('Gül')).toBe('Gül');
      expect(normalizeUnicodeText('İSMAİL ÇAĞLAYAN')).toBe('İSMAİL ÇAĞLAYAN');
      expect(normalizeUnicodeText('ığüşöç İĞÜŞÖÇ')).toBe('ığüşöç İĞÜŞÖÇ');
    });

    it('returns an empty string for empty input', () => {
      expect(normalizeUnicodeText('')).toBe('');
    });
  });

  describe('toPersonName', () => {
    it('normalizes styled fonts instead of deleting them', () => {
      expect(toPersonName('𝙶𝚞̈𝚕')).toBe('Gül');
      expect(toPersonName('𝙳𝚘̈𝚗𝚖𝚎𝚣')).toBe('Dönmez');
    });

    it('keeps hyphens and apostrophes used in real names', () => {
      expect(toPersonName('Ayşe-Nur')).toBe('Ayşe-Nur');
      expect(toPersonName('O’Brien')).toBe("O'Brien");
    });

    it('drops digits, emoji and non-Latin scripts', () => {
      expect(toPersonName('Gül123')).toBe('Gül');
      expect(toPersonName('Gül😀')).toBe('Gül');
      expect(toPersonName('Гül')).toBe('ül');
    });

    it('collapses repeated whitespace but keeps a trailing space while typing', () => {
      expect(toPersonName('Ali  Veli')).toBe('Ali Veli');
      expect(toPersonName('Ali ')).toBe('Ali ');
      expect(toPersonName('Ali\nVeli')).toBe('Ali Veli');
    });
  });

  describe('toAddressText', () => {
    it('normalizes styled fonts and keeps address punctuation', () => {
      expect(toAddressText('𝙰𝚔𝚍𝚎𝚗𝚒𝚣 mah. 1 cad. no 132')).toBe(
        'Akdeniz mah. 1 cad. no 132',
      );
    });

    it('drops characters outside the address whitelist', () => {
      expect(toAddressText('Akdeniz mah 😀')).toBe('Akdeniz mah ');
    });
  });

  describe('toPlainText', () => {
    it('normalizes styled fonts in free text', () => {
      expect(toPlainText('𝐁𝐮 ü𝐫ü𝐧 𝐤𝐚ç 𝐛𝐞𝐝𝐞𝐧?')).toBe('Bu ürün kaç beden?');
    });

    it('keeps line breaks, punctuation and emoji', () => {
      expect(toPlainText('Satır1\nSatır2')).toBe('Satır1\nSatır2');
      expect(toPlainText('Güzel ürün 😀 5/5!')).toBe('Güzel ürün 😀 5/5!');
    });
  });
});
