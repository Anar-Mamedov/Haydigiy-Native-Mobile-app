import { mapReturnRejection } from './return-rejection.mapper';
import { ReturnRejectionDto } from './order-detail.dtos';

describe('mapReturnRejection', () => {
  it('returns null when the line was not rejected', () => {
    expect(mapReturnRejection(null)).toBeNull();
    expect(mapReturnRejection(undefined)).toBeNull();
  });

  it('maps the case, its shipment and its photos to the domain shape', () => {
    const dto: ReturnRejectionDto = {
      case_id: 3,
      case_no: ' RET-3 ',
      status: 'return_shipped',
      status_text: 'Kargoya Verildi',
      description: 'Ürün kullanılmış.',
      images: [
        {
          id: 11,
          url: 'https://cdn.example.com/ret/11.jpg',
          description: 'Etiket sökülmüş',
          captured_at: '2027-04-03T10:53:43+00:00',
        },
      ],
      cargo_company: 'PTT Kargo',
      tracking_code: 'PTT123',
      shipment_order_no: 'HG-RET-1',
      shipment_status_id: 3,
      shipment_status_text: 'Kargoda',
    };

    expect(mapReturnRejection(dto)).toEqual({
      caseNo: 'RET-3',
      statusText: 'Kargoya Verildi',
      description: 'Ürün kullanılmış.',
      images: [
        {
          key: '11',
          url: 'https://cdn.example.com/ret/11.jpg',
          description: 'Etiket sökülmüş',
          capturedAt: '03 Nis 2027 - 13:53',
        },
      ],
      cargoCompany: 'PTT Kargo',
      trackingCode: 'PTT123',
      shipmentOrderNo: 'HG-RET-1',
      shipmentStatusText: 'Kargoda',
    });
  });

  // Kırık bir görsel galeride boş kare olarak görünmemeli.
  it('drops photos without a url and tolerates a missing image list', () => {
    const withBrokenPhoto = mapReturnRejection({
      images: [{ id: 1, url: '  ' }, { url: 'https://cdn.example.com/ret/2.jpg' }],
    });
    expect(withBrokenPhoto?.images).toEqual([
      {
        key: 'https://cdn.example.com/ret/2.jpg-1',
        url: 'https://cdn.example.com/ret/2.jpg',
        description: null,
        capturedAt: null,
      },
    ]);

    expect(mapReturnRejection({ case_no: 'RET-4', images: null })?.images).toEqual([]);
  });

  it('turns blank texts into null so empty rows are hidden', () => {
    const rejection = mapReturnRejection({ description: '   ', cargo_company: '', tracking_code: null });

    expect(rejection?.description).toBeNull();
    expect(rejection?.cargoCompany).toBeNull();
    expect(rejection?.trackingCode).toBeNull();
  });
});
