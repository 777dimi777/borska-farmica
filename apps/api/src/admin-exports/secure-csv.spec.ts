import { csvCell, csvDocument } from './secure-csv';
describe('secure CSV', () => {
  it('adds BOM, CRLF and RFC4180 escaping', () => {
    const value = csvDocument(['ime'], [['Žika, "Farma"\nBor']]);
    expect(value.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
    expect(value.toString('utf8')).toBe(
      '\uFEFFime\r\n"Žika, ""Farma""\nBor"\r\n',
    );
  });
  it.each(['=1+1', '+cmd', '-2', '@sum', '\tformula', '\rformula'])(
    'neutralizes formula %s',
    (value) => expect(csvCell(value)).toContain("'" + value),
  );
});
