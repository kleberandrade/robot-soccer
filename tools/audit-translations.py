"""Audit rendered UI copy and controlled errors against the English source.
Code blocks, source filenames and explicit language-independent names stay original.
"""
from html.parser import HTMLParser
from urllib.request import urlopen
from pathlib import Path
import os, re, json, sys
ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:3107').rstrip('/')
PAGES = ['', '/lab', '/compete', '/docs', '/rules', '/privacy', '/terms', '/contributing', '/hardware', '/hardware/case', '/hardware/electronics', '/hardware/firmware'] + ['/docs/' + slug for slug in ['first-match', 'differential-drive', 'camera-and-markers', 'referee-and-restarts', 'getting-started', 'protocol', 'remote-competition', 'architecture', 'private-room-design', 'security', 'verification']]
SKIP = {'script', 'style', 'pre', 'code', 'svg', 'textarea', 'head'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
# Names/autonyms and technical identifiers, not a general English exemption.
NAMES = {'English', 'Español', 'Português (Brasil)', 'robot', 'soccer', 'Hardware', 'hardware', 'Koativa', 'KOATIVA', 'Circuit', 'CIRCUIT', 'Vercel', 'Neon', 'rs-locale', 'ESP32-C3 GPIO', '60 Hz / VSSS'}
COGNATES = {'pt-BR': {'Explore'}, 'es': {'CONTROL', 'Robot'}}
ORIGINAL = [r'^Espressif ESP32-C3-MINI-1$', r'^Toshiba TB6612FNG SSOP24$', r'^Pololu D24V10F[35]$', r'^VSSS.*S.rie A.*2023$', r'^Python / Manifold3D$', r'^[A-Z]{4}(?:-[A-Z]{4}){3}$', r'^[\w.-]+\.(?:cpp|h|ini|ts|json|py|stl|csv|svg|pdf|md)$', r'^(?:[A-Z]{1,8}[0-9]+(?: [A-Z]{1,8}[0-9]+)*|CBULK|PWMA|PWMB|STBY|VCC|GND|LOW|UUID)$']
def clean(text):
    return re.sub(r'\s+', ' ', text).strip()
class Copy(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.text = [], set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if not any(t in SKIP for t in self.stack) and attrs.get('aria-hidden') != 'true':
            for name in ['alt', 'aria-label', 'placeholder', 'title']:
                if attrs.get(name): self.text.add(clean(attrs[name]))
        if tag not in VOID: self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.stack: self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]
    def handle_data(self, text):
        if not any(t in SKIP for t in self.stack) and clean(text): self.text.add(clean(text))
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
def copy(url):
    parser = Copy()
    with urlopen(url, timeout=20) as response: parser.feed(response.read().decode())
    return parser.text
problems = []
for page in PAGES:
    english = copy(BASE + '/en' + page)
    candidates = {text for text in english if re.search(r'[A-Za-z]{3,}', text) and text not in NAMES and not any(re.search(pattern, text) for pattern in ORIGINAL)}
    for locale in ['pt-BR', 'es']:
        for text in sorted((candidates & copy(BASE + '/' + locale + page)) - COGNATES[locale]):
            problems.append({'page': page or '/', 'locale': locale, 'text': text})
errors = set()
for folder in ['apps/web/src', 'apps/web/app/api']:
    for file in (ROOT / folder).rglob('*.ts'):
        errors.update(re.findall(r'(?:new (?:Room)?Error\(\s*(?:\d+,\s*)?|error:\s*)"([^"\n]+)"', file.read_text()))
missing_errors = []
for locale in ['pt-BR', 'es']:
    catalog = json.loads((ROOT / f'apps/web/i18n/{locale}.json').read_text())
    missing_errors += [{'locale': locale, 'text': text} for text in sorted(errors) if not catalog.get(text) or catalog[text] == text]
print(json.dumps({'base': BASE, 'pages': len(PAGES) * 3, 'untranslatedCopy': problems, 'controlledErrors': len(errors), 'untranslatedErrors': missing_errors}, ensure_ascii=False, indent=2))
sys.exit(bool(problems or missing_errors))
