from pathlib import Path
import json,hashlib,zipfile,xml.etree.ElementTree as ET
from pypdf import PdfReader
root=Path('E:/sap hybris'); report=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 data=p.read_bytes(); item={'file':str(p),'name':p.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 try:
  if p.suffix.lower()=='.pdf':
   r=PdfReader(p);item['pages']=len(r.pages);item['text']='\n'.join(page.extract_text() or '' for page in r.pages)
  elif p.suffix.lower() in ['.xlsx','.pptx']:
   with zipfile.ZipFile(p) as z:
    item['text']='\n'.join(' '.join(ET.fromstring(z.read(n)).itertext()) for n in z.namelist() if n.endswith('.xml') and (n.startswith('ppt/slides/slide') or n.startswith('xl/sharedStrings') or n.startswith('xl/worksheets/sheet')))
  elif p.suffix=='.txt':item['text']=data.decode('utf-8',errors='replace')
  elif p.suffix=='.zip':
   with zipfile.ZipFile(p) as z:item['members']=[{'name':n.filename,'bytes':n.file_size,'sha256':hashlib.sha256(z.read(n)).hexdigest()} for n in z.infolist() if not n.is_dir()]
 except Exception as e:item['error']=str(e)
 report.append(item)
Path('backend/migrations/sap-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for i in report: print(i['name'],i.get('pages',''),len(i.get('text','')),i.get('text','')[:450].replace('\n',' '))
