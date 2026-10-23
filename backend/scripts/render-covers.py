from pathlib import Path
import json
import pypdfium2 as pdfium
out=Path('backend/migrations/sap-covers');out.mkdir(exist_ok=True)
for i in json.loads(Path('backend/migrations/sap-review.json').read_text(encoding='utf-8')):
 if i['name'].lower().endswith('.pdf'):
  doc=pdfium.PdfDocument(i['file']);page=doc[0];image=page.render(scale=1).to_pil();image.thumbnail((700,900));image.save(out/(i['sha256']+'.png'));page.close();doc.close()
print('Rendered PDF covers')
