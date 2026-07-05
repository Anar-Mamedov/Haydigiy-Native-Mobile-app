import { mapQuickFilterResponseDto } from './quick-filter.mapper';
import { QuickFilterResponseDto } from './quick-filter.dtos';

const responseDto: QuickFilterResponseDto = {
  status: 'success',
  data: [
    {
      id: 13,
      name: 'Model',
      values: [
        { id: 3332, name: 'Abiye' },
        { id: 18, name: 'Günlük Elbise' },
        { id: 20, name: 'Şık Elbise' },
      ],
    },
    {
      id: 153,
      name: 'Yaka Tipi',
      values: [
        { id: 3359, name: 'Straplez' },
        { id: 3360, name: 'Askılı' },
      ],
    },
  ],
};

describe('mapQuickFilterResponseDto', () => {
  it('maps groups and values from a success payload', () => {
    expect(mapQuickFilterResponseDto(responseDto)).toEqual([
      {
        id: 13,
        name: 'Model',
        values: [
          { id: 3332, name: 'Abiye' },
          { id: 18, name: 'Günlük Elbise' },
          { id: 20, name: 'Şık Elbise' },
        ],
      },
      {
        id: 153,
        name: 'Yaka Tipi',
        values: [
          { id: 3359, name: 'Straplez' },
          { id: 3360, name: 'Askılı' },
        ],
      },
    ]);
  });

  it('returns no groups for missing, failed or malformed payloads', () => {
    expect(mapQuickFilterResponseDto(undefined)).toEqual([]);
    expect(mapQuickFilterResponseDto(null)).toEqual([]);
    expect(mapQuickFilterResponseDto({})).toEqual([]);
    expect(mapQuickFilterResponseDto({ status: 'error', data: responseDto.data })).toEqual([]);
    expect(mapQuickFilterResponseDto({ status: 'success', data: 'oops' as never })).toEqual([]);
  });

  it('drops malformed groups, malformed values and groups left without values', () => {
    const mapped = mapQuickFilterResponseDto({
      status: 'success',
      data: [
        // Valid group with one malformed value that must be dropped.
        {
          id: 134,
          name: 'Boy',
          values: [
            { id: 138, name: 'Dizaltı' },
            { id: 139, name: '   ' },
            { id: '140', name: 'Uzun' } as never,
          ],
        },
        // Groups that must disappear entirely.
        { id: 1, name: 'Boş Grup', values: [] },
        { id: 2, name: '', values: [{ id: 3, name: 'Değer' }] },
        { id: '4', name: 'Bozuk Id', values: [{ id: 5, name: 'Değer' }] } as never,
        null as never,
      ],
    });

    expect(mapped).toEqual([{ id: 134, name: 'Boy', values: [{ id: 138, name: 'Dizaltı' }] }]);
  });
});
